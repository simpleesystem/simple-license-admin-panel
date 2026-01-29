import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/simpleLicense'
import { AuthContext } from '../../../src/app/auth/authContext'
import type { AuthContextValue } from '../../../src/app/auth/types'
import { useCan, usePermissions } from '../../../src/app/auth/useAuthorization'

const baseAuthValue: AuthContextValue = {
  token: null,
  currentUser: null,
  user: null, // Add user property
  status: 'auth/status/idle',
  isAuthenticated: false,
  isLoading: false,
  error: null,
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
        user: currentUser, // Sync user with currentUser
        isAuthenticated: Boolean(currentUser),
      }}
    >
      {children}
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
    // It throws because usePermissions uses useAuth, which checks for AuthContext
    expect(() => renderHook(() => usePermissions())).toThrow(/useAuth must be used within an AuthProvider/)
  })
})
