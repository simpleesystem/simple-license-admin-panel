import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { TenantsRouteComponent } from '../../../../src/routes/tenants/TenantsRoute'
import { UI_TENANT_BUTTON_CREATE, UI_TENANT_STATUS_ERROR_TITLE, UI_TENANT_STATUS_LOADING_TITLE } from '../../../../src/ui/constants'
import { buildTenant'../../../facto../factories/tenantFactorytenantFactory'
import { buildUser from '../../../factories/ususerFactory
import { renderWithProvidershProvider from utils

const useAdminTenantsMock = vi.hoisted(() => vi.fn())
const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
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

  test('shows loading state', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    expect(screen.getByText(UI_TENANT_STATUS_LOADING_TITLE)).toBeInTheDocument()
  })

  test('filters tenants by search term', async () => {
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

    const tenants = [
      buildTenant({ name: 'Tenant Alpha' }),
      buildTenant({ name: 'Tenant Beta' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant Alpha')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'Alpha' } })

    await waitFor(() => {
      expect(screen.getByText('Tenant Alpha')).toBeInTheDocument()
      expect(screen.queryByText('Tenant Beta')).toBeNull()
    })
  })

  test('filters tenants by status', async () => {
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

    const tenants = [
      buildTenant({ name: 'Active Tenant', status: 'ACTIVE' }),
      buildTenant({ name: 'Suspended Tenant', status: 'SUSPENDED' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Active Tenant')).toBeInTheDocument()
    })

    const statusFilter = screen.getByLabelText(/status/i)
    fireEvent.change(statusFilter, { target: { value: 'ACTIVE' } })

    await waitFor(() => {
      expect(screen.getByText('Active Tenant')).toBeInTheDocument()
      expect(screen.queryByText('Suspended Tenant')).toBeNull()
    })
  })

  test('handles nested data structure', async () => {
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

    const tenants = [buildTenant({ name: 'nested-tenant' })]
    useAdminTenantsMock.mockReturnValue({
      data: { data: tenants },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<TenantsRouteComponent />)

    expect(await screen.findByText('nested-tenant')).toBeInTheDocument()
  })

  test('handles array data structure', async () => {
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

    const tenants = [buildTenant({ name: 'array-tenant' })]
    useAdminTenantsMock.mockReturnValue({
      data: tenants,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<TenantsRouteComponent />)

    expect(await screen.findByText('array-tenant')).toBeInTheDocument()
  })
})

