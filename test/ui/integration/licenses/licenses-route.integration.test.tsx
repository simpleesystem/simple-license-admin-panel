import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { LicensesRouteComponent } from '../../../../src/routes/licenses/LicensesRoute'
import { UI_LICENSE_STATUS_ERROR_TITLE } from '../../../../src/ui/constants'
import { buildLicense } from '../../../factories/licenseFactory'
import { buildUser } from '../../../factories/userFactory'
import { renderWithProviders } from '../../utils'

const useAdminLicensesMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useAdminLicenses: useAdminLicensesMock,
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

describe('LicensesRouteComponent', () => {
  test('renders vendor-scoped licenses and hides others for vendor manager', async () => {
    const vendorUser = buildUser({ role: 'VENDOR_MANAGER', vendorId: 'vendor-1' })
    authUser = vendorUser
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
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    const licenses = [buildLicense({ customerEmail: 'root@example.com', status: 'ACTIVE' })]
    useAdminLicensesMock.mockReturnValue({ data: licenses, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    expect(await screen.findByText('root@example.com')).toBeInTheDocument()
  })

  test('shows error state when list request fails', async () => {
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })
  })

  test('invokes refetch when retrying after error', async () => {
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    const refetch = vi.fn()
    useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch })

    renderWithProviders(<LicensesRouteComponent />)

    fireEvent.click(await screen.findByRole('button', { name: /Retry/i }))

    expect(refetch).toHaveBeenCalled()
  })

  test('shows loading state', () => {
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    useAdminLicensesMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    expect(screen.getByText(/Loading licenses/i)).toBeInTheDocument()
  })

  test('hides content for viewer without permissions', () => {
    authUser = buildUser({ role: 'VIEWER', vendorId: null })
    const licenses = [buildLicense({ customerEmail: 'blocked@example.com', status: 'ACTIVE' })]
    useAdminLicensesMock.mockReturnValue({ data: licenses, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<LicensesRouteComponent />)

    expect(screen.queryByText('blocked@example.com')).toBeNull()
  })

  test('renders licenses when payload is nested under data key', async () => {
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
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
