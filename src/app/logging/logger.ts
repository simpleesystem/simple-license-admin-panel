import type { AppConfig } from '../config/appConfig'
import { createSentryLogger } from './sentryLogger'

export type LoggerMetadata = Record<string, unknown>

export type Logger = {
  debug(message: string, metadata?: LoggerMetadata): void
  info(message: string, metadata?: LoggerMetadata): void
  warn(message: string, metadata?: LoggerMetadata): void
  error(error: unknown, metadata?: LoggerMetadata): void
}

const formatMetadata = (metadata?: LoggerMetadata) => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return undefined
  }
  return metadata
}

export const createNoopLogger = (): Logger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
})

export const createConsoleLogger = (): Logger => ({
  debug: (message, metadata) => {
    console.debug(message, formatMetadata(metadata))
  },
  info: (message, metadata) => {
    console.info(message, formatMetadata(metadata))
  },
  warn: (message, metadata) => {
    console.warn(message, formatMetadata(metadata))
  },
  error: (error, metadata) => {
    console.error(error, formatMetadata(metadata))
  },
})

export const createCompositeLogger = (loggers: Logger[]): Logger => ({
  debug: (message, metadata) => {
    loggers.forEach((logger) => logger.debug(message, metadata))
  },
  info: (message, metadata) => {
    loggers.forEach((logger) => logger.info(message, metadata))
  },
  warn: (message, metadata) => {
    loggers.forEach((logger) => logger.warn(message, metadata))
  },
  error: (error, metadata) => {
    loggers.forEach((logger) => logger.error(error, metadata))
  },
})

export type LoggerOptions = {
  enableSentry?: boolean
}

export const createAppLogger = (config: AppConfig, options?: LoggerOptions): Logger => {
  const transports: Logger[] = [createConsoleLogger()]
  const shouldEnableSentry = options?.enableSentry ?? import.meta.env.MODE !== 'test'

  if (config.sentryDsn && shouldEnableSentry) {
    transports.push(createSentryLogger(config.sentryDsn))
  }

  if (transports.length === 1) {
    return transports[0]
  }

  return createCompositeLogger(transports)
}
