import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import type { Logger } from '../../../src/app/logging/logger'
import { LoggerContext, useLogger } from '../../../src/app/logging/loggerContext'

const createLogger = (): Logger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
})

describe('logger context', () => {
  it('returns a fallback logger when used outside of the provider', () => {
    const { result } = renderHook(() => useLogger())
    // Should return a logger instance (fallback), not throw
    expect(result.current).toBeDefined()
    expect(typeof result.current.debug).toBe('function')
    expect(typeof result.current.info).toBe('function')
    expect(typeof result.current.warn).toBe('function')
    expect(typeof result.current.error).toBe('function')
  })

  it('returns the injected logger instance', () => {
    const logger = createLogger()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>
    )

    const { result } = renderHook(() => useLogger(), { wrapper })

    expect(result.current).toBe(logger)
  })
})
