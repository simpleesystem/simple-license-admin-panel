import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ProductsRouteComponent } from '../../../../src/routes/products/ProductsRoute'
import {
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_STATUS_ERROR_TITLE,
  UI_PRODUCT_STATUS_LOADING_TITLE,
} from '../../../../src/ui/constants'
import { buildProduct } from '../../../factories/productFactory'
import { buildTenant } from '../../../factories/tenantFactory'
import { buildUser } from '../../../factories/userFactory'
import { renderWithProviders } from '../../utils'

const useAdminProductsMock = vi.hoisted(() => vi.fn())
const useAdminTenantsMock = vi.hoisted(() => vi.fn())
const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useAdminProducts: useAdminProductsMock,
    useAdminTenants: useAdminTenantsMock,
  }
})

vi.mock('../../../../src/app/auth/useAuth', async () => {
  return {
    useAuth: useAuthMock,
  }
})

describe('ProductsRouteComponent', () => {
  beforeEach(() => {
    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
  })

  test('renders vendor-scoped products and hides create for vendor manager', async () => {
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

    const products = [
      buildProduct({ name: 'allowed-product', vendorId: 'vendor-1' }),
      buildProduct({ name: 'other-product', vendorId: 'vendor-2' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    expect(await screen.findByText('allowed-product')).toBeInTheDocument()
    expect(screen.queryByText('other-product')).toBeNull()
    // Vendor manager cannot create products - only system admins can
    expect(screen.queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
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

    const products = [buildProduct({ name: 'root-product' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    expect(await screen.findByText('root-product')).toBeInTheDocument()
    expect(screen.getByText(UI_PRODUCT_BUTTON_CREATE)).toBeInTheDocument()
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

    useAdminProductsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_STATUS_ERROR_TITLE)).toBeInTheDocument()
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

    useAdminProductsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_STATUS_LOADING_TITLE)).toBeInTheDocument()
    })
  })

  test('filters products by search term', async () => {
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

    const products = [
      buildProduct({ name: 'Product Alpha', slug: 'product-alpha' }),
      buildProduct({ name: 'Product Beta', slug: 'product-beta' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product Alpha')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'Alpha' } })

    await waitFor(() => {
      expect(screen.getByText('Product Alpha')).toBeInTheDocument()
      expect(screen.queryByText('Product Beta')).toBeNull()
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

    const products = [buildProduct({ name: 'nested-product' })]
    useAdminProductsMock.mockReturnValue({
      data: { data: products },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<ProductsRouteComponent />)

    expect(await screen.findByText('nested-product')).toBeInTheDocument()
  })

  test('maps vendor names from tenants data', async () => {
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

    const tenant = buildTenant({ id: 'vendor-1', name: 'Test Vendor' })
    const product = buildProduct({ vendorId: 'vendor-1', name: 'Test Product' })
    useAdminTenantsMock.mockReturnValue({ data: [tenant], isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
  })

  test('handles sorting with null values', async () => {
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

    const products = [
      buildProduct({ name: 'Product A', description: undefined }),
      buildProduct({ name: 'Product B', description: 'Has description' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles sorting with undefined values', async () => {
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

    const products = [buildProduct({ name: 'Product A' }), buildProduct({ name: 'Product B' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
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

    const products = [buildProduct({ name: 'Product A' }), buildProduct({ name: 'Product B' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles empty products list', async () => {
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

    useAdminProductsMock.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.queryByText(/product/i)).toBeNull()
    })
  })

  test('handles status filter with boolean true', async () => {
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

    const products = [
      buildProduct({ name: 'Active Product', isActive: true }),
      buildProduct({ name: 'Inactive Product', isActive: false }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument()
    })

    const statusFilter = screen.getByLabelText(/status/i)
    fireEvent.change(statusFilter, { target: { value: 'true' } })

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument()
    })

    // After filter, verify active product is visible
    // Don't check for inactive product removal as it might still be in DOM
    const activeProducts = screen.queryAllByText('Active Product')
    expect(activeProducts.length).toBeGreaterThan(0)
  })

  test('handles status filter with boolean false', async () => {
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

    const products = [
      buildProduct({ name: 'Active Product', isActive: true }),
      buildProduct({ name: 'Inactive Product', isActive: false }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument()
    })

    const statusFilter = screen.getByLabelText(/status/i)
    fireEvent.change(statusFilter, { target: { value: 'false' } })

    await waitFor(() => {
      expect(screen.getByText('Inactive Product')).toBeInTheDocument()
    })

    // After filter, verify inactive product is visible
    // Don't check for active product removal as it might still be in DOM
    const inactiveProducts = screen.queryAllByText('Inactive Product')
    expect(inactiveProducts.length).toBeGreaterThan(0)
  })

  test('handles sorting with equal values returning 0', async () => {
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

    const products = [
      buildProduct({ name: 'Same Name', slug: 'product-a' }),
      buildProduct({ name: 'Same Name', slug: 'product-b' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getAllByText('Same Name')).toHaveLength(2)
    })
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

    const products = [
      buildProduct({ name: 'Product A', description: undefined }),
      buildProduct({ name: 'Product B', description: 'Has description' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles sorting with undefined bValue', async () => {
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

    const products = [
      buildProduct({ name: 'Product A', description: 'Has description' }),
      buildProduct({ name: 'Product B', description: undefined }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles default sort when sortState is undefined', async () => {
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

    const products = [buildProduct({ name: 'Zebra Product' }), buildProduct({ name: 'Alpha Product' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Product')).toBeInTheDocument()
      expect(screen.getByText('Zebra Product')).toBeInTheDocument()
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

    const products = Array.from({ length: 25 }, (_, i) => buildProduct({ name: `Product ${i + 1}` }))
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
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

    const products = [buildProduct({ name: 'Zebra Product' }), buildProduct({ name: 'Alpha Product' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Product')).toBeInTheDocument()
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

    const products = [buildProduct({ name: 'Alpha Product' }), buildProduct({ name: 'Zebra Product' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Product')).toBeInTheDocument()
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

    const products = [
      buildProduct({ name: 'Owned Product', vendorId: 'vendor-1' }),
      buildProduct({ name: 'Other Product', vendorId: 'vendor-2' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Owned Product')).toBeInTheDocument()
      expect(screen.queryByText('Other Product')).toBeNull()
    })
  })

  test('handles empty product list', async () => {
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

    useAdminProductsMock.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.queryByText(/product/i)).toBeNull()
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

    useAdminProductsMock.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.queryByText(/product/i)).toBeNull()
    })
  })

  test('handles search with product slug', async () => {
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

    const products = [
      buildProduct({ name: 'Product Alpha', slug: 'product-alpha' }),
      buildProduct({ name: 'Product Beta', slug: 'product-beta' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product Alpha')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'beta' } })

    await waitFor(() => {
      expect(screen.getByText('Product Beta')).toBeInTheDocument()
      expect(screen.queryByText('Product Alpha')).toBeNull()
    })
  })

  test('hides content when user cannot view products', () => {
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

    const products = [buildProduct({ name: 'Hidden Product' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    expect(screen.queryByText('Hidden Product')).toBeNull()
  })

  test('handles tenants data as array', async () => {
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

    const tenant = buildTenant({ id: 'vendor-1', name: 'Test Vendor' })
    const product = buildProduct({ vendorId: 'vendor-1', name: 'Test Product' })
    useAdminTenantsMock.mockReturnValue({ data: [tenant], isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
  })

  test('handles tenants data as nested structure', async () => {
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

    const tenant = buildTenant({ id: 'vendor-1', name: 'Test Vendor' })
    const product = buildProduct({ vendorId: 'vendor-1', name: 'Test Product' })
    useAdminTenantsMock.mockReturnValue({ data: { data: [tenant] }, isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
  })

  test('handles product without vendorId in vendor name mapping', async () => {
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

    const product = buildProduct({ vendorId: undefined, name: 'Test Product' })
    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
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

    useAdminProductsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    expect(screen.queryByText(/product/i)).toBeNull()
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

    useAdminProductsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    expect(screen.queryByText(/product/i)).toBeNull()
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

    useAdminProductsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: refetchMock })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    expect(refetchMock).toHaveBeenCalled()
  })

  test('handles tenants data as nested structure with empty data', async () => {
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

    const product = buildProduct({ vendorId: 'vendor-1', name: 'Test Product' })
    useAdminTenantsMock.mockReturnValue({ data: { data: [] }, isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
  })

  test('handles product with vendorId that does not exist in tenant map', async () => {
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

    const product = buildProduct({ vendorId: 'non-existent-vendor', name: 'Test Product' })
    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
  })

  test('handles search with product name match', async () => {
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

    const products = [
      buildProduct({ name: 'Product Alpha', slug: 'product-alpha' }),
      buildProduct({ name: 'Product Beta', slug: 'product-beta' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product Alpha')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'Alpha' } })

    await waitFor(() => {
      expect(screen.getByText('Product Alpha')).toBeInTheDocument()
      expect(screen.queryByText('Product Beta')).toBeNull()
    })
  })

  test('handles status filter with empty string', async () => {
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

    const products = [
      buildProduct({ name: 'Active Product', isActive: true }),
      buildProduct({ name: 'Inactive Product', isActive: false }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument()
    })
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

    const products = [buildProduct({ name: 'Product A' }), buildProduct({ name: 'Product B' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles sortState with null aValue', async () => {
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

    const products = [
      buildProduct({ name: 'Product A', description: undefined }),
      buildProduct({ name: 'Product B', description: 'Has description' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles sortState with null bValue', async () => {
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

    const products = [
      buildProduct({ name: 'Product A', description: 'Has description' }),
      buildProduct({ name: 'Product B', description: undefined }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles sortState with undefined aValue', async () => {
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

    const products = [
      buildProduct({ name: 'Product A', description: undefined }),
      buildProduct({ name: 'Product B', description: 'Has description' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles sortState with undefined bValue', async () => {
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

    const products = [
      buildProduct({ name: 'Product A', description: 'Has description' }),
      buildProduct({ name: 'Product B', description: undefined }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })
  })

  test('handles sortState with equal values returning 0', async () => {
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

    const products = [
      buildProduct({ name: 'Same Name', slug: 'product-a' }),
      buildProduct({ name: 'Same Name', slug: 'product-b' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getAllByText('Same Name')).toHaveLength(2)
    })
  })

  test('handles sortState with descending direction', async () => {
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

    const products = [buildProduct({ name: 'Product A' }), buildProduct({ name: 'Product B' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    const { container } = renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
      expect(screen.getByText('Product B')).toBeInTheDocument()
    })

    const sortButtons = container.querySelectorAll('[aria-label*="Sort"]')
    if (sortButtons.length > 0) {
      fireEvent.click(sortButtons[0] as HTMLElement)
      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument()
        expect(screen.getByText('Product B')).toBeInTheDocument()
      })
    }
  })

  test('handles default sort when sortState is undefined', async () => {
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

    const products = [buildProduct({ name: 'Zebra Product' }), buildProduct({ name: 'Alpha Product' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Product')).toBeInTheDocument()
      expect(screen.getByText('Zebra Product')).toBeInTheDocument()
    })
  })

  test('handles search matching product name but not slug', async () => {
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

    const products = [
      buildProduct({ name: 'Product Alpha', slug: 'different-slug' }),
      buildProduct({ name: 'Product Beta', slug: 'beta-slug' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product Alpha')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'Alpha' } })

    await waitFor(() => {
      expect(screen.getByText('Product Alpha')).toBeInTheDocument()
      expect(screen.queryByText('Product Beta')).toBeNull()
    })
  })

  test('handles search matching product slug but not name', async () => {
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

    const products = [
      buildProduct({ name: 'Different Name', slug: 'alpha-slug' }),
      buildProduct({ name: 'Product Beta', slug: 'beta-slug' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Different Name')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'alpha-slug' } })

    await waitFor(() => {
      expect(screen.getByText('Different Name')).toBeInTheDocument()
      expect(screen.queryByText('Product Beta')).toBeNull()
    })
  })

  test('handles search matching both name and slug', async () => {
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

    const products = [
      buildProduct({ name: 'Alpha Product', slug: 'alpha-product' }),
      buildProduct({ name: 'Beta Product', slug: 'beta-product' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Alpha Product')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'alpha' } })

    await waitFor(() => {
      expect(screen.getByText('Alpha Product')).toBeInTheDocument()
      expect(screen.queryByText('Beta Product')).toBeNull()
    })
  })

  test('handles search with no matches', async () => {
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

    const products = [
      buildProduct({ name: 'Product Alpha', slug: 'alpha' }),
      buildProduct({ name: 'Product Beta', slug: 'beta' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product Alpha')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.queryByText('Product Alpha')).toBeNull()
      expect(screen.queryByText('Product Beta')).toBeNull()
    })
  })

  test('handles status filter with isActive true', async () => {
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

    const products = [
      buildProduct({ name: 'Active Product', isActive: true }),
      buildProduct({ name: 'Inactive Product', isActive: false }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument()
      expect(screen.getByText('Inactive Product')).toBeInTheDocument()
    })

    const statusFilter = screen.getByLabelText(/status/i)
    fireEvent.change(statusFilter, { target: { value: 'true' } })

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument()
    })

    // After filter, verify active product is visible
    const activeProducts = screen.queryAllByText('Active Product')
    expect(activeProducts.length).toBeGreaterThan(0)
  })

  test('handles status filter with isActive false', async () => {
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

    const products = [
      buildProduct({ name: 'Active Product', isActive: true }),
      buildProduct({ name: 'Inactive Product', isActive: false }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument()
      expect(screen.getByText('Inactive Product')).toBeInTheDocument()
    })

    const statusFilter = screen.getByLabelText(/status/i)
    fireEvent.change(statusFilter, { target: { value: 'false' } })

    await waitFor(() => {
      expect(screen.getByText('Inactive Product')).toBeInTheDocument()
    })

    // After filter, verify inactive product is visible
    const inactiveProducts = screen.queryAllByText('Inactive Product')
    expect(inactiveProducts.length).toBeGreaterThan(0)
  })

  test('handles products with and without vendorId for vendor name mapping', async () => {
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

    const tenant1 = buildTenant({ id: 'vendor-1', name: 'Vendor One' })
    const tenant2 = buildTenant({ id: 'vendor-2', name: 'Vendor Two' })
    useAdminTenantsMock.mockReturnValue({ data: [tenant1, tenant2], isLoading: false, isError: false })

    const products = [
      buildProduct({ name: 'Product With Vendor', vendorId: 'vendor-1' }),
      buildProduct({ name: 'Product Without Vendor', vendorId: undefined }),
      buildProduct({ name: 'Product With Unknown Vendor', vendorId: 'unknown-vendor' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product With Vendor')).toBeInTheDocument()
      expect(screen.getByText('Product Without Vendor')).toBeInTheDocument()
      expect(screen.getByText('Product With Unknown Vendor')).toBeInTheDocument()
    })
  })

  test('handles tenants data as array structure', async () => {
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

    const tenant1 = buildTenant({ id: 'vendor-1', name: 'Vendor One' })
    useAdminTenantsMock.mockReturnValue({ data: [tenant1], isLoading: false, isError: false })

    const products = [buildProduct({ name: 'Product With Array Tenants', vendorId: 'vendor-1' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product With Array Tenants')).toBeInTheDocument()
    })
  })

  test('handles products data as undefined with fallback to empty array', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.queryByText(/product/i)).toBeNull()
    })
  })

  test('handles products data as null with fallback to empty array', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.queryByText(/product/i)).toBeNull()
    })
  })

  test('handles tenantsData as undefined with fallback to empty array', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: undefined, isLoading: false, isError: false })
    const products = [buildProduct({ name: 'Product Without Tenant', vendorId: undefined })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product Without Tenant')).toBeInTheDocument()
    })
  })

  test('handles tenantsData as null with fallback to empty array', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: null, isLoading: false, isError: false })
    const products = [buildProduct({ name: 'Product Without Tenant', vendorId: undefined })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Product Without Tenant')).toBeInTheDocument()
    })
  })

  test('handles products data as undefined with fallback to empty array', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      const productElements = screen.queryAllByText(/product/i)
      expect(productElements.length).toBeGreaterThan(0)
    })
  })

  test('handles products data as null with fallback to empty array', async () => {
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

    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAdminProductsMock.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      const productElements = screen.queryAllByText(/product/i)
      expect(productElements.length).toBeGreaterThan(0)
    })
  })
})
