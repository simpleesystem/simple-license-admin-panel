import { z } from 'zod'

import {
  ENV_VAR_API_BASE_URL,
  ENV_VAR_FEATURE_DEV_TOOLS,
  ENV_VAR_FEATURE_EXPERIMENTAL_FILTERS,
  ENV_VAR_FEATURE_QUERY_CACHE_PERSISTENCE,
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

const envSchema = z.object({
  [ENV_VAR_API_BASE_URL]: z.string().url(),
  [ENV_VAR_SENTRY_DSN]: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .optional(),
})

const ERROR_PREFIX = 'Invalid application environment configuration'

export const FEATURE_FLAG_KEYS = ['enableDevTools', 'enableQueryCachePersistence', 'enableExperimentalFilters'] as const

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number]

export type FeatureFlags = Record<FeatureFlagKey, boolean>

export type AppConfig = {
  apiBaseUrl: string
  sentryDsn: string | null
  features: FeatureFlags
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableDevTools: false,
  enableQueryCachePersistence: false,
  enableExperimentalFilters: false,
}

export const createAppConfig = (env: EnvRecord = import.meta.env as EnvRecord): AppConfig => {
  const parsed = envSchema.safeParse(env)

  if (!parsed.success) {
    const issueMessages = parsed.error.issues.map((issue) => issue.message)
    const message = issueMessages.length > 0 ? issueMessages.join(', ') : parsed.error.message
    throw new Error(`${ERROR_PREFIX}: ${message}`)
  }

  const flags: FeatureFlags = {
    enableDevTools: booleanFromEnv(env[ENV_VAR_FEATURE_DEV_TOOLS]) || DEFAULT_FEATURE_FLAGS.enableDevTools,
    enableQueryCachePersistence:
      booleanFromEnv(env[ENV_VAR_FEATURE_QUERY_CACHE_PERSISTENCE]) || DEFAULT_FEATURE_FLAGS.enableQueryCachePersistence,
    enableExperimentalFilters:
      booleanFromEnv(env[ENV_VAR_FEATURE_EXPERIMENTAL_FILTERS]) || DEFAULT_FEATURE_FLAGS.enableExperimentalFilters,
  }

  return {
    apiBaseUrl: parsed.data[ENV_VAR_API_BASE_URL],
    sentryDsn: normalizeOptionalUrl(parsed.data[ENV_VAR_SENTRY_DSN]),
    features: flags,
  }
}

export const APP_CONFIG: AppConfig = createAppConfig()

