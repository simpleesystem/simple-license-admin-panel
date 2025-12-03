import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { PasswordResetGate } from '../../../src/app/auth/PasswordResetGate'
import { AuthContext } from '../../../src/app/auth/authContext'
import type { AuthContextValue } from '../../../src/app/auth/types'
import { buildUser } from '../../factories/userFactory'

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
      </AuthContext.Provider>,
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
          <div data-testid="app-shell">App</div>
        </PasswordResetGate>
      </AuthContext.Provider>,
    )

    expect(screen.getByTestId('change-password-flow')).toBeInTheDocument()
    expect(screen.queryByTestId('app-shell')).not.toBeInTheDocument()
  })
})


