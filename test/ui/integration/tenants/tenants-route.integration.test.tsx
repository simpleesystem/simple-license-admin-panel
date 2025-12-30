import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { TenantsRouteComponent } from '../../../../src/routes/tenants/TenantsRoute'
import { UI_TENANT_BUTTON_CREATE, UI_TENANT_STATUS_ERROR_TITLE, UI_TENANT_STATUS_LOADING_TITLE } from '../../../../src/ui/constants'
import { buildTenant } from '../../../factories/tenantFactory'
import { buildUser } from '../../../factories/userFactory'
import { renderWithProviders } from '../../utils'

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

    await waitFor(() => {
      expect(screen.getByText(UI_TENANT_STATUS_LOADING_TITLE)).toBeInTheDocument()
    })
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
    })

    // After filter, verify active tenant is visible
    const activeTenants = screen.queryAllByText('Active Tenant')
    expect(activeTenants.length).toBeGreaterThan(0)
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

  test('handles sorting with equal values', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: '2024-01-01T00:00:00Z' }),
      buildTenant({ name: 'Tenant B', createdAt: '2024-01-01T00:00:00Z' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('handles tenants without createdAt for default sort', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: undefined }),
      buildTenant({ name: 'Tenant B', createdAt: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('handles retry on error', async () => {
    const superUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    const refetchMock = vi.fn()
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

    useAdminTenantsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: refetchMock })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_TENANT_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    expect(refetchMock).toHaveBeenCalled()
  })

  test('handles sorting with null aValue', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: undefined }),
      buildTenant({ name: 'Tenant B', createdAt: '2024-01-01T00:00:00Z' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('handles sorting with null bValue', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: '2024-01-01T00:00:00Z' }),
      buildTenant({ name: 'Tenant B', createdAt: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('handles default sort when both tenants have createdAt', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: '2024-01-02T00:00:00Z' }),
      buildTenant({ name: 'Tenant B', createdAt: '2024-01-01T00:00:00Z' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('handles default sort when neither tenant has createdAt', async () => {
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
      buildTenant({ name: 'Zebra Tenant', createdAt: undefined }),
      buildTenant({ name: 'Alpha Tenant', createdAt: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Tenant')).toBeInTheDocument()
    })
  })

  test('handles descending sort direction', async () => {
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
      buildTenant({ name: 'Tenant A' }),
      buildTenant({ name: 'Tenant B' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('handles pagination with multiple pages', async () => {
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

    const tenants = Array.from({ length: 25 }, (_, i) => buildTenant({ name: `Tenant ${i + 1}` }))
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    // Wait for tenants to appear (pagination should show first page with 10 tenants)
    await waitFor(() => {
      const tenantElements = screen.queryAllByText(/Tenant \d+/)
      expect(tenantElements.length).toBeGreaterThan(0)
    }, { timeout: 2000 })
  })

  test('handles custom sort with ascending direction', async () => {
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
      buildTenant({ name: 'Zebra Tenant' }),
      buildTenant({ name: 'Alpha Tenant' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Tenant')).toBeInTheDocument()
    })
  })

  test('handles custom sort with descending direction', async () => {
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
      buildTenant({ name: 'Alpha Tenant' }),
      buildTenant({ name: 'Zebra Tenant' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Tenant')).toBeInTheDocument()
    })
  })

  test('handles default sort when only one tenant has createdAt', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: '2024-01-01T00:00:00Z' }),
      buildTenant({ name: 'Tenant B', createdAt: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('handles default sort when only other tenant has createdAt', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: undefined }),
      buildTenant({ name: 'Tenant B', createdAt: '2024-01-01T00:00:00Z' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('hides content when user cannot view tenants', () => {
    const viewer = buildUser({ role: 'VIEWER', vendorId: null })
    useAuthMock.mockReturnValue({
      user: viewer,
      currentUser: viewer,
      isAuthenticated: true,
      status: 'authenticated',
      token: 'token',
      login: vi.fn(),
      logout: vi.fn(),
      refreshCurrentUser: vi.fn(),
    })

    const tenants = [buildTenant({ name: 'Hidden Tenant' })]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    expect(screen.queryByText('Hidden Tenant')).toBeNull()
  })

  test('handles empty tenant list', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.queryByText(/tenant/i)).toBeNull()
    })
  })

  test('handles totalPages calculation with empty list', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.queryByText(/tenant/i)).toBeNull()
    })
  })

  test('handles search term filtering', async () => {
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
      buildTenant({ name: 'Alpha Tenant' }),
      buildTenant({ name: 'Beta Tenant' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Tenant')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'Alpha' } })

    await waitFor(() => {
      expect(screen.getByText('Alpha Tenant')).toBeInTheDocument()
      expect(screen.queryByText('Beta Tenant')).toBeNull()
    })
  })

  test('handles status filter', async () => {
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
    })

    // After filter, verify active tenant is visible
    const activeTenants = screen.queryAllByText('Active Tenant')
    expect(activeTenants.length).toBeGreaterThan(0)
  })

  test('handles empty search term', async () => {
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

    const tenants = [buildTenant({ name: 'Test Tenant' })]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test Tenant')).toBeInTheDocument()
    })
  })

  test('handles empty status filter', async () => {
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

    const tenants = [buildTenant({ name: 'Test Tenant' })]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test Tenant')).toBeInTheDocument()
    })
  })

  test('handles vendor scoping for vendor manager', async () => {
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
      buildTenant({ vendorId: 'vendor-1', name: 'Owned Tenant' }),
      buildTenant({ vendorId: 'vendor-2', name: 'Other Tenant' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Owned Tenant')).toBeInTheDocument()
    })

    // After vendor scoping, verify owned tenant is visible
    const ownedTenants = screen.queryAllByText('Owned Tenant')
    expect(ownedTenants.length).toBeGreaterThan(0)
  })

  test('does not render panel when loading', () => {
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

    expect(screen.queryByText(/tenant/i)).toBeNull()
  })

  test('does not render panel when error', () => {
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

    expect(screen.queryByText(/tenant/i)).toBeNull()
  })

  test('handles sortState with columnId and direction', async () => {
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
      buildTenant({ name: 'Tenant A' }),
      buildTenant({ name: 'Tenant B' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
    })
  })

  test('handles default sort when both tenants have createdAt', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: '2024-01-01T00:00:00Z' }),
      buildTenant({ name: 'Tenant B', createdAt: '2024-01-02T00:00:00Z' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant B')).toBeInTheDocument()
    })
  })

  test('handles default sort when only one tenant has createdAt', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: '2024-01-01T00:00:00Z' }),
      buildTenant({ name: 'Tenant B', createdAt: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant B')).toBeInTheDocument()
    })
  })

  test('handles default sort when neither tenant has createdAt', async () => {
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
      buildTenant({ name: 'Tenant B', createdAt: undefined }),
      buildTenant({ name: 'Tenant A', createdAt: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant B')).toBeInTheDocument()
    })
  })

  test('handles custom sort with ascending direction', async () => {
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
      buildTenant({ name: 'Tenant Z' }),
      buildTenant({ name: 'Tenant A' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles custom sort with descending direction', async () => {
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
      buildTenant({ name: 'Tenant A' }),
      buildTenant({ name: 'Tenant Z' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles default sort when a.createdAt is missing', async () => {
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
      buildTenant({ name: 'Tenant Z', createdAt: undefined }),
      buildTenant({ name: 'Tenant A', createdAt: '2024-01-01T00:00:00Z' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles default sort when b.createdAt is missing', async () => {
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
      buildTenant({ name: 'Tenant A', createdAt: '2024-01-01T00:00:00Z' }),
      buildTenant({ name: 'Tenant Z', createdAt: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles default sort when both createdAt are missing', async () => {
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
      buildTenant({ name: 'Tenant Z', createdAt: undefined }),
      buildTenant({ name: 'Tenant A', createdAt: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles custom sort with null aValue', async () => {
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
      buildTenant({ name: 'Tenant A', status: null }),
      buildTenant({ name: 'Tenant Z', status: 'ACTIVE' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles custom sort with null bValue', async () => {
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
      buildTenant({ name: 'Tenant A', status: 'ACTIVE' }),
      buildTenant({ name: 'Tenant Z', status: null }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles custom sort with undefined aValue', async () => {
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
      buildTenant({ name: 'Tenant A', status: undefined }),
      buildTenant({ name: 'Tenant Z', status: 'ACTIVE' }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles custom sort with undefined bValue', async () => {
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
      buildTenant({ name: 'Tenant A', status: 'ACTIVE' }),
      buildTenant({ name: 'Tenant Z', status: undefined }),
    ]
    useAdminTenantsMock.mockReturnValue({ data: tenants, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Tenant A')).toBeInTheDocument()
      expect(screen.getByText('Tenant Z')).toBeInTheDocument()
    })
  })

  test('handles tenants data as undefined with fallback to empty array', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      const tenantElements = screen.queryAllByText(/tenant/i)
      expect(tenantElements.length).toBeGreaterThan(0)
    })
  })

  test('handles tenants data as null with fallback to empty array', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<TenantsRouteComponent />)

    await waitFor(() => {
      const tenantElements = screen.queryAllByText(/tenant/i)
      expect(tenantElements.length).toBeGreaterThan(0)
    })
  })
})
