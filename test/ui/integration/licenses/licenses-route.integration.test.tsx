import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { ListLicensesRequest } from '@/simpleLicense'
import { ROUTE_PATH_PRODUCTS } from '../../../../src/app/constants'
import { LicensesRouteComponent } from '../../../../src/routes/licenses/LicensesRoute'
import {
  UI_LICENSE_COLUMN_HEADER_PRODUCT,
  UI_LICENSE_EMPTY_STATE_MESSAGE,
  UI_LICENSE_PRODUCT_FILTER_LABEL,
  UI_LICENSE_STATUS_DELETED,
  UI_LICENSE_STATUS_ERROR_TITLE,
  UI_TABLE_PAGE_SIZE_LABEL,
  UI_TABLE_PAGINATION_NEXT,
  UI_TENANT_FILTER_LABEL,
  UI_TEST_ID_COPY_BUTTON,
  UI_TEST_ID_COPYABLE_VALUE,
  UI_TEST_ID_ENTITY_LINK,
  UI_USER_ROLE_SUPERUSER,
  UI_USER_ROLE_VENDOR_MANAGER,
  UI_USER_ROLE_VIEWER,
} from '../../../../src/ui/constants'
import { buildLicense, buildProduct, buildProductTier } from '../../../factories/licenseFactory'
import { buildUser } from '../../../factories/userFactory'
import { renderWithProviders } from '../../utils'

const useAdminLicensesMock = vi.hoisted(() => vi.fn())
const useAdminProductsMock = vi.hoisted(() => vi.fn())
const useAdminTenantsMock = vi.hoisted(() => vi.fn())
const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useAdminLicenses: useAdminLicensesMock,
    useAdminProducts: useAdminProductsMock,
    useAdminTenants: useAdminTenantsMock,
  }
})

vi.mock('../../../../src/app/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../../../../src/app/auth/useAuth', async () => {
  return {
    useAuth: useAuthMock,
  }
})

/**
 * Reads the filter/pagination argument passed to the most recent `useAdminLicenses`
 * call. The route now translates table state into server query params, so these
 * assertions verify the UI -> server wiring rather than any client-side filtering.
 */
function getLastLicenseFilters(): ListLicensesRequest | undefined {
  const { calls } = useAdminLicensesMock.mock
  return calls.at(-1)?.[1] as ListLicensesRequest | undefined
}

function asSuperuser() {
  const superuser = buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null })
  useAuthMock.mockReturnValue({ user: superuser, currentUser: superuser, isAuthenticated: true })
  return superuser
}

function mockLicenses(data: unknown, extra: Record<string, unknown> = {}) {
  useAdminLicensesMock.mockReturnValue({ data, isLoading: false, isError: false, refetch: vi.fn(), ...extra })
}

