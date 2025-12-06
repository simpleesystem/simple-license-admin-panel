import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ProductsRouteComponent } from '../../../../src/routes/products/ProductsRoute'
import { UI_PRODUCT_BUTTON_CREATE, UI_PRODUCT_STATUS_ERROR_TITLE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'
import { buildProduct } from '../../../factories/productFactory'
import { buildUser } from '../../../factories/userFactory'

const useAdminProductsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useAdminProducts: useAdminProductsMock,
  }
})

let authUser = buildUser({ role: 'SUPERUSER' })

vi.mock('../../../../src/app/auth/authContext', async () => {
  const actual = await vi.importActual<typeof import('../../../../src/app/auth/authContext')>(
    '../../../../src/app/auth/authContext'
  )
  return {
    ...actual,
    useAuth: () => ({
      currentUser: authUser,
      isAuthenticated: true,
      status: actual.AUTH_STATUS_IDLE,
      token: 'token',
      login: vi.fn(),
      logout: vi.fn(),
      refreshCurrentUser: vi.fn(),
    }),
  }
})

describe('ProductsRouteComponent', () => {
  test('renders vendor-scoped products and hides create for vendor manager', async () => {
    const vendorUser = buildUser({ role: 'VENDOR_MANAGER', vendorId: 'vendor-1' })
    authUser = vendorUser
    const products = [
      buildProduct({ name: 'allowed-product', vendorId: 'vendor-1' }),
      buildProduct({ name: 'other-product', vendorId: 'vendor-2' }),
    ]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    expect(await screen.findByText('allowed-product')).toBeInTheDocument()
    expect(screen.queryByText('other-product')).toBeNull()
    expect(screen.queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
  })

  test('shows create action for superuser', async () => {
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    const products = [buildProduct({ name: 'root-product' })]
    useAdminProductsMock.mockReturnValue({ data: products, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    expect(await screen.findByText('root-product')).toBeInTheDocument()
    expect(screen.getByText(UI_PRODUCT_BUTTON_CREATE)).toBeInTheDocument()
  })

  test('shows error state when list request fails', async () => {
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    useAdminProductsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<ProductsRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })
  })
})

