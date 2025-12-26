/**
 * Persisted Auth Utilities
 * Functions for persisting authentication state to localStorage
 */

import type { User } from '@/simpleLicense'
import { STORAGE_KEY_AUTH_EXPIRY, STORAGE_KEY_AUTH_TOKEN, STORAGE_KEY_AUTH_USER } from '@/app/constants'

/**
 * Persists authentication token and expiry to localStorage
 */
export function persistAuth(token: string, expiry: number): void {
  window.localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token)
  window.localStorage.setItem(STORAGE_KEY_AUTH_EXPIRY, expiry.toString())
}

/**
 * Persists user data to localStorage
 */
export function persistAuthUser(user: User): void {
  window.localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user))
}

