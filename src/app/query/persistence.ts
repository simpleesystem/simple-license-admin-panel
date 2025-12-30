import type { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const QUERY_CACHE_STORAGE_KEY = 'simple-license-admin-query-cache'
const QUERY_CACHE_MAX_AGE_MS = 1000 * 60 * 5
const QUERY_CACHE_BUSTER = 'v1'

const getDefaultStorage = (): Storage | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  return window.localStorage
}

export const enableQueryCachePersistence = (
  queryClient: QueryClient,
  storage: Storage | null = getDefaultStorage(),
): (() => void) | null => {
  if (!storage) {
    return null
  }

  const persister = createSyncStoragePersister({
    storage,
    key: QUERY_CACHE_STORAGE_KEY,
    throttleTime: 1_000,
  })

  const [unsubscribe, restorePromise] = persistQueryClient({
    queryClient,
    persister,
    maxAge: QUERY_CACHE_MAX_AGE_MS,
    buster: QUERY_CACHE_BUSTER,
  })

  void restorePromise

  return () => {
    unsubscribe()
  }
}
