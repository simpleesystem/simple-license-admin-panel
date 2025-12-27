import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { PersistentHeader } from '../../../src/app/layout/PersistentHeader'
import { AuthContext } from '../../../src/app/auth/authContext'
import type { AuthContextValue } from '../../../src/app/auth/types'
import { AuthorizationContext } from '../../../src/app/auth/authorizationContext'
import { AUTH_STATUS_IDLE, ROUTE_PATH_DASHBOARD } from '../../../src/app/constants'
import {
  UI_HEADER_ACTION_CHANGE_PASSWORD,
  UI_HEADER_ACTION_SIGN_OUT,
  UI_HEADER_MODAL_TITLE_CHANGE_PASSWORD,
  UI_TEST_ID_MODAL_DIALOG,
} from '../../../src/ui/constants'
import { UI_NAV_LABEL_HEALTH, UI_NAV_LABEL_TENANTS, UI_NAV_LABEL_USERS } from '../../../src/ui/navigation/navConstants'
import { buildUser } from '../../factories/userFactory'
import { buildPermissions } from '../../factories/permissionFactory'

const mockUseRouterState = vi.hoisted(() => vi.fn()) as Mock
const mockChangePasswordFlowRender = vi.hoisted(() => vi.fn())
const mockUseNavigate = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    className,
    children,
    ...props
  }: {
    to: string
    className?: string
    children: React.ReactNode
  }) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
  useRouterState: mockUseRouterState,
  useNavigate: () => mockUseNavigate,
}))

vi.mock('../../../src/ui/auth/ChangePasswordFlow', () => ({
  ChangePasswordFlow: (props: { onSuccess?: () => void }) => {
    mockChangePasswordFlowRender(props)
    return (
      <div data-testid="change-password-flow">
        <button type="button" data-testid="complete-change-password" onClick={() => props.onSuccess?.()}>
          Complete
        </button>
      </div>
    )
  },
}))

describe('PersistentHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouterState.mockReturnValue({ pathname: ROUTE_PATH_DASHBOARD })
  })

  test('renders brand only when unauthenticated', () => {
    renderHeader({ isAuthenticated: false })
    expect(screen.getByText('Simple License Admin')).toBeInTheDocument()
    expect(screen.queryByTestId('ui-header-nav')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: UI_HEADER_ACTION_CHANGE_PASSWORD })).not.toBeInTheDocument()
  })

  test('shows change password action for standard user', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: UI_HEADER_ACTION_CHANGE_PASSWORD })).toBeInTheDocument()
  })

  test('hides change password action for API user', () => {
    renderHeader({ user: buildUser({ role: 'API_READ_ONLY' }) })
    expect(screen.queryByRole('button', { name: UI_HEADER_ACTION_CHANGE_PASSWORD })).not.toBeInTheDocument()
  })

  test('renders users navigation when permission granted', () => {
    renderHeader({
      permissions: buildPermissions({ viewDashboard: true, manageUsers: true }),
    })
    expect(screen.getByRole('link', { name: UI_NAV_LABEL_USERS })).toBeInTheDocument()
  })

  test('shows tenant navigation for vendor-scoped user without manage permission', () => {
    const vendorUser = buildUser({ vendorId: 'tenant-123' })
    renderHeader({
      user: vendorUser,
      permissions: buildPermissions({ viewDashboard: true }),
    })
    expect(screen.getByRole('link', { name: UI_NAV_LABEL_TENANTS })).toBeInTheDocument()
  })

  test('shows health navigation for system administrators', () => {
    renderHeader({
      user: buildUser({ role: 'ADMIN' }),
      permissions: buildPermissions({ viewDashboard: true }),
    })
    expect(screen.getByRole('link', { name: UI_NAV_LABEL_HEALTH })).toBeInTheDocument()
  })

  test('sign out action invokes logout', () => {
    const logoutMock = vi.fn()
    renderHeader({ logoutMock })
    fireEvent.click(screen.getByRole('button', { name: UI_HEADER_ACTION_SIGN_OUT }))
    expect(logoutMock).toHaveBeenCalled()
  })

  test('opens change password modal when action clicked', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: UI_HEADER_ACTION_CHANGE_PASSWORD }))
    expect(screen.getByTestId(UI_TEST_ID_MODAL_DIALOG)).toBeInTheDocument()
    expect(screen.getByText(UI_HEADER_MODAL_TITLE_CHANGE_PASSWORD)).toBeInTheDocument()
    expect(screen.getByTestId('change-password-flow')).toBeInTheDocument()
  })

  test('closes modal when close button pressed', async () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: UI_HEADER_ACTION_CHANGE_PASSWORD }))
    fireEvent.click(screen.getByLabelText('Close'))
    await waitFor(() => expect(screen.queryByTestId(UI_TEST_ID_MODAL_DIALOG)).not.toBeInTheDocument())
  })

  test('invokes onSuccess from ChangePasswordFlow to close modal', async () => {
    renderHeader()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_HEADER_ACTION_CHANGE_PASSWORD })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_HEADER_ACTION_CHANGE_PASSWORD }))
    fireEvent.click(screen.getByTestId('complete-change-password'))
    await waitFor(() => expect(screen.queryByTestId(UI_TEST_ID_MODAL_DIALOG)).not.toBeInTheDocument())
  })
})

type RenderHeaderOptions = {
  user?: ReturnType<typeof buildUser>
  permissions?: ReturnType<typeof buildPermissions>
  isAuthenticated?: boolean
  logoutMock?: Mock
}

const renderHeader = ({
  user = buildUser(),
  permissions = buildPermissions({ viewDashboard: true, manageUsers: true, manageTenants: true, viewAnalytics: true }),
  isAuthenticated = true,
  logoutMock,
}: RenderHeaderOptions = {}) => {
  const authValue: AuthContextValue = {
    token: isAuthenticated ? 'token' : null,
    currentUser: isAuthenticated ? user : null,
    status: AUTH_STATUS_IDLE,
    isAuthenticated,
    login: vi.fn(),
    logout: logoutMock ?? vi.fn(),
    refreshCurrentUser: vi.fn(),
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <AuthorizationContext.Provider value={permissions}>
        <PersistentHeader />
      </AuthorizationContext.Provider>
    </AuthContext.Provider>,
  )
}
