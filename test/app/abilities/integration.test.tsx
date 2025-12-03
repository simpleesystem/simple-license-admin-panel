import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminRole, LoginResponse } from '@simple-license/react-sdk'

import { IfCan } from '@/app/abilities/IfCan'
import { AbilityProvider } from '@/app/abilities/AbilityProvider'
import { AuthorizationProvider } from '@/app/auth/AuthorizationProvider'
import { AuthContext } from '@/app/auth/authContext'
import type { AuthContextValue } from '@/app/auth/types'
import { AUTH_STATUS_IDLE, ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_LICENSE } from '@/app/constants'
import { buildUser } from '@test/factories/userFactory'

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
      <AuthorizationProvider>
        <AbilityProvider>{ui}</AbilityProvider>
      </AuthorizationProvider>
    </AuthContext.Provider>,
  )
}

describe('Ability pipeline integration', () => {
  it('grants manage license ability to superusers via provider stack', () => {
    renderAbilityTree(
      <IfCan action={ABILITY_ACTION_MANAGE} subject={ABILITY_SUBJECT_LICENSE}>
        <span data-testid="manage-license-control">control</span>
      </IfCan>,
      'SUPERUSER',
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
      'VIEWER',
    )

    expect(screen.queryByTestId('should-hide')).toBeNull()
    expect(screen.getByTestId('no-access')).toBeInTheDocument()
  })
})


