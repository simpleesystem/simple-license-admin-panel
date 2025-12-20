// import type { User } from '@simple-license/react-sdk'
// import {
//   DEV_PERSONA_SUPPORT,
//   DEV_PERSONA_SUPPORT_EXPIRY_HOURS,
//   DEV_PERSONA_SUPPORT_FALLBACK,
//   DEV_PERSONA_SUPERUSER,
//   DEV_PERSONA_SUPERUSER_EXPIRY_HOURS,
//   DEV_PERSONA_SUPERUSER_FALLBACK,
//   DEV_PERSONA_VIEWER,
//   DEV_PERSONA_VIEWER_EXPIRY_HOURS,
//   DEV_PERSONA_VIEWER_FALLBACK,
//   ENV_VAR_DEV_PERSONA_SUPPORT_EMAIL,
//   ENV_VAR_DEV_PERSONA_SUPPORT_ID,
//   ENV_VAR_DEV_PERSONA_SUPPORT_TOKEN,
//   ENV_VAR_DEV_PERSONA_SUPPORT_USERNAME,
//   ENV_VAR_DEV_PERSONA_SUPERUSER_EMAIL,
//   ENV_VAR_DEV_PERSONA_SUPERUSER_ID,
//   ENV_VAR_DEV_PERSONA_SUPERUSER_TOKEN,
//   ENV_VAR_DEV_PERSONA_SUPERUSER_USERNAME,
//   ENV_VAR_DEV_PERSONA_VIEWER_EMAIL,
//   ENV_VAR_DEV_PERSONA_VIEWER_ID,
//   ENV_VAR_DEV_PERSONA_VIEWER_TOKEN,
//   ENV_VAR_DEV_PERSONA_VIEWER_USERNAME,
// } from './constants'

import { STORAGE_KEY_AUTH_EXPIRY, STORAGE_KEY_AUTH_TOKEN, STORAGE_KEY_AUTH_USER } from '../constants'
import { DEV_PERSONA_SUPERUSER, DEV_PERSONA_SUPPORT, DEV_PERSONA_VIEWER } from './constants'

export type DevPersonaKey = typeof DEV_PERSONA_SUPERUSER | typeof DEV_PERSONA_SUPPORT | typeof DEV_PERSONA_VIEWER

// type DevPersona = {
//   token: string
//   expiresInHours: number
//   user: User
// }
//
// type EnvRecord = Record<string, string | undefined>
//
// type PersonaEnvConfig = {
//   tokenKey: string
//   idKey: string
//   usernameKey: string
//   emailKey: string
//   role: string
//   expiresInHours: number
// }

// const PERSONA_ENV_CONFIG: Record<DevPersonaKey, PersonaEnvConfig> = {
//   [DEV_PERSONA_SUPERUSER]: {
//     tokenKey: ENV_VAR_DEV_PERSONA_SUPERUSER_TOKEN,
//     idKey: ENV_VAR_DEV_PERSONA_SUPERUSER_ID,
//     usernameKey: ENV_VAR_DEV_PERSONA_SUPERUSER_USERNAME,
//     emailKey: ENV_VAR_DEV_PERSONA_SUPERUSER_EMAIL,
//       role: 'SUPERUSER',
//     expiresInHours: DEV_PERSONA_SUPERUSER_EXPIRY_HOURS,
//   },
//   [DEV_PERSONA_SUPPORT]: {
//     tokenKey: ENV_VAR_DEV_PERSONA_SUPPORT_TOKEN,
//     idKey: ENV_VAR_DEV_PERSONA_SUPPORT_ID,
//     usernameKey: ENV_VAR_DEV_PERSONA_SUPPORT_USERNAME,
//     emailKey: ENV_VAR_DEV_PERSONA_SUPPORT_EMAIL,
//       role: 'ADMIN',
//     expiresInHours: DEV_PERSONA_SUPPORT_EXPIRY_HOURS,
//   },
//   [DEV_PERSONA_VIEWER]: {
//     tokenKey: ENV_VAR_DEV_PERSONA_VIEWER_TOKEN,
//     idKey: ENV_VAR_DEV_PERSONA_VIEWER_ID,
//     usernameKey: ENV_VAR_DEV_PERSONA_VIEWER_USERNAME,
//     emailKey: ENV_VAR_DEV_PERSONA_VIEWER_EMAIL,
//       role: 'VIEWER',
//     expiresInHours: DEV_PERSONA_VIEWER_EXPIRY_HOURS,
//   },
// }

