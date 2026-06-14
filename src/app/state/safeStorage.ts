/**
 * Safe localStorage helpers.
 *
 * window.localStorage can throw on ACCESS (not just use) in Safari private
 * mode, sandboxed iframes, and locked-down browser profiles. Every call here
 * degrades to a no-op / null instead of crashing session init or app startup.
 */

export const getSafeLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const storage = window.localStorage
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
      return null
    }
    return storage
  } catch {
    return null
  }
}

export const safeGetItem = (key: string): string | null => {
  const storage = getSafeLocalStorage()
  if (!storage) {
    return null
  }
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export const safeSetItem = (key: string, value: string): boolean => {
  const storage = getSafeLocalStorage()
  if (!storage) {
    return false
  }
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const safeRemoveItem = (key: string): void => {
  const storage = getSafeLocalStorage()
  if (!storage) {
    return
  }
  try {
    storage.removeItem(key)
  } catch {
    // Ignore: removal is best-effort cleanup
  }
}
