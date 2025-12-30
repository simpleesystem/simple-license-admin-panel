import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { APP_CONFIG, AppConfigProvider, createAppConfig, useAppConfig, useFeatureFlag } from '../../../src/app/config'
import {
  ENV_VAR_API_BASE_URL,
  ENV_VAR_AUTH_FORGOT_PASSWORD_URL,
  ENV_VAR_FEATURE_DEV_TOOLS,
  ENV_VAR_FEATURE_EXPERIMENTAL_FILTERS,
  ENV_VAR_FEATURE_QUERY_CACHE_PERSISTENCE,
  ENV_VAR_SENTRY_DSN,
} from '../../../src/app/constants'

const createEnv = (overrides: Record<string, string | undefined> = {}) =>
  ({
    [ENV_VAR_API_BASE_URL]: 'https://api.example.com',
    [ENV_VAR_SENTRY_DSN]: 'https://sentry.example.com/1',
    [ENV_VAR_FEATURE_DEV_TOOLS]: 'true',
    [ENV_VAR_FEATURE_QUERY_CACHE_PERSISTENCE]: 'false',
    [ENV_VAR_FEATURE_EXPERIMENTAL_FILTERS]: '1',
    ...overrides,
  }) as Record<string, string | undefined>

describe('createAppConfig', () => {
  it('parses required values and feature flags', () => {
    const config = createAppConfig(createEnv())

    expect(config.apiBaseUrl).toBe('https://api.example.com')
    expect(config.sentryDsn).toBe('https://sentry.example.com/1')
    expect(config.features).toEqual({
      enableDevTools: true,
      enableQueryCachePersistence: false,
      enableExperimentalFilters: true,
    })
  })

  it('returns null for optional sentry DSN', () => {
    const config = createAppConfig(createEnv({ [ENV_VAR_SENTRY_DSN]: '' }))
    expect(config.sentryDsn).toBeNull()
  })

  it('uses default API base URL when env variable is missing', () => {
    const config = createAppConfig(createEnv({ [ENV_VAR_API_BASE_URL]: undefined }))
    // Should use DEFAULT_API_BASE_URL fallback, not throw
    expect(config.apiBaseUrl).toBeDefined()
    expect(typeof config.apiBaseUrl).toBe('string')
  })

  it('parses boolean feature flags correctly', () => {
    const config1 = createAppConfig(createEnv({ [ENV_VAR_FEATURE_DEV_TOOLS]: 'true' }))
    expect(config1.features.enableDevTools).toBe(true)

    const config2 = createAppConfig(createEnv({ [ENV_VAR_FEATURE_DEV_TOOLS]: '1' }))
    expect(config2.features.enableDevTools).toBe(true)

    const config3 = createAppConfig(createEnv({ [ENV_VAR_FEATURE_DEV_TOOLS]: 'yes' }))
    expect(config3.features.enableDevTools).toBe(true)

    const config4 = createAppConfig(createEnv({ [ENV_VAR_FEATURE_DEV_TOOLS]: 'on' }))
    expect(config4.features.enableDevTools).toBe(true)

    const config5 = createAppConfig(createEnv({ [ENV_VAR_FEATURE_DEV_TOOLS]: 'false' }))
    expect(config5.features.enableDevTools).toBe(false)

    const config6 = createAppConfig(createEnv({ [ENV_VAR_FEATURE_DEV_TOOLS]: undefined }))
    expect(config6.features.enableDevTools).toBe(false)
  })

  it('parses HTTP timeout with defaults', () => {
    const config = createAppConfig(createEnv())
    expect(config.httpTimeoutMs).toBeGreaterThan(0)
    expect(typeof config.httpTimeoutMs).toBe('number')
  })

  it('parses HTTP retry attempts with defaults', () => {
    const config = createAppConfig(createEnv())
    expect(config.httpRetryAttempts).toBeGreaterThanOrEqual(0)
    expect(typeof config.httpRetryAttempts).toBe('number')
  })

  it('parses HTTP retry delay with defaults', () => {
    const config = createAppConfig(createEnv())
    expect(config.httpRetryDelayMs).toBeGreaterThan(0)
    expect(typeof config.httpRetryDelayMs).toBe('number')
  })

  it('allows empty string for API base URL', () => {
    const config = createAppConfig(createEnv({ [ENV_VAR_API_BASE_URL]: '' }))
    expect(config.apiBaseUrl).toBe('')
  })

  it('normalizes optional URLs correctly', () => {
    const config1 = createAppConfig(createEnv({ [ENV_VAR_AUTH_FORGOT_PASSWORD_URL]: 'https://example.com/reset' }))
    expect(config1.authForgotPasswordUrl).toBe('https://example.com/reset')

    const config2 = createAppConfig(createEnv({ [ENV_VAR_AUTH_FORGOT_PASSWORD_URL]: '' }))
    expect(config2.authForgotPasswordUrl).toBeNull()

    const config3 = createAppConfig(createEnv({ [ENV_VAR_AUTH_FORGOT_PASSWORD_URL]: undefined }))
    expect(config3.authForgotPasswordUrl).toBeNull()
  })

  it('throws error for invalid API base URL format', () => {
    expect(() => {
      createAppConfig(createEnv({ [ENV_VAR_API_BASE_URL]: 'invalid-url' }))
    }).toThrow()
  })

  it('throws error for invalid HTTP timeout', () => {
    expect(() => {
      createAppConfig(createEnv({ [ENV_VAR_HTTP_TIMEOUT_MS]: '-1' }))
    }).toThrow()
  })

  it('throws error for invalid HTTP retry attempts', () => {
    expect(() => {
      createAppConfig(createEnv({ [ENV_VAR_HTTP_RETRY_ATTEMPTS]: '-1' }))
    }).toThrow()
  })

  it('throws error for invalid HTTP retry delay', () => {
    expect(() => {
      createAppConfig(createEnv({ [ENV_VAR_HTTP_RETRY_DELAY_MS]: '-1' }))
    }).toThrow()
  })
})

describe('AppConfig hooks', () => {
  it('exposes APP_CONFIG by default', () => {
    const { result } = renderHook(() => useAppConfig(), {
      wrapper: ({ children }) => <AppConfigProvider>{children}</AppConfigProvider>,
    })

    expect(result.current.apiBaseUrl).toBe(APP_CONFIG.apiBaseUrl)
  })

  it('falls back to the default config when no provider is present', () => {
    const { result } = renderHook(() => useAppConfig())
    expect(result.current).toBe(APP_CONFIG)
  })

  it('returns false for disabled feature flags by default', () => {
    const { result } = renderHook(() => useFeatureFlag('enableDevTools'))
    expect(result.current).toBe(false)
  })

  it('reads feature flags from the provider value', () => {
    const customConfig = {
      ...APP_CONFIG,
      features: {
        enableDevTools: true,
        enableQueryCachePersistence: true,
        enableExperimentalFilters: false,
      },
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppConfigProvider value={customConfig}>{children}</AppConfigProvider>
    )

    const { result: devToolsFlag } = renderHook(() => useFeatureFlag('enableDevTools'), { wrapper })
    const { result: cacheFlag } = renderHook(() => useFeatureFlag('enableQueryCachePersistence'), { wrapper })
    const { result: experimentalFlag } = renderHook(() => useFeatureFlag('enableExperimentalFilters'), { wrapper })

    expect(devToolsFlag.current).toBe(true)
    expect(cacheFlag.current).toBe(true)
    expect(experimentalFlag.current).toBe(false)
  })
})