describe('LicensesRouteComponent', () => {
  beforeEach(() => {
    useAdminProductsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAdminTenantsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
  })

  describe('rendering and response shapes', () => {
    test('renders vendor-scoped licenses and hides others for vendor manager', async () => {
      const vendorUser = buildUser({ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId: 'vendor-1' })
      useAuthMock.mockReturnValue({ user: vendorUser, currentUser: vendorUser, isAuthenticated: true })
      mockLicenses([
        buildLicense({ customerEmail: 'allowed@example.com', vendorId: 'vendor-1', status: 'ACTIVE' }),
        buildLicense({ customerEmail: 'other@example.com', vendorId: 'vendor-2', status: 'ACTIVE' }),
      ])

      renderWithProviders(<LicensesRouteComponent />)

      expect(await screen.findByText('allowed@example.com')).toBeInTheDocument()
      expect(screen.queryByText('other@example.com')).toBeNull()
    })

    test('shows licenses for superuser', async () => {
      asSuperuser()
      mockLicenses([buildLicense({ customerEmail: 'root@example.com', status: 'ACTIVE' })])

      renderWithProviders(<LicensesRouteComponent />)

      expect(await screen.findByText('root@example.com')).toBeInTheDocument()
    })

    test('renders licenses when payload is nested under a data key', async () => {
      asSuperuser()
      mockLicenses({ data: [buildLicense({ customerEmail: 'nested@example.com', status: 'ACTIVE' })] })

      renderWithProviders(<LicensesRouteComponent />)

      expect(await screen.findByText('nested@example.com')).toBeInTheDocument()
    })

    test('renders the empty state when the server returns no rows', async () => {
      asSuperuser()
      mockLicenses({ data: [], pagination: { total: 0, totalPages: 1, page: 1, limit: 10 } })

      renderWithProviders(<LicensesRouteComponent />)

      expect(await screen.findByText(UI_LICENSE_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
    })

    test('treats undefined data as an empty list without crashing', async () => {
      asSuperuser()
      mockLicenses(undefined)

      renderWithProviders(<LicensesRouteComponent />)

      expect(await screen.findByText(UI_LICENSE_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
    })

    test('exposes the license key as a copyable value and the product as a cross-link', async () => {
      asSuperuser()
      mockLicenses([
        buildLicense({
          customerEmail: 'wired@example.com',
          licenseKey: 'KEYABCD12345',
          productSlug: 'wired-product',
          status: 'ACTIVE',
        }),
      ])

      renderWithProviders(<LicensesRouteComponent />)

      const keyText = await screen.findByText('KEYABCD12345')
      const keyCopyable = keyText.closest(`[data-testid="${UI_TEST_ID_COPYABLE_VALUE}"]`)
      expect(keyCopyable).not.toBeNull()
      expect(within(keyCopyable as HTMLElement).getByTestId(UI_TEST_ID_COPY_BUTTON)).toBeInTheDocument()

      const productLink = screen.getByTestId(UI_TEST_ID_ENTITY_LINK)
      expect(productLink).toHaveAttribute('href', ROUTE_PATH_PRODUCTS)
      expect(productLink).toHaveTextContent('wired-product')
    })
  })

  describe('route status and permissions', () => {
    test('shows the loading state', () => {
      asSuperuser()
      useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })

      renderWithProviders(<LicensesRouteComponent />)

      expect(screen.getByText(/Loading licenses/i)).toBeInTheDocument()
    })

    test('shows the error state when the list request fails', async () => {
      asSuperuser()
      useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

      renderWithProviders(<LicensesRouteComponent />)

      await waitFor(() => {
        expect(screen.getByText(UI_LICENSE_STATUS_ERROR_TITLE)).toBeInTheDocument()
      })
    })

    test('invokes refetch when retrying after an error', async () => {
      asSuperuser()
      const refetch = vi.fn()
      useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch })

      renderWithProviders(<LicensesRouteComponent />)

      fireEvent.click(await screen.findByRole('button', { name: /Retry/i }))

      expect(refetch).toHaveBeenCalled()
    })

    test('hides content for a viewer without permissions', () => {
      const viewer = buildUser({ role: UI_USER_ROLE_VIEWER, vendorId: null })
      useAuthMock.mockReturnValue({ user: viewer, currentUser: viewer, isAuthenticated: true })
      mockLicenses([buildLicense({ customerEmail: 'blocked@example.com', status: 'ACTIVE' })])

      renderWithProviders(<LicensesRouteComponent />)

      expect(screen.queryByText('blocked@example.com')).toBeNull()
    })
  })

  describe('server-side query wiring', () => {
    test('requests the first page with the default page size and sort on mount', async () => {
      asSuperuser()
      mockLicenses({ data: [buildLicense({ customerEmail: 'first@example.com' })] })

      renderWithProviders(<LicensesRouteComponent />)

      await screen.findByText('first@example.com')
      const filters = getLastLicenseFilters()
      expect(filters?.limit).toBe(10)
      expect(filters?.offset).toBe(0)
      expect(filters?.sort_by).toBe('customer_email')
      expect(filters?.sort_dir).toBe('asc')
      expect(filters?.search).toBeUndefined()
      expect(filters?.status).toBeUndefined()
    })

    test('forwards the search term to the server query', async () => {
      asSuperuser()
      mockLicenses({ data: [buildLicense({ customerEmail: 'alpha@example.com' })] })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('alpha@example.com')

      fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'alpha' } })

      await waitFor(() => {
        expect(getLastLicenseFilters()?.search).toBe('alpha')
      })
    })

    test('forwards a selected status to the server query', async () => {
      asSuperuser()
      mockLicenses({ data: [buildLicense({ customerEmail: 'status@example.com', status: 'ACTIVE' })] })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('status@example.com')

      const statusFilter = screen.getByRole('listbox', { name: /filter by status/i })
      fireEvent.change(statusFilter, { target: { value: 'ACTIVE' } })

      await waitFor(() => {
        expect(getLastLicenseFilters()?.status).toBe('ACTIVE')
      })
    })

    test('forwards the DELETED pseudo-status to the server query', async () => {
      asSuperuser()
      mockLicenses({ data: [buildLicense({ customerEmail: 'deleted@example.com', status: 'REVOKED' })] })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('deleted@example.com')

      const statusFilter = screen.getByRole('listbox', { name: /filter by status/i })
      fireEvent.change(statusFilter, { target: { value: UI_LICENSE_STATUS_DELETED } })

      await waitFor(() => {
        expect(getLastLicenseFilters()?.status).toBe(UI_LICENSE_STATUS_DELETED)
      })
    })

    test('forwards the selected product slug to the server query', async () => {
      asSuperuser()
      useAdminProductsMock.mockReturnValue({
        data: [buildProduct({ slug: 'prod-a', name: 'Product A' })],
        isLoading: false,
        isError: false,
      })
      mockLicenses({ data: [buildLicense({ customerEmail: 'prod@example.com' })] })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('prod@example.com')

      const productFilter = screen.getByRole('combobox', { name: UI_LICENSE_PRODUCT_FILTER_LABEL })
      expect(within(productFilter).getByRole('option', { name: 'Product A' })).toBeInTheDocument()
      fireEvent.change(productFilter, { target: { value: 'prod-a' } })

      await waitFor(() => {
        expect(getLastLicenseFilters()?.product_slug).toBe('prod-a')
      })
    })

    test('toggles the sort direction through the column header', async () => {
      asSuperuser()
      mockLicenses({ data: [buildLicense({ customerEmail: 'sort@example.com' })] })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('sort@example.com')

      // Default sort is customer ascending; clicking the header flips it to descending.
      fireEvent.click(screen.getByRole('button', { name: /sort customer/i }))

      await waitFor(() => {
        const filters = getLastLicenseFilters()
        expect(filters?.sort_by).toBe('customer_email')
        expect(filters?.sort_dir).toBe('desc')
      })
    })

    test('does not render a sort control for the non-sortable product column', async () => {
      asSuperuser()
      mockLicenses({ data: [buildLicense({ customerEmail: 'noproductsort@example.com' })] })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('noproductsort@example.com')

      // The product column header still renders, but it has no sort button because
      // product slug cannot be ordered server-side.
      expect(screen.getAllByText(UI_LICENSE_COLUMN_HEADER_PRODUCT).length).toBeGreaterThan(0)
      expect(screen.queryByRole('button', { name: /sort product/i })).toBeNull()
    })

    test('advances the offset when paging forward', async () => {
      asSuperuser()
      mockLicenses({
        data: [buildLicense({ customerEmail: 'paged@example.com' })],
        pagination: { total: 25, totalPages: 3, page: 1, limit: 10 },
      })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('paged@example.com')

      fireEvent.click(screen.getByRole('button', { name: UI_TABLE_PAGINATION_NEXT }))

      await waitFor(() => {
        expect(getLastLicenseFilters()?.offset).toBe(10)
      })
    })

    test('updates the limit and resets to the first page when page size changes', async () => {
      asSuperuser()
      mockLicenses({
        data: [buildLicense({ customerEmail: 'sized@example.com' })],
        pagination: { total: 60, totalPages: 6, page: 1, limit: 10 },
      })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('sized@example.com')

      fireEvent.change(screen.getByRole('combobox', { name: UI_TABLE_PAGE_SIZE_LABEL }), { target: { value: '25' } })

      await waitFor(() => {
        const filters = getLastLicenseFilters()
        expect(filters?.limit).toBe(25)
        expect(filters?.offset).toBe(0)
      })
    })

    test('forwards the tenant filter as vendor_id for a global admin', async () => {
      asSuperuser()
      useAdminTenantsMock.mockReturnValue({
        data: [
          { id: 't1', name: 'Tenant One', vendorId: 't1' },
          { id: 't2', name: 'Tenant Two', vendorId: 't2' },
        ],
        isLoading: false,
        isError: false,
      })
      mockLicenses({ data: [buildLicense({ customerEmail: 'tenant@example.com' })] })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('tenant@example.com')

      const tenantFilter = screen.getByRole('combobox', { name: UI_TENANT_FILTER_LABEL })
      fireEvent.change(tenantFilter, { target: { value: 't1' } })

      await waitFor(() => {
        expect(getLastLicenseFilters()?.vendor_id).toBe('t1')
      })
    })

    test('omits vendor_id for vendor-scoped users (server enforces ownership)', async () => {
      const vendorUser = buildUser({ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId: 'vendor-1' })
      useAuthMock.mockReturnValue({ user: vendorUser, currentUser: vendorUser, isAuthenticated: true })
      mockLicenses({ data: [buildLicense({ customerEmail: 'scoped@example.com', vendorId: 'vendor-1' })] })

      renderWithProviders(<LicensesRouteComponent />)
      await screen.findByText('scoped@example.com')

      expect(getLastLicenseFilters()?.vendor_id).toBeUndefined()
    })
  })

  describe('tier and product option loading', () => {
    test('fetches tiers per product and accepts an array response', async () => {
      asSuperuser()
      const product = buildProduct()
      useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false })
      mockLicenses([buildLicense({ customerEmail: 'tiers@example.com' })])

      const listProductTiers = vi.fn().mockResolvedValue([buildProductTier()])
      renderWithProviders(<LicensesRouteComponent />, { client: { listProductTiers } })

      await screen.findByText('tiers@example.com')
      await waitFor(() => {
        expect(listProductTiers).toHaveBeenCalledWith(product.id)
      })
    })

    test('accepts a tier response nested under a data key', async () => {
      asSuperuser()
      const product = buildProduct()
      useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false })
      mockLicenses([buildLicense({ customerEmail: 'nestedtiers@example.com' })])

      const listProductTiers = vi.fn().mockResolvedValue({ data: [buildProductTier()] })
      renderWithProviders(<LicensesRouteComponent />, { client: { listProductTiers } })

      await screen.findByText('nestedtiers@example.com')
      await waitFor(() => {
        expect(listProductTiers).toHaveBeenCalledWith(product.id)
      })
    })

    test('renders without tiers when there are no products', async () => {
      asSuperuser()
      useAdminProductsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
      mockLicenses([buildLicense({ customerEmail: 'noproducts@example.com' })])

      renderWithProviders(<LicensesRouteComponent />)

      expect(await screen.findByText('noproducts@example.com')).toBeInTheDocument()
    })

    test('accepts products nested under a data key', async () => {
      asSuperuser()
      useAdminProductsMock.mockReturnValue({
        data: { data: [buildProduct({ slug: 'prod-x', name: 'Product X' })] },
        isLoading: false,
        isError: false,
      })
      mockLicenses([buildLicense({ customerEmail: 'nestedproducts@example.com' })])

      renderWithProviders(<LicensesRouteComponent />)

      expect(await screen.findByText('nestedproducts@example.com')).toBeInTheDocument()
      const productFilter = screen.getByRole('combobox', { name: UI_LICENSE_PRODUCT_FILTER_LABEL })
      expect(within(productFilter).getByRole('option', { name: 'Product X' })).toBeInTheDocument()
    })

    test('keeps rendering when tier fetching fails', async () => {
      asSuperuser()
      const product = buildProduct()
      useAdminProductsMock.mockReturnValue({ data: [product], isLoading: false, isError: false })
      mockLicenses([buildLicense({ customerEmail: 'tiererror@example.com' })])

      const listProductTiers = vi.fn().mockRejectedValue(new Error('boom'))
      renderWithProviders(<LicensesRouteComponent />, { client: { listProductTiers } })

      expect(await screen.findByText('tiererror@example.com')).toBeInTheDocument()
    })
  })
})
