import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthorizationProvider } from '../../../src/app/auth/AuthorizationProvider'
import { useCan, usePermissions } from '../../../src/app/auth/useAuthorization'
import type { AuthContextValue } from '../../../src/app/auth/types'
import { AuthContext } from '../../../src/app/auth/authContext'
import type { User } from '@/simpleLicense'

const baseAuthValue: AuthContextValue = {
  token: null,
  currentUser: null,
  status: 'auth/status/idle',
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshCurrentUser: vi.fn(),
}

const createUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-id',
    username: 'user',
    email: 'user@example.com',
    role: 'VIEWER',
    ...overrides,
  }) as User

const renderWithAuth = (currentUser: User | null) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider
      value={{
        ...baseAuthValue,
        currentUser,
        isAuthenticated: Boolean(currentUser),
      }}
    >
      <AuthorizationProvider>{children}</AuthorizationProvider>
    </AuthContext.Provider>
  )

  return wrapper
}

describe('AuthorizationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes derived permissions for the current user', () => {
    const wrapper = renderWithAuth(createUser({ role: 'SUPERUSER' }))
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.manageUsers).toBe(true)
    expect(result.current.manageLicenses).toBe(true)
  })

  it('allows conditional permission checks', () => {
    const wrapper = renderWithAuth(createUser({ role: 'VIEWER' }))
    const { result } = renderHook(() => useCan('viewDashboard'), { wrapper })
    const { result: managerResult } = renderHook(() => useCan('manageTenants'), { wrapper })

    expect(result.current).toBe(true)
    expect(managerResult.current).toBe(false)
  })

  it('throws when hooks are used outside the provider', () => {
    expect(() => renderHook(() => usePermissions())).toThrow(/Authorization context/)
  })
})

