import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Nav from 'react-bootstrap/Nav'
import { ModalDialog } from '../../ui/overlay/ModalDialog'
import { ChangePasswordForm } from '../../ui/auth/ChangePasswordForm'
import {
  UI_CLASS_HEADER_ACTIONS,
  UI_CLASS_HEADER_NAV_LINK,
  UI_HEADER_ACTION_CHANGE_PASSWORD,
  UI_HEADER_ACTION_SIGN_OUT,
  UI_HEADER_MODAL_TITLE_CHANGE_PASSWORD,
  UI_TEST_ID_HEADER,
  UI_TEST_ID_HEADER_ACTIONS,
  UI_TEST_ID_HEADER_NAV,
} from '../../ui/constants'
import { UI_NAV_LABEL_DASHBOARD } from '../../ui/navigation/navConstants'
import { TopNavBar } from '../../ui/navigation/TopNavBar'
import { useAuth } from '../auth/useAuth'
import { usePermissions } from '../auth/useAuthorization'
import { isApiUser } from '../auth/userUtils'
import { APP_BRAND_NAME } from '../constants'
import type { PrimaryNavItem } from '../navigation/primaryNav'
import { buildPrimaryNavigation } from '../navigation/primaryNav'

export function PersistentHeader() {
  const { currentUser, isAuthenticated, logout } = useAuth()
  const permissions = usePermissions()
  const routerState = useRouterState({ select: (state) => state.location })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const navigate = useNavigate()

  const isPasswordResetGateActive = currentUser?.passwordResetRequired ?? false
  const headerShouldRenderActions = isAuthenticated || isPasswordResetGateActive

  const navItems = useMemo(() => {
    if (!isAuthenticated || isPasswordResetGateActive) {
      return []
    }
    return buildPrimaryNavigation({
      permissions,
      currentUser,
      currentPath: routerState.pathname,
    })
  }, [currentUser, isAuthenticated, permissions, routerState.pathname, isPasswordResetGateActive])

  const showChangePasswordAction = isAuthenticated && !isPasswordResetGateActive && !isApiUser(currentUser)

  const handleChangePasswordSuccess = () => {
    setShowPasswordModal(false)
  }

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth', replace: true })
  }

  return (
    <>
      <TopNavBar
        testId={UI_TEST_ID_HEADER}
        brand={APP_BRAND_NAME}
        navigation={renderNavigation(navItems)}
        actions={
          headerShouldRenderActions
            ? renderUserActions({
                userLabel: isPasswordResetGateActive
                  ? UI_HEADER_MODAL_TITLE_CHANGE_PASSWORD
                  : (currentUser?.email ?? currentUser?.username ?? UI_NAV_LABEL_DASHBOARD),
                showChangePasswordAction: !isPasswordResetGateActive && showChangePasswordAction,
                onChangePassword: () => setShowPasswordModal(true),
                onLogout: handleLogout,
              })
            : undefined
        }
      />

      <ModalDialog
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={UI_HEADER_MODAL_TITLE_CHANGE_PASSWORD}
        size="lg"
      >
        <div className="p-3">
          <ChangePasswordForm onSuccess={handleChangePasswordSuccess} />
        </div>
      </ModalDialog>
    </>
  )
}

const renderNavigation = (items: PrimaryNavItem[]) => {
  if (items.length === 0) {
    return null
  }

  return (
    <>
      {items.map((item) => (
        <Nav.Link
          as={Link}
          key={item.id}
          to={item.href}
          className={UI_CLASS_HEADER_NAV_LINK}
          active={item.active}
          data-testid={`${UI_TEST_ID_HEADER_NAV}-item-${item.id}`}
        >
          {item.label}
        </Nav.Link>
      ))}
    </>
  )
}

type UserActionsProps = {
  userLabel: string
  showChangePasswordAction: boolean
  onChangePassword: () => void
  onLogout: () => void
}

const renderUserActions = ({ userLabel, showChangePasswordAction, onChangePassword, onLogout }: UserActionsProps) => {
  return (
    <div className={UI_CLASS_HEADER_ACTIONS} data-testid={UI_TEST_ID_HEADER_ACTIONS}>
      <div className="text-muted me-2">{userLabel}</div>
      {showChangePasswordAction ? (
        <Button variant="outline-secondary" size="sm" onClick={onChangePassword}>
          {UI_HEADER_ACTION_CHANGE_PASSWORD}
        </Button>
      ) : null}
      <Button variant="secondary" size="sm" onClick={onLogout}>
        {UI_HEADER_ACTION_SIGN_OUT}
      </Button>
    </div>
  )
}
