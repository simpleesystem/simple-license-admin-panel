import { QueryClient } from '@tanstack/react-query'
import type { RouterLocation } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import type { User } from '@/simpleLicense'
import { derivePermissionsFromUser } from '../../../src/app/auth/permissions'
import { ROUTE_PATH_AUTH, ROUTE_PATH_ROOT } from '../../../src/app/constants'
import {
  assertAuthenticated,
  assertPermission,
  assertSystemAccess,
  assertTenantAccess,
  type RouterContext,
} from '../../../src/app/router'

type RedirectResponse = Response & {
  options?: {
    to?: string
    search?: Record<string, unknown>
  }
}

const baseLocation: Pick<RouterLocation, 'href'> = { href: '/dashboard' }

const createContext = (overrides: Partial<RouterContext> = {}): RouterContext => ({
  queryClient: new QueryClient(),
  ...overrides,
})

const createUserRole = (role: User['role']) => ({ role }) as Pick<User, 'role'>

const captureRedirect = (fn: () => void): RedirectResponse => {
  try {
    fn()
    throw new Error('Redirect was not thrown')
  } catch (error) {
    return error as RedirectResponse
  }
}

describe('router guards', () => {
  it('redirects unauthenticated requests to the auth route', () => {
    const context = createContext()

    const redirectResponse = captureRedirect(() => assertAuthenticated(context, baseLocation))

    expect(redirectResponse.options?.to).toBe(ROUTE_PATH_AUTH)
    expect(redirectResponse.options?.search).toMatchObject({ redirect: baseLocation.href })
  })

  it('permits access when the user is authenticated and authorized', () => {
    const context = createContext({
      authState: {
        isAuthenticated: true,
        permissions: derivePermissionsFromUser(createUserRole('SUPERUSER')),
      },
    })

    expect(() => assertPermission(context, baseLocation, 'manageUsers')).not.toThrow()
  })

  it('redirects to root when the user lacks permission', () => {
    const context = createContext({
      authState: {
        isAuthenticated: true,
        permissions: derivePermissionsFromUser(createUserRole('VIEWER')),
      },
    })

    const redirectResponse = captureRedirect(() => assertPermission(context, baseLocation, 'manageUsers'))

    expect(redirectResponse.options?.to).toBe(ROUTE_PATH_ROOT)
  })

  it('falls back to the root path when redirect targets are empty', () => {
    const context = createContext()

    const redirectResponse = captureRedirect(() =>
      assertAuthenticated(context, { href: '' as unknown as RouterLocation['href'] })
    )

    expect(redirectResponse.options?.search).toMatchObject({ redirect: ROUTE_PATH_ROOT })
  })

  it('allows tenant access when the user is vendor scoped', () => {
    const context = createContext({
      authState: {
        isAuthenticated: true,
        permissions: derivePermissionsFromUser(createUserRole('VIEWER')),
        currentUserVendorId: 'tenant-123',
      },
    })

    expect(() => assertTenantAccess(context, baseLocation)).not.toThrow()
  })

  it('denies tenant access when the user lacks scope and permission', () => {
    const context = createContext({
      authState: {
        isAuthenticated: true,
        permissions: derivePermissionsFromUser(createUserRole('VIEWER')),
      },
    })

    const redirectResponse = captureRedirect(() => assertTenantAccess(context, baseLocation))

    expect(redirectResponse.options?.to).toBe(ROUTE_PATH_ROOT)
  })

  it('allows system access for administrators', () => {
    const context = createContext({
      authState: {
        isAuthenticated: true,
        permissions: derivePermissionsFromUser(createUserRole('ADMIN')),
        currentUserRole: 'ADMIN',
      },
    })

    expect(() => assertSystemAccess(context, baseLocation)).not.toThrow()
  })

  it('blocks system access for non-admins', () => {
    const context = createContext({
      authState: {
        isAuthenticated: true,
        permissions: derivePermissionsFromUser(createUserRole('VIEWER')),
        currentUserRole: 'VIEWER',
      },
    })

    const redirectResponse = captureRedirect(() => assertSystemAccess(context, baseLocation))

    expect(redirectResponse.options?.to).toBe(ROUTE_PATH_ROOT)
  })
})
