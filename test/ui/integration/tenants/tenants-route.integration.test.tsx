import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { TenantsRouteComponent } from '../../../../src/routes/tenants/TenantsRoute'
import { UI_TENANT_BUTTON_CREATE, UI_TENANT_STATUS_ERROR_TITLE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'
import { buildTenant } from '../../../factories/tenantFactory'
import { buildUser } from '../../../factories/userFactory'

const useAdminTenantsMock = vi.hoisted(() => vi.fn())
const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useAdminTenants: useAdminTenantsMock,
  }
})

vi.mock('../../../../src/app/auth/useAuth', async () => {
  return {
    useAuth: useAuthMock,
  }
})

describe('TenantsRouteComponent', () => {
  test('renders vendor-scoped tenants and hides create for vendor manager', async () => {
    const vendorUser = buildUser({ role: 'VENDOR_MANAGER', vendorId: 'vendor-1' })
    useAuthMock.mockReturnValue({
      user: vendorUser,
      currentUser: vendorUser,
      isAuthenticated: true,
      status: 'authenticated',
      token: 'token',
      login: vi.fn(),
      logout: vi.fn(),
      refreshCurrentUser: vi.fn(),
    })

    const tenants = [
      buildTenant({ name: 'allowed-tenant', vendorId: 'vendor-1' }),
      buildTenant({ name: 'other-tenant', vendorId: 'vendor-2' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    expect(await screen.findByText('allowed-tenant')).toBeInTheDocument()
    expect(screen.queryByText('other-tenant')).toBeNull()
    expect(screen.queryByText(UI_TENANT_BUTTON_CREATE)).toBeNull()
  })

  test('shows create action for superuser', async () => {
    const superUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    useAuthMock.mockReturnValue({
      user: superUser,
      currentUser: superUser,
      isAuthenticated: true,
      status: 'authenticated',
      token: 'token',
      login: vi.fn(),
      logout: vi.fn(),
      refreshCurrentUser: vi.fn(),
    })

    const tenants = [buildTenant({ name: 'root-tenant' })]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    expect(await screen.findByText('root-tenant')).toBeInTheDocument()
    expect(screen.getByText(UI_TENANT_BUTTON_CREATE)).toBeInTheDocument()
  })

  test('shows error state when list request fails', async () => {
    const superUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    useAuthMock.mockReturnValue({
      user: superUser,
      currentUser: superUser,
      isAuthenticated: true,
      status: 'authenticated',
      token: 'token',
      login: vi.fn(),
      logout: vi.fn(),
      refreshCurrentUser: vi.fn(),
    })

    useAdminTenantsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_TENANT_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })
  })
})

