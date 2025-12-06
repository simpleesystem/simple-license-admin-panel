import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UsersRouteComponent } from '../../../../src/routes/users/UsersRoute'
import { UI_USER_BUTTON_CREATE, UI_USER_STATUS_ERROR_TITLE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'
import { buildUser } from '../../../factories/userFactory'
const useAdminUsersMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useAdminUsers: useAdminUsersMock,
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

describe('UsersRouteComponent', () => {
  test('renders vendor-scoped users and hides create for vendor manager', async () => {
    const vendorUser = buildUser({ role: 'VENDOR_MANAGER', vendorId: 'vendor-1' })
    authUser = vendorUser
    const adminUsers = [
      buildUser({ username: 'allowed-user', vendorId: 'vendor-1' }),
      buildUser({ username: 'other-user', vendorId: 'vendor-2' }),
    ]
    useAdminUsersMock.mockReturnValue({ data: adminUsers, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    expect(await screen.findByText('allowed-user')).toBeInTheDocument()
    expect(screen.queryByText('other-user')).toBeNull()
    expect(screen.queryByText(UI_USER_BUTTON_CREATE)).toBeNull()
  })

  test('shows create action for superuser', async () => {
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    const adminUsers = [buildUser({ username: 'root-user' })]
    useAdminUsersMock.mockReturnValue({ data: adminUsers, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    expect(await screen.findByText('root-user')).toBeInTheDocument()
    expect(screen.getByText(UI_USER_BUTTON_CREATE)).toBeInTheDocument()
  })

  test('shows error state when list request fails', async () => {
    authUser = buildUser({ role: 'SUPERUSER', vendorId: null })
    useAdminUsersMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_USER_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })
  })
})

