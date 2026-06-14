import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSafeLocalStorage, safeGetItem, safeRemoveItem, safeSetItem } from '@/app/state/safeStorage'

const STORAGE_KEY = 'safe-storage-test-key'

describe('safeStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    window.localStorage.removeItem(STORAGE_KEY)
  })

  it('reads and writes through to localStorage when available', () => {
    expect(safeSetItem(STORAGE_KEY, 'value')).toBe(true)
    expect(safeGetItem(STORAGE_KEY)).toBe('value')
    safeRemoveItem(STORAGE_KEY)
    expect(safeGetItem(STORAGE_KEY)).toBeNull()
  })

  it('returns null storage when localStorage access throws (Safari private mode)', () => {
    const throwingWindow = new Proxy(window, {
      get(target, prop) {
        if (prop === 'localStorage') {
          throw new Error('SecurityError')
        }
        return Reflect.get(target, prop)
      },
    })
    vi.stubGlobal('window', throwingWindow)

    expect(getSafeLocalStorage()).toBeNull()
    expect(safeGetItem(STORAGE_KEY)).toBeNull()
    expect(safeSetItem(STORAGE_KEY, 'value')).toBe(false)
    expect(() => safeRemoveItem(STORAGE_KEY)).not.toThrow()
  })

  it('degrades when setItem throws (quota exceeded)', () => {
    const quotaStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const stubWindow = new Proxy(window, {
      get(target, prop) {
        if (prop === 'localStorage') {
          return quotaStorage
        }
        return Reflect.get(target, prop)
      },
    })
    vi.stubGlobal('window', stubWindow)

    expect(safeSetItem(STORAGE_KEY, 'value')).toBe(false)
    expect(() => safeRemoveItem(STORAGE_KEY)).not.toThrow()
  })
})
