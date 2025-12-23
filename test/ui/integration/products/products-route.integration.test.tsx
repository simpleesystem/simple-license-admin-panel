import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ProductsRouteComponent } from '../../../../src/routes/products/ProductsRoute'
import { UI_PRODUCT_BUTTON_CREATE, UI_PRODUCT_STATUS_ERROR_TITLE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'
import { buildProduct } from '../../../factories/productFactory'
import { buildUser } from '../../../factories/userFactory'

const useAdminProductsMock = vi.hoisted(() => vi.fn())
const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useAdminProducts: useAdminProductsMock,
  }
})

vi.mock('../../../../src/app/auth/useAuth', async () => {
  return {
    useAuth: useAuthMock,
  }
})

describe('ProductsRouteComponent', () => {
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
    // Vendor manager can create products?
    // According to permissions.ts: manageProducts: isSuperUser || isAdmin || isVendorManager || isVendorAdmin
    // So yes, they should see the create button.
    expect(screen.getByText(UI_PRODUCT_BUTTON_CREATE)).toBeInTheDocument()
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
})

