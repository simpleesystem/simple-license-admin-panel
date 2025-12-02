import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoggerContext, useLogger } from '../../../src/app/logging/loggerContext'
import type { Logger } from '../../../src/app/logging/logger'

const createLogger = (): Logger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
})

describe('logger context', () => {
  it('throws when used outside of the provider', () => {
    expect(() => renderHook(() => useLogger())).toThrow(/Logger context/)
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


