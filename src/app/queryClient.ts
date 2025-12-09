import { type DefaultOptions, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { QUERY_CLIENT_GC_TIME_MS, QUERY_CLIENT_STALE_TIME_MS } from './constants'
import { mapUnknownToAppError } from './errors/appErrors'
import { createConsoleLogger } from './logging/logger'
import { shouldRetryRequest } from './query/errorHandling'
import { coerceScopeFromMeta } from './query/scope'
import { useAppStore } from './state/store'

const queryLogger = createConsoleLogger()

const retryStrategy = (failureCount: number, error: unknown): boolean => shouldRetryRequest(failureCount, error)

const buildDefaultOptions = (): DefaultOptions => ({
  queries: {
    staleTime: QUERY_CLIENT_STALE_TIME_MS,
    gcTime: QUERY_CLIENT_GC_TIME_MS,
    refetchOnWindowFocus: false,
    retry: retryStrategy,
    meta: {
      scope: 'data',
    },
  },
  mutations: {
    retry: retryStrategy,
    meta: {
      scope: 'data',
    },
  },
})

const dispatchError = (error: unknown, scope: string) => {
  const dispatch = useAppStore.getState().dispatch
  const appError = mapUnknownToAppError(error, scope)
  dispatch({
    type: 'error/raise',
    payload: appError,
  })
  queryLogger.warn('query:error', {
    type: appError.type,
    code: appError.code,
    status: appError.status,
    requestId: appError.requestId,
    scope: appError.scope,
  })
}

export const createAppQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: buildDefaultOptions(),
    queryCache: new QueryCache({
      onError: (error, query) => {
        const scope = coerceScopeFromMeta(query?.meta, query?.queryKey)
        dispatchError(error, scope)
      },
      onSuccess: (_data, query) => {
        const scope = coerceScopeFromMeta(query?.meta, query?.queryKey)
        const dispatch = useAppStore.getState().dispatch
        dispatch({ type: 'loading/set', scope, isLoading: false })
      },
      onSettled: (_data, _error, query) => {
        const scope = coerceScopeFromMeta(query?.meta, query?.queryKey)
        const dispatch = useAppStore.getState().dispatch
        dispatch({ type: 'loading/set', scope, isLoading: false })
      },
      onFetch: (query) => {
        const scope = coerceScopeFromMeta(query?.meta, query?.queryKey)
        const dispatch = useAppStore.getState().dispatch
        dispatch({ type: 'loading/set', scope, isLoading: true })
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const scope = coerceScopeFromMeta(mutation?.meta, mutation?.options?.mutationKey)
        dispatchError(error, scope)
      },
      onMutate: (_variables, _mutation, context) => {
        const scope = coerceScopeFromMeta(context?.meta)
        const dispatch = useAppStore.getState().dispatch
        dispatch({ type: 'loading/set', scope, isLoading: true })
      },
      onSettled: (_data, _error, _variables, context) => {
        const scope = coerceScopeFromMeta(context?.meta)
        const dispatch = useAppStore.getState().dispatch
        dispatch({ type: 'loading/set', scope, isLoading: false })
      },
    }),
  })
}
