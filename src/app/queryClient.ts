import { QueryClient } from '@tanstack/react-query'

import { QUERY_CLIENT_GC_TIME_MS, QUERY_CLIENT_STALE_TIME_MS } from './constants'
import { handleQueryError, shouldRetryRequest } from './query/errorHandling'
import { notifyQueryError } from './query/errorNotifier'
import type { Logger } from './logging/logger'

const createOnQueryError =
  (logger?: Logger) =>
  (error: unknown): void => {
    notifyQueryError(handleQueryError(error))
    logger?.error(error, { source: 'react-query' })
  }

const retryStrategy = (failureCount: number, error: unknown): boolean => shouldRetryRequest(failureCount, error)

export const createAppQueryClient = (logger?: Logger): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CLIENT_STALE_TIME_MS,
        gcTime: QUERY_CLIENT_GC_TIME_MS,
        refetchOnWindowFocus: false,
        retry: retryStrategy,
        onError: createOnQueryError(logger),
      },
      mutations: {
        retry: retryStrategy,
        onError: createOnQueryError(logger),
      },
    },
  })

