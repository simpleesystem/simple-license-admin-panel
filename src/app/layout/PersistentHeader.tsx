import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { ChangePasswordFlow } from '../../ui/auth/ChangePasswordFlow'
import {
  UI_ARIA_LABEL_PRIMARY_NAV,
  UI_CLASS_HEADER_ACTIONS,
  UI_CLASS_HEADER_NAV_LINK,
  UI_CLASS_HEADER_NAV_LIST,
  UI_HEADER_ACTION_CHANGE_PASSWORD,
  UI_HEADER_ACTION_SIGN_OUT,
  UI_HEADER_MODAL_TITLE_CHANGE_PASSWORD,
  UI_HEADER_USER_GREETING,
  UI_TEST_ID_HEADER,
  UI_TEST_ID_HEADER_ACTIONS,
  UI_TEST_ID_HEADER_NAV,
} from '../../ui/constants'
import { UI_NAV_LABEL_DASHBOARD } from '../../ui/navigation/navConstants'
import { TopNavBar } from '../../ui/navigation/TopNavBar'
import { ModalDialog } from '../../ui/overlay/ModalDialog'
import { useAuth } from '../auth/authContext'
import { usePermissions } from '../auth/useAuthorization'
import { isApiUser } from '../auth/userUtils'
import { APP_BRAND_NAME, APP_BRAND_TAGLINE } from '../constants'
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
        brand={
          <div className="d-flex flex-column">
            <strong>{APP_BRAND_NAME}</strong>
            <small className="text-muted">{APP_BRAND_TAGLINE}</small>
          </div>
        }
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

      {showChangePasswordAction ? (
        <ModalDialog
          show={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title={UI_HEADER_MODAL_TITLE_CHANGE_PASSWORD}
          body={<ChangePasswordFlow onSuccess={handleChangePasswordSuccess} />}
        />
      ) : null}
    </>
  )
}

const renderNavigation = (items: PrimaryNavItem[]) => {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label={UI_ARIA_LABEL_PRIMARY_NAV} data-testid={UI_TEST_ID_HEADER_NAV}>
      <ul className={UI_CLASS_HEADER_NAV_LIST}>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.href}
              className={`${UI_CLASS_HEADER_NAV_LINK} ${item.active ? 'active' : ''}`}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
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
      <div className="text-end me-2">
        <small className="text-muted">{UI_HEADER_USER_GREETING}</small>
        <div>{userLabel}</div>
      </div>
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
