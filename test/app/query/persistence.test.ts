import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const unsubscribeMock = vi.fn()
  const persistQueryClientMock = vi.fn(() => [unsubscribeMock, Promise.resolve()])
  const createSyncStoragePersisterMock = vi.fn(() => ({
    persistClient: vi.fn(),
    restoreClient: vi.fn(),
    removeClient: vi.fn(),
  }))
  return {
    unsubscribeMock,
    persistQueryClientMock,
    createSyncStoragePersisterMock,
  }
})

vi.mock('@tanstack/react-query-persist-client', () => ({
  persistQueryClient: mocks.persistQueryClientMock,
}))

vi.mock('@tanstack/query-sync-storage-persister', () => ({
  createSyncStoragePersister: mocks.createSyncStoragePersisterMock,
}))

import { enableQueryCachePersistence } from '../../../src/app/query/persistence'

describe('enableQueryCachePersistence', () => {
  it('returns null when a storage implementation is not provided', () => {
    const cleanup = enableQueryCachePersistence(new QueryClient(), null)
    expect(cleanup).toBeNull()
    expect(mocks.persistQueryClientMock).not.toHaveBeenCalled()
  })

  it('configures the persister when storage is available', () => {
    const client = new QueryClient()
    const cleanup = enableQueryCachePersistence(client, window.localStorage)

    expect(mocks.createSyncStoragePersisterMock).toHaveBeenCalled()
    expect(mocks.persistQueryClientMock).toHaveBeenCalled()
    expect(typeof cleanup).toBe('function')

    cleanup?.()
    expect(mocks.unsubscribeMock).toHaveBeenCalled()
  })

  it('falls back to the default storage implementation', () => {
    const cleanup = enableQueryCachePersistence(new QueryClient())

    expect(mocks.createSyncStoragePersisterMock).toHaveBeenCalled()
    expect(typeof cleanup).toBe('function')
    cleanup?.()
  })

  it('returns null when window is not available', () => {
    const globalAny = globalThis as { window?: typeof window }
    const originalWindow = globalAny.window
    Reflect.deleteProperty(globalAny, 'window')

    try {
      const cleanup = enableQueryCachePersistence(new QueryClient())
      expect(cleanup).toBeNull()
    } finally {
      globalAny.window = originalWindow
    }
  })
})
