import { beforeEach, describe, expect, it, vi } from 'vitest'

import { STORAGE_KEY_AUTH_EXPIRY, STORAGE_KEY_AUTH_TOKEN, STORAGE_KEY_AUTH_USER } from '@/app/constants'
import { DEV_PERSONA_SUPERUSER } from '@/app/dev/constants'
import {
  applyDevPersona,
  canUseDevTools,
  clearDevPersona,
  DEV_PERSONA_KEYS,
  type DevPersonaKey,
} from '@/app/dev/devScenarios'

describe('devScenarios', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  const expectNoPersistedAuthArtifacts = () => {
    expect(window.localStorage.getItem(STORAGE_KEY_AUTH_TOKEN)).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY_AUTH_EXPIRY)).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY_AUTH_USER)).toBeNull()
  }

  it('does not persist auth artifacts (dev persona is a no-op with HttpOnly cookies)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    applyDevPersona(DEV_PERSONA_SUPERUSER, 'development')

    expectNoPersistedAuthArtifacts()
    expect(warnSpy).toHaveBeenCalled()
  })

  it('does not persist persona data when required env values are missing', () => {
    applyDevPersona(DEV_PERSONA_SUPERUSER, 'development')

    expectNoPersistedAuthArtifacts()
  })

  it('does not persist persona data outside dev environments', () => {
    applyDevPersona(DEV_PERSONA_SUPERUSER, 'production')

    expectNoPersistedAuthArtifacts()
  })

  it('ignores unknown persona keys gracefully', () => {
    applyDevPersona('unknown' as DevPersonaKey)

    expectNoPersistedAuthArtifacts()
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