const isDevEnvironment = (mode: string = import.meta.env.MODE): boolean => mode !== 'production'

// const readEnvValue = (env: EnvRecord, key: string): string | null => {
//   const value = env[key]
//   if (!value) {
//     return null
//   }
//   const trimmed = value.trim()
//   return trimmed.length > 0 ? trimmed : null
// }

// const buildPersona = (env: EnvRecord, config: PersonaEnvConfig): DevPersona | null => {
//   const token = readEnvValue(env, config.tokenKey)
//   const id = readEnvValue(env, config.idKey)
//   const username = readEnvValue(env, config.usernameKey)
//   const email = readEnvValue(env, config.emailKey)
//
//   const hasEnvConfig = Boolean(token && id && username && email)
//
//   if (!hasEnvConfig && isDevEnvironment(env.MODE)) {
//     if (config.role === 'SUPERUSER') {
//       return {
//         token: DEV_PERSONA_SUPERUSER_FALLBACK.token,
//         expiresInHours: config.expiresInHours,
//         user: {
//           id: DEV_PERSONA_SUPERUSER_FALLBACK.id,
//           username: DEV_PERSONA_SUPERUSER_FALLBACK.username,
//           email: DEV_PERSONA_SUPERUSER_FALLBACK.email,
//           role: config.role,
//         },
//       }
//     }
//     if (config.role === 'ADMIN') {
//       return {
//         token: DEV_PERSONA_SUPPORT_FALLBACK.token,
//         expiresInHours: config.expiresInHours,
//         user: {
//           id: DEV_PERSONA_SUPPORT_FALLBACK.id,
//           username: DEV_PERSONA_SUPPORT_FALLBACK.username,
//           email: DEV_PERSONA_SUPPORT_FALLBACK.email,
//           role: config.role,
//         },
//       }
//     }
//     if (config.role === 'VIEWER') {
//       return {
//         token: DEV_PERSONA_VIEWER_FALLBACK.token,
//         expiresInHours: config.expiresInHours,
//         user: {
//           id: DEV_PERSONA_VIEWER_FALLBACK.id,
//           username: DEV_PERSONA_VIEWER_FALLBACK.username,
//           email: DEV_PERSONA_VIEWER_FALLBACK.email,
//           role: config.role,
//         },
//       }
//     }
//   }
//
//   if (!token || !id || !username || !email) {
//     return null
//   }
//
//   return {
//     token,
//     expiresInHours: config.expiresInHours,
//     user: {
//       id,
//       username,
//       email,
//       role: config.role,
//     },
//   }
// }

// const buildDevPersonas = (env: EnvRecord): Partial<Record<DevPersonaKey, DevPersona>> => {
//   return Object.entries(PERSONA_ENV_CONFIG).reduce<Partial<Record<DevPersonaKey, DevPersona>>>((acc, [key, config]) => {
//     const persona = buildPersona(env, config)
//     if (persona) {
//       acc[key as DevPersonaKey] = persona
//     }
//     return acc
//   }, {})
// }

export const DEV_PERSONA_KEYS: DevPersonaKey[] = [DEV_PERSONA_SUPERUSER, DEV_PERSONA_SUPPORT, DEV_PERSONA_VIEWER]

export const applyDevPersona = (persona: DevPersonaKey, mode?: string): void => {
  if (!isDevEnvironment(mode)) {
    return
  }
  // Prevent unused var warning for persona
  void persona
  // No-op: Cannot securely impersonate via client-side code with HttpOnly cookies
  console.warn('Dev Persona application is not supported with HttpOnly cookies')
}

export const clearDevPersona = (): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN)
  window.localStorage.removeItem(STORAGE_KEY_AUTH_EXPIRY)
  window.localStorage.removeItem(STORAGE_KEY_AUTH_USER)
  // No-op for persistence clearing as it is gone
}

export const canUseDevTools = (flagEnabled: boolean, mode?: string): boolean => {
  // Re-implement inline to avoid unused function warning for isDevEnvironment
  const isDev = mode !== 'production'
  return flagEnabled && isDev
}
