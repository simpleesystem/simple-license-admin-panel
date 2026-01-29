import { buildUser } from '@test/factories/userFactory'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AbilityProvider } from '@/app/abilities/AbilityProvider'
import { IfCan } from '@/app/abilities/IfCan'
import { AuthContext } from '@/app/auth/authContext'
import type { AuthContextValue } from '@/app/auth/types'
import { ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_LICENSE, AUTH_STATUS_IDLE } from '@/app/constants'
import type { AdminRole, LoginResponse } from '@/simpleLicense'

const createAuthValue = (userRole: AdminRole | null): AuthContextValue => {
  const user = userRole ? buildUser({ role: userRole }) : null
  const fallbackUser = user ?? buildUser()
  const loginResponse: LoginResponse = {
    token: 'dev-token',
    user: fallbackUser,
  }
  return {
    token: null,
    currentUser: user,
    user,
    status: AUTH_STATUS_IDLE,
    isAuthenticated: Boolean(user),
    login: vi.fn(async () => loginResponse),
    logout: vi.fn(),
    refreshCurrentUser: vi.fn(async () => user),
  }
}

const renderAbilityTree = (ui: ReactElement, role: AdminRole | null) => {
  const authValue = createAuthValue(role)
  return render(
    <AuthContext.Provider value={authValue}>
      <AbilityProvider>{ui}</AbilityProvider>
    </AuthContext.Provider>
  )
}

describe('Ability pipeline integration', () => {
  it('grants manage license ability to superusers via provider stack', () => {
    renderAbilityTree(
      <IfCan action={ABILITY_ACTION_MANAGE} subject={ABILITY_SUBJECT_LICENSE}>
        <span data-testid="manage-license-control">control</span>
      </IfCan>,
      'SUPERUSER'
    )

    expect(screen.getByTestId('manage-license-control')).toBeInTheDocument()
  })

  it('denies manage license ability to viewers via provider stack', () => {
    renderAbilityTree(
      <IfCan
        action={ABILITY_ACTION_MANAGE}
        subject={ABILITY_SUBJECT_LICENSE}
        fallback={<span data-testid="no-access">no access</span>}
      >
        <span data-testid="should-hide">hidden</span>
      </IfCan>,
      'VIEWER'
    )

    expect(screen.queryByTestId('should-hide')).toBeNull()
    expect(screen.getByTestId('no-access')).toBeInTheDocument()
  })
})
