import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { AuthContext } from '../../../src/app/auth/authContext'
import { PasswordResetGate } from '../../../src/app/auth/PasswordResetGate'
import type { AuthContextValue } from '../../../src/app/auth/types'
import { buildUser } from '../../factories/userFactory'

// Mock router hooks to avoid router context issues
vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => ({}),
  useNavigate: () => vi.fn(),
}))

vi.mock('../../../src/ui/auth/ChangePasswordFlow', () => ({
  ChangePasswordFlow: () => <div data-testid="change-password-flow" />,
}))

const buildAuthContext = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  token: 'token',
  currentUser: buildUser(),
  status: 'idle',
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  refreshCurrentUser: vi.fn(async () => null),
  ...overrides,
})

describe('PasswordResetGate', () => {
  test('renders children when reset not required', () => {
    const value = buildAuthContext({
      currentUser: buildUser({ passwordResetRequired: false }),
    })

    render(
      <AuthContext.Provider value={value}>
        <PasswordResetGate>
          <div data-testid="app-shell">App</div>
        </PasswordResetGate>
      </AuthContext.Provider>
    )

    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(screen.queryByTestId('change-password-flow')).not.toBeInTheDocument()
  })

  test('renders change password flow when reset required', () => {
    const value = buildAuthContext({
      currentUser: buildUser({ passwordResetRequired: true }),
    })

    render(
      <AuthContext.Provider value={value}>
        <PasswordResetGate>
          <div data-testid="original-content">App</div>
        </PasswordResetGate>
      </AuthContext.Provider>
    )

    // When password reset is required, AppShell is rendered with change password flow
    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(screen.getByTestId('change-password-flow')).toBeInTheDocument()
    // Original content should not be rendered
    expect(screen.queryByTestId('original-content')).not.toBeInTheDocument()
  })

  test('renders children when no user is present', () => {
    const value = buildAuthContext({
      currentUser: null,
    })

    render(
      <AuthContext.Provider value={value}>
        <PasswordResetGate>
          <div data-testid="app-shell">App</div>
        </PasswordResetGate>
      </AuthContext.Provider>
    )

    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(screen.queryByTestId('change-password-flow')).not.toBeInTheDocument()
  })
})
