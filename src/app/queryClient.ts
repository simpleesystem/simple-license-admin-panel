import { MutationCache, QueryCache, QueryClient, type DefaultOptions } from '@tanstack/react-query'

import { QUERY_CLIENT_GC_TIME_MS, QUERY_CLIENT_STALE_TIME_MS } from './constants'
import { handleQueryError, shouldRetryRequest } from './query/errorHandling'
import { notifyQueryError } from './query/errorNotifier'
import type { Logger } from './logging/logger'
import { publishQueryError, type QueryEventBus } from './query/events'

const retryStrategy = (failureCount: number, error: unknown): boolean => shouldRetryRequest(failureCount, error)

const createErrorHandler =
  (logger?: Logger, queryEvents?: QueryEventBus) =>
  (error: unknown): void => {
    if (queryEvents) {
      publishQueryError(queryEvents, error)
    }
    notifyQueryError(handleQueryError(error))
    logger?.error(error, { source: 'react-query' })
  }

const buildDefaultOptions = (): DefaultOptions => ({
  queries: {
    staleTime: QUERY_CLIENT_STALE_TIME_MS,
    gcTime: QUERY_CLIENT_GC_TIME_MS,
    refetchOnWindowFocus: false,
    retry: retryStrategy,
  },
  mutations: {
    retry: retryStrategy,
  },
})

export const createAppQueryClient = (logger?: Logger, queryEvents?: QueryEventBus): QueryClient => {
  const handleError = createErrorHandler(logger, queryEvents)

  const queryCache = new QueryCache({
    onError: (error) => {
      handleError(error)
    },
  })

  const mutationCache = new MutationCache({
    onError: (error) => {
      handleError(error)
    },
  })

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: buildDefaultOptions(),
  })
}


