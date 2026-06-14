/**
 * Persisted Auth Utilities
 * Functions for persisting authentication state to localStorage
 */

import { STORAGE_KEY_AUTH_EXPIRY, STORAGE_KEY_AUTH_TOKEN, STORAGE_KEY_AUTH_USER } from '@/app/constants'
import { safeSetItem } from '@/app/state/safeStorage'
import type { User } from '@/simpleLicense'

/**
 * Persists authentication token and expiry to localStorage.
 * Best-effort: storage may be unavailable (Safari private mode, sandboxed
 * iframes); the session still works for the current tab without it.
 */
export function persistAuth(token: string, expiry: number): void {
  safeSetItem(STORAGE_KEY_AUTH_TOKEN, token)
  safeSetItem(STORAGE_KEY_AUTH_EXPIRY, expiry.toString())
}

/**
 * Persists user data to localStorage
 */
export function persistAuthUser(user: User): void {
  safeSetItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user))
}
