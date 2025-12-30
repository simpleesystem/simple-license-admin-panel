import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  ABILITY_ACTION_VIEW,
  ABILITY_SUBJECT_DASHBOARD,
  ERROR_MESSAGE_ABILITY_CONTEXT_UNAVAILABLE,
} from '@/app/constants'
import { AbilityContext } from '@/app/abilities/abilityContext'
import { buildAbilityFromPermissions } from '@/app/abilities/factory'
import { useAbility, useCanAbility } from '@/app/abilities/useAbility'
import { buildPermissions } from '@test/factories/permissionFactory'

const withProviders = (permissions = buildPermissions({ viewDashboard: true })) => {
  const ability = buildAbilityFromPermissions(permissions)

  return ({ children }: { children: ReactNode }) => (
    <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
  )
}

describe('useAbility', () => {
  it('throws when used without provider', () => {
    expect(() => renderHook(() => useAbility())).toThrow(ERROR_MESSAGE_ABILITY_CONTEXT_UNAVAILABLE)
  })

  it('returns an ability instance when wrapped in AbilityProvider', () => {
    const wrapper = withProviders()

    const { result } = renderHook(() => useAbility(), { wrapper })

    expect(result.current.can(ABILITY_ACTION_VIEW, ABILITY_SUBJECT_DASHBOARD)).toBe(true)
  })
})

describe('useCanAbility', () => {
  it('returns true when the user can perform the action', () => {
    const wrapper = withProviders()

    const { result } = renderHook(
      () => useCanAbility(ABILITY_ACTION_VIEW, ABILITY_SUBJECT_DASHBOARD),
      { wrapper },
    )

    expect(result.current).toBe(true)
  })

  it('returns false when the ability is not granted', () => {
    const wrapper = withProviders(buildPermissions())

    const { result } = renderHook(
      () => useCanAbility(ABILITY_ACTION_VIEW, ABILITY_SUBJECT_DASHBOARD),
      { wrapper },
    )

    expect(result.current).toBe(false)
  })
})
