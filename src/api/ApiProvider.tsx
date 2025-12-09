import { AxiosHttpClient, Client as SimpleLicenseClient } from '@simple-license/react-sdk'
import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { useAppConfig } from '../app/config'
import { useLogger } from '../app/logging/loggerContext'
import { ApiContext } from './apiContext'

export function ApiProvider({ children }: PropsWithChildren) {
  const { apiBaseUrl, httpTimeoutMs, httpRetryAttempts, httpRetryDelayMs } = useAppConfig()
  const logger = useLogger()

  const value = useMemo(() => {
    const httpClient = new AxiosHttpClient(apiBaseUrl, httpTimeoutMs / 1000, {
      retryAttempts: httpRetryAttempts,
      retryDelayMs: httpRetryDelayMs,
      onResponse: (payload) =>
        logger.debug('http:response', {
          method: payload.method,
          url: payload.url ?? 'unknown',
          status: payload.status ?? -1,
          durationMs: payload.durationMs,
          requestId: payload.requestId,
          correlationId: payload.correlationId,
        }),
      onError: (payload) =>
        logger.warn('http:error', {
          method: payload.method,
          url: payload.url ?? 'unknown',
          status: payload.status ?? -1,
          durationMs: payload.durationMs,
          requestId: payload.requestId,
          correlationId: payload.correlationId,
          attempt: payload.attempt,
          error: payload.error instanceof Error ? payload.error.message : String(payload.error),
        }),
    })
    return new SimpleLicenseClient(apiBaseUrl, httpClient)
  }, [apiBaseUrl, httpRetryAttempts, httpRetryDelayMs, httpTimeoutMs, logger])

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
