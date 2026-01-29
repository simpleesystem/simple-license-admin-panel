import { buildPermissions } from '@test/factories/permissionFactory'
import { buildUser } from '@test/factories/userFactory'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AbilityContext } from '@/app/abilities/abilityContext'
import { buildAbilityFromPermissions } from '@/app/abilities/factory'
import { IfCan } from '@/app/abilities/IfCan'
import { IfPermission } from '@/app/abilities/IfPermission'
import { AuthContext } from '@/app/auth/authContext'
import type { AuthContextValue } from '@/app/auth/types'
import { ABILITY_ACTION_VIEW, ABILITY_SUBJECT_DASHBOARD, ABILITY_SUBJECT_LICENSE } from '@/app/constants'

const renderWithProviders = (
  ui: ReactNode,
  permissions = buildPermissions({ viewDashboard: true, manageLicenses: true })
) => {
  const ability = buildAbilityFromPermissions(permissions)
  const userHasManageLicenses = permissions.manageLicenses ?? false
  const user = userHasManageLicenses ? buildUser({ role: 'SUPERUSER' }) : buildUser({ role: 'VIEWER' })
  const authValue: AuthContextValue = {
    token: null,
    currentUser: user,
    user,
    status: 'auth/status/idle',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    refreshCurrentUser: vi.fn(),
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <AbilityContext.Provider value={ability}>{ui}</AbilityContext.Provider>
    </AuthContext.Provider>
  )
}

describe('IfCan', () => {
  it('renders children when ability is allowed', () => {
    renderWithProviders(
      <IfCan action={ABILITY_ACTION_VIEW} subject={ABILITY_SUBJECT_DASHBOARD}>
        <span data-testid="allowed">Allowed</span>
      </IfCan>
    )

    expect(screen.getByTestId('allowed')).toBeInTheDocument()
  })

  it('renders fallback when ability is denied', () => {
    renderWithProviders(
      <IfCan
        action={ABILITY_ACTION_VIEW}
        subject={ABILITY_SUBJECT_LICENSE}
        fallback={<span data-testid="fallback">Denied</span>}
      >
        <span data-testid="denied-child">Should not render</span>
      </IfCan>,
      buildPermissions() // Empty permissions
    )

    expect(screen.queryByTestId('denied-child')).toBeNull()
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
  })

  it('disables child when mode is disable', () => {
    renderWithProviders(
      <IfCan action={ABILITY_ACTION_VIEW} subject={ABILITY_SUBJECT_LICENSE} mode="disable">
        <button data-testid="action" type="button">
          Action
        </button>
      </IfCan>,
      buildPermissions()
    )

    const button = screen.getByTestId('action')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders fallback render functions when ability is denied', () => {
    const fallbackRenderer = vi.fn((isAllowed: boolean) => (
      <span data-testid="fn-fallback">{isAllowed ? 'allowed' : 'denied'}</span>
    ))

    renderWithProviders(
      <IfCan action={ABILITY_ACTION_VIEW} subject={ABILITY_SUBJECT_LICENSE} fallback={fallbackRenderer}>
        <span data-testid="fn-child">Hidden</span>
      </IfCan>,
      buildPermissions()
    )

    expect(screen.queryByTestId('fn-child')).toBeNull()
    expect(screen.getByTestId('fn-fallback')).toHaveTextContent('denied')
    expect(fallbackRenderer).toHaveBeenCalledWith(false)
  })
})

describe('IfPermission', () => {
  it('renders children when permission is granted', () => {
    renderWithProviders(
      <IfPermission permission="manageLicenses">
        <span data-testid="permission-allowed">Allowed</span>
      </IfPermission>
    )

    expect(screen.getByTestId('permission-allowed')).toBeInTheDocument()
  })

  it('renders fallback when permission is missing', () => {
    renderWithProviders(
      <IfPermission permission="manageLicenses" fallback={<span data-testid="perm-fallback">No</span>}>
        <span data-testid="should-hide">Hidden</span>
      </IfPermission>,
      buildPermissions()
    )

    expect(screen.queryByTestId('should-hide')).toBeNull()
    expect(screen.getByTestId('perm-fallback')).toBeInTheDocument()
  })

  it('supports fallback render functions for permissions', () => {
    const fallbackFn = vi.fn(() => <span data-testid="perm-fn-fallback">Denied</span>)

    renderWithProviders(
      <IfPermission permission="manageLicenses" fallback={fallbackFn}>
        <span data-testid="perm-hidden">Hidden</span>
      </IfPermission>,
      buildPermissions()
    )

    expect(screen.queryByTestId('perm-hidden')).toBeNull()
    expect(screen.getByTestId('perm-fn-fallback')).toBeInTheDocument()
    expect(fallbackFn).toHaveBeenCalled()
  })
})
