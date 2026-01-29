import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sentryLoggerMock = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}))
const createSentryLoggerMock = vi.hoisted(() => vi.fn(() => sentryLoggerMock))

vi.mock('../../../src/app/logging/sentryLogger', () => ({
  createSentryLogger: createSentryLoggerMock,
}))

import type { AppConfig } from '../../../src/app/config/appConfig'
import { createAppLogger, createNoopLogger } from '../../../src/app/logging/logger'

const baseConfig: AppConfig = {
  apiBaseUrl: 'https://api.example.com',
  sentryDsn: null,
  features: {
    enableDevTools: false,
    enableExperimentalFilters: false,
    enableQueryCachePersistence: false,
  },
}

describe('createAppLogger', () => {
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  }

  beforeEach(() => {
    console.debug = vi.fn()
    console.info = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    sentryLoggerMock.debug.mockClear()
    sentryLoggerMock.info.mockClear()
    sentryLoggerMock.warn.mockClear()
    sentryLoggerMock.error.mockClear()
    createSentryLoggerMock.mockClear()
  })

  afterEach(() => {
    console.debug = originalConsole.debug
    console.info = originalConsole.info
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })

  it('logs messages to the console transport', () => {
    const logger = createAppLogger(baseConfig)

    logger.debug('debug-message', { feature: 'auth' })
    logger.info('info-message')
    logger.warn('warn-message')
    logger.error(new Error('boom'), { scope: 'test' })

    expect(console.debug).toHaveBeenCalledWith('debug-message', { feature: 'auth' })
    expect(console.info).toHaveBeenCalledWith('info-message', undefined)
    expect(console.warn).toHaveBeenCalledWith('warn-message', undefined)
    expect(console.error).toHaveBeenCalled()
  })

  it('adds a sentry transport when a DSN is provided', () => {
    const logger = createAppLogger(
      {
        ...baseConfig,
        sentryDsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      },
      { enableSentry: true }
    )

    logger.info('tracked')
    logger.debug('trace')
    logger.warn('heads-up')
    logger.error(new Error('capture'))

    expect(createSentryLoggerMock).toHaveBeenCalled()
    expect(sentryLoggerMock.debug).toHaveBeenCalledWith('trace', undefined)
    expect(sentryLoggerMock.info).toHaveBeenCalledWith('tracked', undefined)
    expect(sentryLoggerMock.warn).toHaveBeenCalledWith('heads-up', undefined)
    expect(sentryLoggerMock.error).toHaveBeenCalled()
  })

  it('provides a noop logger helper', () => {
    const logger = createNoopLogger()

    expect(() => logger.debug('noop')).not.toThrow()
    expect(() => logger.error(new Error('noop-error'))).not.toThrow()
  })
})
