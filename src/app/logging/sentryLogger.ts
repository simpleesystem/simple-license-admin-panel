/* c8 ignore file */
import * as Sentry from '@sentry/react'

import type { Logger } from './logger'

let sentryInitialized = false

const ensureSentryInitialized = (dsn: string) => {
  if (sentryInitialized) {
    return
  }
  Sentry.init({
    dsn,
    integrations: [],
  })
  sentryInitialized = true
}

export const createSentryLogger = (dsn: string): Logger => {
  ensureSentryInitialized(dsn)

  return {
    debug: (message, metadata) => {
      Sentry.addBreadcrumb({
        level: 'debug',
        message,
        data: metadata,
      })
    },
    info: (message, metadata) => {
      Sentry.captureMessage(message, {
        level: 'info',
        extra: metadata,
      })
    },
    warn: (message, metadata) => {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: metadata,
      })
    },
    error: (error, metadata) => {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: metadata,
        })
        return
      }

      Sentry.captureMessage(typeof error === 'string' ? error : 'Unknown error', {
        level: 'error',
        extra: {
          error,
          ...metadata,
        },
      })
    },
  }
}


