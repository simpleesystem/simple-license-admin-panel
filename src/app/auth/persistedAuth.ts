/* c8 ignore file */

import type { User } from '@simple-license/react-sdk'

import {
  STORAGE_KEY_AUTH_EXPIRY,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
} from '../../app/constants'

const isBrowser = typeof window !== 'undefined'

export type PersistedAuth = {
  token: string | null
  expiresAt: number | null
}

export type PersistedAuthUser = User

export const readPersistedAuth = (): PersistedAuth => {
  if (!isBrowser) {
    return { token: null, expiresAt: null }
  }
  const token = window.localStorage.getItem(STORAGE_KEY_AUTH_TOKEN)
  const expiresAtRaw = window.localStorage.getItem(STORAGE_KEY_AUTH_EXPIRY)
  const expiresAt = expiresAtRaw ? Number.parseInt(expiresAtRaw, 10) : null

  if (expiresAt && expiresAt < Date.now()) {
    window.localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN)
    window.localStorage.removeItem(STORAGE_KEY_AUTH_EXPIRY)
    window.localStorage.removeItem(STORAGE_KEY_AUTH_USER)
    return { token: null, expiresAt: null }
  }

  return { token, expiresAt }
}

export const persistAuth = (token: string | null, expiresAt: number | null): void => {
  if (!isBrowser) {
    return
  }

  if (token) {
    window.localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token)
  } else {
    window.localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN)
  }

  if (expiresAt) {
    window.localStorage.setItem(STORAGE_KEY_AUTH_EXPIRY, `${expiresAt}`)
  } else {
    window.localStorage.removeItem(STORAGE_KEY_AUTH_EXPIRY)
  }
}

export const readPersistedUser = (): PersistedAuthUser | null => {
  if (!isBrowser) {
    return null
  }
  const raw = window.localStorage.getItem(STORAGE_KEY_AUTH_USER)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as PersistedAuthUser
  } catch {
    window.localStorage.removeItem(STORAGE_KEY_AUTH_USER)
    return null
  }
}

export const persistAuthUser = (user: PersistedAuthUser | null): void => {
  if (!isBrowser) {
    return
  }
  if (user) {
    window.localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(STORAGE_KEY_AUTH_USER)
  }
}

