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
import { NotificationBusProvider } from '@/notifications/busContext'

vi.mock('@tanstack/react-router', () => {
  const navigate = vi.fn()
  return {
    useRouter: () => ({}),
    useNavigate: () => navigate,
    useRouterState: () => ({ location: { pathname: '/auth' } }),
    Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    RouterProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const AUTH_HEADING_TEXT = i18nResources.common[I18N_KEY_AUTH_HEADING]

describe('AuthRouteComponent', () => {
  it('renders the localized authentication heading', () => {
    render(
      <I18nProvider>
        <NotificationBusProvider bus={mitt()}>
          <AuthorizationContext.Provider value={buildPermissions()}>
            <AuthContext.Provider value={buildAuthContextValue()}>
              <AuthRouteComponent />
            </AuthContext.Provider>
          </AuthorizationContext.Provider>
        </NotificationBusProvider>
      </I18nProvider>,
    )

    const heading = screen.getByRole('heading', { name: /login/i })
    expect(heading).toBeInTheDocument()
  })
})

const buildAuthContextValue = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  token: null,
  currentUser: null,
  user: null,
  status: AUTH_STATUS_IDLE,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  refreshCurrentUser: vi.fn(),
  ...overrides,
})

