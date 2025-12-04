import { render, screen } from '@testing-library/react'
import mitt from 'mitt'
import { vi } from 'vitest'

import { I18nProvider } from '@/app/i18n/I18nProvider'
import { i18nResources } from '@/app/i18n/resources'
import { AUTH_STATUS_IDLE, I18N_KEY_AUTH_HEADING } from '@/app/constants'
import { AuthRouteComponent } from '@/routes/auth/AuthRoute'
import { AuthContext } from '@/app/auth/authContext'
import type { AuthContextValue } from '@/app/auth/types'
import { AuthorizationContext } from '@/app/auth/authorizationContext'
import { buildPermissions } from '../factories/permissionFactory'
import { NotificationBusContext } from '@/notifications/busContext'
import type { NotificationEventMap } from '@/notifications/types'

const AUTH_HEADING_TEXT = i18nResources.common[I18N_KEY_AUTH_HEADING]

describe('AuthRouteComponent', () => {
  it('renders the localized authentication heading', () => {
    render(
      <I18nProvider>
        <NotificationBusContext.Provider value={mitt<NotificationEventMap>()}>
          <AuthorizationContext.Provider value={buildPermissions()}>
            <AuthContext.Provider value={buildAuthContextValue()}>
              <AuthRouteComponent />
            </AuthContext.Provider>
          </AuthorizationContext.Provider>
        </NotificationBusContext.Provider>
      </I18nProvider>,
    )

    const headings = screen.getAllByRole('heading', { name: AUTH_HEADING_TEXT })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })
})

const buildAuthContextValue = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  token: null,
  currentUser: null,
  status: AUTH_STATUS_IDLE,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshCurrentUser: vi.fn(),
  ...overrides,
})

