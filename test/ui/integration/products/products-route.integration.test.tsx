import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ProductsRouteComponent } from '../../../../src/routes/products/ProductsRoute'
import { UI_PRODUCT_BUTTON_CREATE, UI_PRODUCT_STATUS_ERROR_TITLE, UI_PRODUCT_STATUS_LOADING_TITLE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'
import { buildProduct } from '../../../factories/productFactory'
import { buildUser } from '../../../factories/userFactory'
import { buildTenant } from '../../../factories/tenantFactory'

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

    expect(screen.getByText(UI_PRODUCT_STATUS_LOADING_TITLE)).toBeInTheDocument()
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
})

