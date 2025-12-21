import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { LicensesRouteComponent } from '../../../../src/routes/licenses/LicensesRoute'
import { UI_LICENSE_STATUS_ERROR_TITLE, UI_USER_ROLE_SUPERUSER, UI_USER_ROLE_VENDOR_MANAGER, UI_USER_ROLE_VIEWER } from '../../../../src/ui/constants'
import { buildLicense } from '../../../factories/licenseFactory'
import { buildUser } from '../../../factories/userFactory'
import { renderWithProviders } from '../../utils'

const useAdminLicensesMock = vi.hoisted(() => vi.fn())
const useAdminProductsMock = vi.hoisted(() => vi.fn())
const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useAdminLicenses: useAdminLicensesMock,
    useAdminProducts: useAdminProductsMock,
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

describe('LicensesRouteComponent', () => {
  beforeEach(() => {
    useAdminProductsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
  })

  test('renders vendor-scoped licenses and hides others for vendor manager', async () => {
    const vendorUser = buildUser({ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId: 'vendor-1' })
    useAuthMock.mockReturnValue({ user: vendorUser, currentUser: vendorUser, isAuthenticated: true })
    const licenses = [
      buildLicense({ customerEmail: 'allowed@example.com', vendorId: 'vendor-1', status: 'ACTIVE' }),
      buildLicense({ customerEmail: 'other@example.com', vendorId: 'vendor-2', status: 'ACTIVE' }),
    ]
    useAdminLicensesMock.mockReturnValue({ data: licenses, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    expect(await screen.findByText('allowed@example.com')).toBeInTheDocument()
    expect(screen.queryByText('other@example.com')).toBeNull()
  })

  test('shows licenses for superuser', async () => {
    const superuser = buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null })
    useAuthMock.mockReturnValue({ user: superuser, currentUser: superuser, isAuthenticated: true })
    const licenses = [buildLicense({ customerEmail: 'root@example.com', status: 'ACTIVE' })]
    useAdminLicensesMock.mockReturnValue({ data: licenses, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    expect(await screen.findByText('root@example.com')).toBeInTheDocument()
  })

  test('shows error state when list request fails', async () => {
    const superuser = buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null })
    useAuthMock.mockReturnValue({ user: superuser, currentUser: superuser, isAuthenticated: true })
    useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })
  })

  test('invokes refetch when retrying after error', async () => {
    const superuser = buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null })
    useAuthMock.mockReturnValue({ user: superuser, currentUser: superuser, isAuthenticated: true })
    const refetch = vi.fn()
    useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch })

    renderWithProviders(<LicensesRouteComponent />)

    fireEvent.click(await screen.findByRole('button', { name: /Retry/i }))

    expect(refetch).toHaveBeenCalled()
  })

  test('shows loading state', async () => {
    const superuser = buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null })
    useAuthMock.mockReturnValue({ user: superuser, currentUser: superuser, isAuthenticated: true })
    useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    expect(screen.getByText(/Loading licenses/i)).toBeInTheDocument()
  })

  test('hides content for viewer without permissions', () => {
    const viewer = buildUser({ role: UI_USER_ROLE_VIEWER, vendorId: null })
    useAuthMock.mockReturnValue({ user: viewer, currentUser: viewer, isAuthenticated: true })
    const licenses = [buildLicense({ customerEmail: 'blocked@example.com', status: 'ACTIVE' })]
    useAdminLicensesMock.mockReturnValue({ data: licenses, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    expect(screen.queryByText('blocked@example.com')).toBeNull()
  })

  test('renders licenses when payload is nested under data key', async () => {
    const superuser = buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null })
    useAuthMock.mockReturnValue({ user: superuser, currentUser: superuser, isAuthenticated: true })
    const licenses = [buildLicense({ customerEmail: 'nested@example.com', status: 'ACTIVE' })]
    useAdminLicensesMock.mockReturnValue({
      data: { data: licenses },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<LicensesRouteComponent />)

    expect(await screen.findByText('nested@example.com')).toBeInTheDocument()
  })
})
