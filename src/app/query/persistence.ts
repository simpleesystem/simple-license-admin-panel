import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import type { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { getSafeLocalStorage } from '@/app/state/safeStorage'

export const QUERY_CACHE_STORAGE_KEY = 'simple-license-admin-query-cache'
const QUERY_CACHE_MAX_AGE_MS = 1000 * 60 * 5
const QUERY_CACHE_BUSTER = 'v1'

// Accessing window.localStorage can itself throw in restricted environments
// (Safari private mode, sandboxed iframes); degrade to no persistence.
const getDefaultStorage = (): Storage | null => getSafeLocalStorage()

/**
 * Remove the persisted query cache from storage. Called on logout / idle
 * timeout so a shared machine cannot surface the previous session's cached
 * admin data (licenses, users, analytics) to the next user.
 */
export const clearPersistedQueryCache = (storage: Storage | null = getDefaultStorage()): void => {
  if (!storage) {
    return
  }
  try {
    storage.removeItem(QUERY_CACHE_STORAGE_KEY)
  } catch {
    // Best-effort: storage access can throw in restricted environments.
  }
}

export const enableQueryCachePersistence = (
  queryClient: QueryClient,
  storage: Storage | null = getDefaultStorage()
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
