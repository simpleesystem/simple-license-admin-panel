import { persistAuth, persistAuthUser } from '../auth/persistedAuth'
import type { PersistedAuthUser } from '../auth/persistedAuth'
import {
  DEV_PERSONA_SUPERUSER,
  DEV_PERSONA_SUPPORT,
  DEV_PERSONA_VIEWER,
  DEV_PERSONA_SUPERUSER_TOKEN,
  DEV_PERSONA_SUPPORT_TOKEN,
  DEV_PERSONA_VIEWER_TOKEN,
  DEV_PERSONA_SUPERUSER_ID,
  DEV_PERSONA_SUPPORT_ID,
  DEV_PERSONA_VIEWER_ID,
  DEV_PERSONA_SUPERUSER_USERNAME,
  DEV_PERSONA_SUPPORT_USERNAME,
  DEV_PERSONA_VIEWER_USERNAME,
  DEV_PERSONA_SUPERUSER_EMAIL,
  DEV_PERSONA_SUPPORT_EMAIL,
  DEV_PERSONA_VIEWER_EMAIL,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
  STORAGE_KEY_AUTH_EXPIRY,
} from '../constants'

export type DevPersonaKey =
  | typeof DEV_PERSONA_SUPERUSER
  | typeof DEV_PERSONA_SUPPORT
  | typeof DEV_PERSONA_VIEWER

type DevPersona = {
  token: string
  expiresInHours: number
  user: PersistedAuthUser
}

const DEV_PERSONAS: Record<DevPersonaKey, DevPersona> = {
  [DEV_PERSONA_SUPERUSER]: {
    token: DEV_PERSONA_SUPERUSER_TOKEN,
    expiresInHours: 12,
    user: {
      id: DEV_PERSONA_SUPERUSER_ID,
      username: DEV_PERSONA_SUPERUSER_USERNAME,
      email: DEV_PERSONA_SUPERUSER_EMAIL,
      role: 'SUPERUSER',
    },
  },
  [DEV_PERSONA_SUPPORT]: {
    token: DEV_PERSONA_SUPPORT_TOKEN,
    expiresInHours: 8,
    user: {
      id: DEV_PERSONA_SUPPORT_ID,
      username: DEV_PERSONA_SUPPORT_USERNAME,
      email: DEV_PERSONA_SUPPORT_EMAIL,
      role: 'ADMIN',
    },
  },
  [DEV_PERSONA_VIEWER]: {
    token: DEV_PERSONA_VIEWER_TOKEN,
    expiresInHours: 24,
    user: {
      id: DEV_PERSONA_VIEWER_ID,
      username: DEV_PERSONA_VIEWER_USERNAME,
      email: DEV_PERSONA_VIEWER_EMAIL,
      role: 'VIEWER',
    },
  },
}

const isDevEnvironment = (mode: string = import.meta.env.MODE): boolean => mode !== 'production'

export const DEV_PERSONA_KEYS: DevPersonaKey[] = [
  DEV_PERSONA_SUPERUSER,
  DEV_PERSONA_SUPPORT,
  DEV_PERSONA_VIEWER,
]

export const applyDevPersona = (persona: DevPersonaKey): void => {
  if (!isDevEnvironment()) {
    return
  }
  const definition = DEV_PERSONAS[persona]
  if (!definition) {
    return
  }
  const expiresAt = Date.now() + definition.expiresInHours * 60 * 60 * 1_000
  persistAuth(definition.token, expiresAt)
  persistAuthUser(definition.user)
}

export const clearDevPersona = (): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN)
  window.localStorage.removeItem(STORAGE_KEY_AUTH_EXPIRY)
  window.localStorage.removeItem(STORAGE_KEY_AUTH_USER)
  persistAuth(null, null)
  persistAuthUser(null)
}

export const canUseDevTools = (flagEnabled: boolean, mode?: string): boolean => {
  return flagEnabled && isDevEnvironment(mode)
}


