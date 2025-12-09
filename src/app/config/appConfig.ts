import { z } from 'zod'

import {
  APP_HTTP_RETRY_ATTEMPTS,
  APP_HTTP_RETRY_DELAY_MS,
  APP_HTTP_TIMEOUT_MS,
  APP_WS_HEALTH_PATH,
  ENV_VAR_API_BASE_URL,
  ENV_VAR_FEATURE_DEV_TOOLS,
  ENV_VAR_FEATURE_EXPERIMENTAL_FILTERS,
  ENV_VAR_FEATURE_QUERY_CACHE_PERSISTENCE,
  ENV_VAR_AUTH_FORGOT_PASSWORD_URL,
  ENV_VAR_HTTP_RETRY_ATTEMPTS,
  ENV_VAR_HTTP_RETRY_DELAY_MS,
  ENV_VAR_HTTP_TIMEOUT_MS,
  ENV_VAR_SENTRY_DSN,
  ENV_VAR_WS_PATH,
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

const envSchema = z.object({
  [ENV_VAR_API_BASE_URL]: z.string().url(),
  [ENV_VAR_SENTRY_DSN]: z.string().url().optional().or(z.literal('')).optional(),
  [ENV_VAR_AUTH_FORGOT_PASSWORD_URL]: z.string().url().optional().or(z.literal('')).optional(),
  [ENV_VAR_HTTP_TIMEOUT_MS]: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => value === undefined || value === '' || (!Number.isNaN(Number(value)) && Number(value) > 0),
      'HTTP timeout must be a positive number in milliseconds'
    ),
  [ENV_VAR_HTTP_RETRY_ATTEMPTS]: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => value === undefined || value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      'HTTP retry attempts must be zero or a positive integer'
    ),
  [ENV_VAR_HTTP_RETRY_DELAY_MS]: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => value === undefined || value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      'HTTP retry delay must be zero or a positive number in milliseconds'
    ),
  [ENV_VAR_WS_PATH]: z.string().optional().or(z.literal('')).optional(),
})

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
  wsPath: string
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
  const parsed = envSchema.safeParse(env)

  if (!parsed.success) {
    const issueMessages = parsed.error.issues.map((issue) => issue.message)
    const message = issueMessages.length > 0 ? issueMessages.join(', ') : parsed.error.message
    throw new Error(`${ERROR_PREFIX}: ${message}`)
  }

  const apiBaseUrl = parsed.data[ENV_VAR_API_BASE_URL]
  if (!/^https?:\/\//i.test(apiBaseUrl)) {
    throw new Error(`${ERROR_PREFIX}: API base URL must use http or https`)
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
  const wsEnv = env[ENV_VAR_WS_PATH]
  const wsPath = wsEnv?.trim().length ? wsEnv.trim() : APP_WS_HEALTH_PATH

  return {
    apiBaseUrl,
    sentryDsn: normalizeOptionalUrl(parsed.data[ENV_VAR_SENTRY_DSN]),
    authForgotPasswordUrl: normalizeOptionalUrl(parsed.data[ENV_VAR_AUTH_FORGOT_PASSWORD_URL]),
    httpTimeoutMs,
    httpRetryAttempts,
    httpRetryDelayMs,
    wsPath,
    features: flags,
  }
}

export const APP_CONFIG: AppConfig = createAppConfig()
