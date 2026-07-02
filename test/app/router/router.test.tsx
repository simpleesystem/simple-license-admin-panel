import { act, render, screen } from '@testing-library/react'
import { AppProviders } from '../../../src/app/AppProviders'
import { createPermissionSet } from '../../../src/app/auth/permissions'
import {
  I18N_KEY_NOT_FOUND_BODY,
  I18N_KEY_NOT_FOUND_TITLE,
  ROUTE_PATH_DASHBOARD,
  ROUTE_PATH_PRODUCTS,
  ROUTE_PATH_ROOT,
  ROUTE_PATH_TENANTS,
  ROUTE_PATH_USERS,
} from '../../../src/app/constants'
import { i18nResources } from '../../../src/app/i18n/resources'
import {
  type AuthStateSnapshot,
  computeFirstAllowedRoute,
  createDefaultAuthState,
  router,
} from '../../../src/app/router'

const NOT_FOUND_TITLE = i18nResources.common[I18N_KEY_NOT_FOUND_TITLE]
const NOT_FOUND_BODY = i18nResources.common[I18N_KEY_NOT_FOUND_BODY]

const createAuthenticatedState = (overrides: Partial<AuthStateSnapshot>): AuthStateSnapshot => ({
  ...createDefaultAuthState(),
  isAuthenticated: true,
  permissions: createPermissionSet(),
  ...overrides,
})

describe('router configuration', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes router context with a concrete query client', () => {
    expect(router.options.context.queryClient).toBeDefined()
  })

  it('renders the not found route for unknown paths', async () => {
    render(<AppProviders />)

    await act(async () => {
      await router.navigate({ to: '/unknown-route' })
    })

    expect(await screen.findByText(NOT_FOUND_TITLE)).toBeInTheDocument()
    expect(screen.getByText(NOT_FOUND_BODY)).toBeInTheDocument()
  })

  it('prefers products route when product permission is available', () => {
    const authState = createAuthenticatedState({
      permissions: createPermissionSet({ manageProducts: true }),
    })

    expect(computeFirstAllowedRoute(authState)).toBe(ROUTE_PATH_PRODUCTS)
  })

  it('prefers tenants route when tenant permission is available', () => {
    const authState = createAuthenticatedState({
      permissions: createPermissionSet({ manageTenants: true }),
    })

    expect(computeFirstAllowedRoute(authState)).toBe(ROUTE_PATH_TENANTS)
  })

  it('prefers users route when user permission is available', () => {
    const authState = createAuthenticatedState({
      permissions: createPermissionSet({ manageUsers: true }),
    })

    expect(computeFirstAllowedRoute(authState)).toBe(ROUTE_PATH_USERS)
  })

  it('prefers dashboard when analytics permission is available', () => {
    const authState = createAuthenticatedState({
      permissions: createPermissionSet({ viewAnalytics: true }),
    })

    expect(computeFirstAllowedRoute(authState)).toBe(ROUTE_PATH_DASHBOARD)
  })

  it('falls back to root route when no permissions are available', () => {
    const authState = createAuthenticatedState({
      permissions: createPermissionSet(),
    })

    expect(computeFirstAllowedRoute(authState)).toBe(ROUTE_PATH_ROOT)
  })
})
