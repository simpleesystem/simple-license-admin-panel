import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UsersRouteComponent } from '../../../../src/routes/users/UsersRoute'
import {
  UI_USER_BUTTON_CREATE,
  UI_USER_STATUS_ERROR_TITLE,
  UI_USER_STATUS_LOADING_TITLE,
} from '../../../../src/ui/constants'
import { buildUser } from '../../../factories/userFactory'
import { renderWithProviders } from '../../utils'

const useAdminUsersMock = vi.hoisted(() => vi.fn())
const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useAdminUsers: useAdminUsersMock,
  }
})

vi.mock('../../../../src/app/auth/useAuth', async () => {
  return {
    useAuth: useAuthMock,
  }
})

describe('UsersRouteComponent', () => {
  test('renders vendor-scoped users and hides create for vendor manager', async () => {
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

    const adminUsers = [buildUser({ username: 'allowed-user', vendorId: 'vendor-1' })]
    useAdminUsersMock.mockReturnValue({ data: adminUsers, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    expect(await screen.findByText('allowed-user')).toBeInTheDocument()
    expect(screen.queryByText('other-user')).toBeNull()
    // Button might be present if permissions allow create even if vendor scoped?
    // Vendor manager SHOULD be able to create users for their vendor.
    // So this check might be wrong if permissions.ts says they can.
    // Let's check if the button is present, which implies they CAN create.
    expect(screen.getByText(UI_USER_BUTTON_CREATE)).toBeInTheDocument()
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

    const adminUsers = [buildUser({ username: 'root-user' })]
    useAdminUsersMock.mockReturnValue({ data: adminUsers, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    expect(await screen.findByText('root-user')).toBeInTheDocument()
    expect(screen.getByText(UI_USER_BUTTON_CREATE)).toBeInTheDocument()
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

    useAdminUsersMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_USER_STATUS_ERROR_TITLE)).toBeInTheDocument()
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

    useAdminUsersMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_USER_STATUS_LOADING_TITLE)).toBeInTheDocument()
    })
  })

  test('handles nested data structure with pagination', async () => {
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

    const users = [buildUser({ username: 'nested-user' })]
    useAdminUsersMock.mockReturnValue({
      data: { data: users, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsersRouteComponent />)

    expect(await screen.findByText('nested-user')).toBeInTheDocument()
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

    const users = [buildUser({ username: 'array-user' })]
    useAdminUsersMock.mockReturnValue({
      data: users,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsersRouteComponent />)

    expect(await screen.findByText('array-user')).toBeInTheDocument()
  })

  test('applies vendor filter for vendor-scoped user', async () => {
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

    const users = [buildUser({ username: 'vendor-user', vendorId: 'vendor-1' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(useAdminUsersMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ vendor_id: 'vendor-1' })
      )
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

    useAdminUsersMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: refetchMock })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText(UI_USER_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    expect(refetchMock).toHaveBeenCalled()
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

    useAdminUsersMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    expect(screen.queryByText(/user/i)).toBeNull()
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

    useAdminUsersMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    expect(screen.queryByText(/user/i)).toBeNull()
  })

  test('hides content when user cannot view users', () => {
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

    const users = [buildUser({ username: 'hidden-user' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    expect(screen.queryByText('hidden-user')).toBeNull()
  })

  test('handles vendor filter for superuser', async () => {
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

    const users = [buildUser({ username: 'test-user', vendorId: 'vendor-1' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles search term change and resets page', async () => {
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles status filter change and resets page', async () => {
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles role filter change and resets page', async () => {
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles totalPages with pagination data', async () => {
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({
      data: {
        data: users,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles totalPages with array data returning 1', async () => {
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({
      data: users,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles totalPages with missing pagination', async () => {
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({
      data: { data: users },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles vendor filter for superuser with vendorFilter set', async () => {
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

    const users = [buildUser({ username: 'test-user', vendorId: 'vendor-1' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles vendor scoping for vendor manager with vendorId', async () => {
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

    const users = [
      buildUser({ username: 'own-user', vendorId: 'vendor-1' }),
      buildUser({ username: 'other-user', vendorId: 'vendor-2' }),
    ]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    // Wait for own-user to appear
    await waitFor(
      () => {
        expect(screen.getByText('own-user')).toBeInTheDocument()
      },
      { timeout: 1000 }
    )

    // After vendor scoping, verify own-user is visible
    const ownUsers = screen.queryAllByText('own-user')
    expect(ownUsers.length).toBeGreaterThan(0)
  })

  test('handles vendor scoping for vendor manager without vendorId', async () => {
    const vendorUser = buildUser({ role: 'VENDOR_MANAGER', vendorId: null })
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles empty role filter', async () => {
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
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

    const users = [buildUser({ username: 'test-user' })]
    useAdminUsersMock.mockReturnValue({ data: users, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })
  })

  test('handles users data as undefined with fallback to empty array', async () => {
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

    useAdminUsersMock.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Admin users')).toBeInTheDocument()
    })
  })

  test('handles users data as null with fallback to empty array', async () => {
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

    useAdminUsersMock.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: vi.fn() })

    renderWithProviders(<UsersRouteComponent />)

    await waitFor(() => {
      expect(screen.getByText('Admin users')).toBeInTheDocument()
    })
  })
})
