import { describe, it, expect, beforeEach, vi } from 'vitest'

import * as persistedAuth from '@/app/auth/persistedAuth'
import { STORAGE_KEY_AUTH_TOKEN, STORAGE_KEY_AUTH_USER, STORAGE_KEY_AUTH_EXPIRY } from '@/app/constants'
import {
  DEV_PERSONA_SUPERUSER,
  ENV_VAR_DEV_PERSONA_SUPERUSER_EMAIL,
  ENV_VAR_DEV_PERSONA_SUPERUSER_ID,
  ENV_VAR_DEV_PERSONA_SUPERUSER_TOKEN,
  ENV_VAR_DEV_PERSONA_SUPERUSER_USERNAME,
} from '@/app/dev/constants'
import {
  applyDevPersona,
  clearDevPersona,
  canUseDevTools,
  DEV_PERSONA_KEYS,
  type DevPersonaKey,
} from '@/app/dev/devScenarios'

describe('devScenarios', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  const personaEnv = {
    [ENV_VAR_DEV_PERSONA_SUPERUSER_TOKEN]: 'token-superuser',
    [ENV_VAR_DEV_PERSONA_SUPERUSER_ID]: 'user-superuser',
    [ENV_VAR_DEV_PERSONA_SUPERUSER_USERNAME]: 'dev.superuser',
    [ENV_VAR_DEV_PERSONA_SUPERUSER_EMAIL]: 'superuser@example.dev',
  }

  it('persists auth artifacts for a selected persona when configured in env', () => {
    const persistAuthSpy = vi.spyOn(persistedAuth, 'persistAuth')
    const persistAuthUserSpy = vi.spyOn(persistedAuth, 'persistAuthUser')

    applyDevPersona(DEV_PERSONA_SUPERUSER, 'development', personaEnv)

    expect(persistAuthSpy).toHaveBeenCalledTimes(1)
    expect(persistAuthUserSpy).toHaveBeenCalledTimes(1)
  })

  it('does not persist persona data when required env values are missing', () => {
    const persistAuthSpy = vi.spyOn(persistedAuth, 'persistAuth')
    const persistAuthUserSpy = vi.spyOn(persistedAuth, 'persistAuthUser')

    applyDevPersona(DEV_PERSONA_SUPERUSER, 'development', {})

    expect(persistAuthSpy).not.toHaveBeenCalled()
    expect(persistAuthUserSpy).not.toHaveBeenCalled()
  })

  it('does not persist persona data outside dev environments', () => {
    const persistAuthSpy = vi.spyOn(persistedAuth, 'persistAuth')

    applyDevPersona(DEV_PERSONA_SUPERUSER, 'production')

    expect(persistAuthSpy).not.toHaveBeenCalled()
  })

  it('ignores unknown persona keys gracefully', () => {
    const persistAuthSpy = vi.spyOn(persistedAuth, 'persistAuth')
    applyDevPersona('unknown' as DevPersonaKey)
    expect(persistAuthSpy).not.toHaveBeenCalled()
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


