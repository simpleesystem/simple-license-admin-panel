import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AuthContext, useAuth } from '../../../src/app/auth/authContext'
import type { AuthContextValue } from '../../../src/app/auth/types'
import { AUTH_STATUS_IDLE } from '../../../src/app/constants'

const createAuthValue = (): AuthContextValue => ({
  token: 'token',
  currentUser: null,
  status: AUTH_STATUS_IDLE,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  refreshCurrentUser: vi.fn(),
})

describe('useAuth', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/Auth context/)
  })

  it('returns the provided value', () => {
    const value = createAuthValue()
    const wrapper = ({ children }: { children: ReactNode }) => <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toBe(value)
  })
})


