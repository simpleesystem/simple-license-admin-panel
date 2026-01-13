import Joi from 'joi'

import {
  APP_HTTP_RETRY_ATTEMPTS,
  APP_HTTP_RETRY_DELAY_MS,
  APP_HTTP_TIMEOUT_MS,
  DEFAULT_API_BASE_URL,
  ENV_VAR_API_BASE_URL,
  ENV_VAR_AUTH_FORGOT_PASSWORD_URL,
  ENV_VAR_FEATURE_DEV_TOOLS,
  ENV_VAR_FEATURE_EXPERIMENTAL_FILTERS,
  ENV_VAR_FEATURE_QUERY_CACHE_PERSISTENCE,
  ENV_VAR_HTTP_RETRY_ATTEMPTS,
  ENV_VAR_HTTP_RETRY_DELAY_MS,
  ENV_VAR_HTTP_TIMEOUT_MS,
  ENV_VAR_SENTRY_DSN,
} from '../constants'

type EnvRecord = Record<string, string | undefined>

const booleanFromEnv = (value: string | undefined): boolean => {
  if (!value) {
    return false
  }
  const normalized = value.trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on'
}

const normalizeOptionalUrl = (value: string | undefined): string | null => {
  if (!value || value.trim().length === 0) {
    return null
  }
  return value
}

// Custom validators
const positiveNumberValidator = (value: string, helpers: Joi.CustomHelpers) => {
  if (value === undefined || value === '') {
    return value
  }
  const num = Number(value)
  if (Number.isNaN(num) || num <= 0) {
    return helpers.error('any.invalid')
  }
  return value
}

const nonNegativeIntegerValidator = (value: string, helpers: Joi.CustomHelpers) => {
  if (value === undefined || value === '') {
    return value
  }
  const num = Number(value)
  if (Number.isNaN(num) || num < 0) {
    return helpers.error('any.invalid')
  }
  return value
}

const apiBaseUrlValidator = (value: string, helpers: Joi.CustomHelpers) => {
  if (value === undefined || value === '') {
    return value
  }
  // Allow empty strings, valid URIs (http:// or https://), or relative paths starting with /
  const trimmed = value.trim()
  if (trimmed === '') {
    return value
  }
  // If it's a relative path starting with /, allow it
  if (/^\//.test(trimmed)) {
    return value
  }
  // If it looks like a URI, validate it's actually a valid URI
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      // Use URL constructor to validate it's a proper URI
      new URL(trimmed)
      return value
    } catch {
      return helpers.error('string.uri', {
        message: 'must be a valid URI (http:// or https://), a relative path starting with /, or empty',
      })
    }
  }
  // Anything else is invalid
  return helpers.error('string.base', {
    message: 'must be a valid URI (http:// or https://), a relative path starting with /, or empty',
  })
}

const envSchema = Joi.object({
  [ENV_VAR_API_BASE_URL]: Joi.string()
    .allow('')
    .optional()
    .custom(apiBaseUrlValidator)
    .message('API base URL must be a valid URI (http:// or https://), a relative path starting with /, or empty'),
  [ENV_VAR_SENTRY_DSN]: Joi.string().uri().allow('').optional(),
  [ENV_VAR_AUTH_FORGOT_PASSWORD_URL]: Joi.string().uri().allow('').optional(),
  [ENV_VAR_HTTP_TIMEOUT_MS]: Joi.string()
    .allow('')
    .optional()
    .custom(positiveNumberValidator)
    .message('HTTP timeout must be a positive number in milliseconds'),
  [ENV_VAR_HTTP_RETRY_ATTEMPTS]: Joi.string()
    .allow('')
    .optional()
    .custom(nonNegativeIntegerValidator)
    .message('HTTP retry attempts must be zero or a positive integer'),
  [ENV_VAR_HTTP_RETRY_DELAY_MS]: Joi.string()
    .allow('')
    .optional()
    .custom(positiveNumberValidator)
    .message('HTTP retry delay must be zero or a positive number in milliseconds'),
}).unknown(true)

const ERROR_PREFIX = 'Invalid application environment configuration'

export const FEATURE_FLAG_KEYS = ['enableDevTools', 'enableQueryCachePersistence', 'enableExperimentalFilters'] as const

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number]

export type FeatureFlags = Record<FeatureFlagKey, boolean>

export type AppConfig = {
  apiBaseUrl: string
  sentryDsn: string | null
  authForgotPasswordUrl: string | null
  httpTimeoutMs: number
  httpRetryAttempts: number
  httpRetryDelayMs: number
  features: FeatureFlags
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableDevTools: false,
  enableQueryCachePersistence: false,
  enableExperimentalFilters: false,
}

const coercePositiveNumber = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value === null || value === '') {
    return fallback
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const createAppConfig = (env: EnvRecord = import.meta.env as EnvRecord): AppConfig => {
  const { error, value } = envSchema.validate(env)

  if (error) {
    const issueMessages = error.details.map((issue) => issue.message)
    const message = issueMessages.length > 0 ? issueMessages.join(', ') : error.message
    throw new Error(`${ERROR_PREFIX}: ${message}`)
  }

  const apiBaseUrl =
    value[ENV_VAR_API_BASE_URL] && value[ENV_VAR_API_BASE_URL] !== ''
      ? value[ENV_VAR_API_BASE_URL]
      : DEFAULT_API_BASE_URL

  // Allow empty string, valid URIs (http:// or https://), or relative paths starting with /
  if (
    apiBaseUrl !== '' &&
    !/^https?:\/\//i.test(apiBaseUrl) &&
    !/^\//.test(apiBaseUrl)
  ) {
    throw new Error(
      `${ERROR_PREFIX}: API base URL must be a valid URI (http:// or https://), a relative path starting with /, or empty`
    )
  }

  const flags: FeatureFlags = {
    enableDevTools: booleanFromEnv(env[ENV_VAR_FEATURE_DEV_TOOLS]) || DEFAULT_FEATURE_FLAGS.enableDevTools,
    enableQueryCachePersistence:
      booleanFromEnv(env[ENV_VAR_FEATURE_QUERY_CACHE_PERSISTENCE]) || DEFAULT_FEATURE_FLAGS.enableQueryCachePersistence,
    enableExperimentalFilters:
      booleanFromEnv(env[ENV_VAR_FEATURE_EXPERIMENTAL_FILTERS]) || DEFAULT_FEATURE_FLAGS.enableExperimentalFilters,
  }

  const httpTimeoutMs = coercePositiveNumber(env[ENV_VAR_HTTP_TIMEOUT_MS], APP_HTTP_TIMEOUT_MS)
  const httpRetryAttempts = Math.max(
    0,
    Math.floor(coercePositiveNumber(env[ENV_VAR_HTTP_RETRY_ATTEMPTS], APP_HTTP_RETRY_ATTEMPTS))
  )
  const httpRetryDelayMs = coercePositiveNumber(env[ENV_VAR_HTTP_RETRY_DELAY_MS], APP_HTTP_RETRY_DELAY_MS)

  return {
    apiBaseUrl,
    sentryDsn: normalizeOptionalUrl(value[ENV_VAR_SENTRY_DSN]),
    authForgotPasswordUrl: normalizeOptionalUrl(value[ENV_VAR_AUTH_FORGOT_PASSWORD_URL]),
    httpTimeoutMs,
    httpRetryAttempts,
    httpRetryDelayMs,
    features: flags,
  }
}

export const APP_CONFIG: AppConfig = createAppConfig()
