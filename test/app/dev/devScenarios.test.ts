import { describe, it, expect, beforeEach, vi } from 'vitest'

import * as persistedAuth from '@/app/auth/persistedAuth'
import {
  applyDevPersona,
  clearDevPersona,
  canUseDevTools,
  DEV_PERSONA_KEYS,
} from '@/app/dev/devScenarios'
import {
  DEV_PERSONA_SUPERUSER,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
  STORAGE_KEY_AUTH_EXPIRY,
} from '@/app/constants'

describe('devScenarios', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('persists auth artifacts for a selected persona', () => {
    const persistAuthSpy = vi.spyOn(persistedAuth, 'persistAuth')
    const persistAuthUserSpy = vi.spyOn(persistedAuth, 'persistAuthUser')

    applyDevPersona(DEV_PERSONA_SUPERUSER)

    expect(persistAuthSpy).toHaveBeenCalledTimes(1)
    expect(persistAuthUserSpy).toHaveBeenCalledTimes(1)
  })

  it('clears all stored auth state', () => {
    window.localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'token')
    window.localStorage.setItem(STORAGE_KEY_AUTH_USER, 'user')
    window.localStorage.setItem(STORAGE_KEY_AUTH_EXPIRY, '123')

    clearDevPersona()

    expect(window.localStorage.getItem(STORAGE_KEY_AUTH_TOKEN)).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY_AUTH_USER)).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY_AUTH_EXPIRY)).toBeNull()
  })

  it('lists all supported persona keys', () => {
    expect(DEV_PERSONA_KEYS).toContain(DEV_PERSONA_SUPERUSER)
  })

  it('enables dev tools only when flag and mode allow', () => {
    expect(canUseDevTools(true, 'development')).toBe(true)
    expect(canUseDevTools(false, 'development')).toBe(false)
    expect(canUseDevTools(true, 'production')).toBe(false)
  })
})


