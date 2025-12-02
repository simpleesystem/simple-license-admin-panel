import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { APP_CONFIG, AppConfigProvider, createAppConfig, useAppConfig, useFeatureFlag } from '../../../src/app/config'
import {
  ENV_VAR_API_BASE_URL,
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

  it('throws when required env variables are missing', () => {
    expect(() => createAppConfig(createEnv({ [ENV_VAR_API_BASE_URL]: undefined }))).toThrow(/Invalid application/)
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

