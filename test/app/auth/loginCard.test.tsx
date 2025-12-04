import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import mitt from 'mitt'
import { describe, expect, test, vi } from 'vitest'

import { LoginCard } from '@/app/auth/LoginCard'
import { AuthContext } from '@/app/auth/authContext'
import type { AuthContextValue } from '@/app/auth/types'
import { AuthorizationContext } from '@/app/auth/authorizationContext'
import { buildPermissions } from '../../factories/permissionFactory'
import {
  AUTH_STATUS_IDLE,
  I18N_KEY_AUTH_FORGOT_LINK,
  I18N_KEY_AUTH_SUBMIT,
  I18N_KEY_FORM_PASSWORD_LABEL,
  I18N_KEY_FORM_USERNAME_LABEL,
  NOTIFICATION_EVENT_TOAST,
} from '@/app/constants'
import { NotificationBusContext } from '@/notifications/busContext'
import type { NotificationEventMap } from '@/notifications/types'
import { I18nProvider } from '@/app/i18n/I18nProvider'
import { i18nResources } from '@/app/i18n/resources'
import { ApiException } from '@simple-license/react-sdk'

const SUBMIT_LABEL = i18nResources.common[I18N_KEY_AUTH_SUBMIT]
const USERNAME_LABEL = i18nResources.common[I18N_KEY_FORM_USERNAME_LABEL]
const PASSWORD_LABEL = i18nResources.common[I18N_KEY_FORM_PASSWORD_LABEL]
const FORGOT_LABEL = i18nResources.common[I18N_KEY_AUTH_FORGOT_LINK]

describe('LoginCard', () => {
  test('renders required fields and actions', () => {
    renderLoginCard()

    expect(getUsernameInput()).toBeInTheDocument()
    expect(getPasswordInput()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: FORGOT_LABEL, exact: false })).toBeInTheDocument()
  })

  test('submits credentials through auth context', async () => {
    const login = vi.fn().mockResolvedValue({})
    renderLoginCard({ authOverrides: { login } })

    fireEvent.change(getUsernameInput(), { target: { value: 'ops@example.com' } })
    fireEvent.change(getPasswordInput(), { target: { value: 'supersafe' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('ops@example.com', 'supersafe')
    })
  })

  test('shows inline error state and emits toast when authentication fails', async () => {
    const login = vi.fn().mockRejectedValueOnce(new Error('Invalid credentials'))
    const toastSpy = vi.fn()
    renderLoginCard({ authOverrides: { login }, toastSpy })

    fireEvent.change(getUsernameInput(), { target: { value: 'ops@example.com' } })
    fireEvent.change(getPasswordInput(), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    expect(toastSpy).toHaveBeenCalledWith(NOTIFICATION_EVENT_TOAST, expect.any(Object))
  })

  test('maps ApiException errors to toast payloads', async () => {
    const apiError = new ApiException('Auth failed', 'INVALID_CREDENTIALS')
    const login = vi.fn().mockRejectedValueOnce(apiError)
    const toastSpy = vi.fn()
    renderLoginCard({ authOverrides: { login }, toastSpy })

    fireEvent.change(getUsernameInput(), { target: { value: 'ops@example.com' } })
    fireEvent.change(getPasswordInput(), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        NOTIFICATION_EVENT_TOAST,
        expect.objectContaining({ titleKey: 'INVALID_CREDENTIALS' }),
      )
    })
  })
})

type RenderOptions = {
  authOverrides?: Partial<AuthContextValue>
  toastSpy?: ReturnType<typeof vi.fn>
}

const renderLoginCard = ({ authOverrides, toastSpy }: RenderOptions = {}) => {
  const login = vi.fn().mockResolvedValue({})
  const defaultAuth: AuthContextValue = {
    token: null,
    currentUser: null,
    status: AUTH_STATUS_IDLE,
    isAuthenticated: false,
    login,
    logout: vi.fn(),
    refreshCurrentUser: vi.fn(),
  }

  const authValue = { ...defaultAuth, ...authOverrides }

  const bus = mitt<NotificationEventMap>()
  if (toastSpy) {
    bus.on(NOTIFICATION_EVENT_TOAST, (payload) => {
      toastSpy(NOTIFICATION_EVENT_TOAST, payload)
    })
  }

  return render(
    <I18nProvider>
      <NotificationBusContext.Provider value={bus}>
        <AuthorizationContext.Provider value={buildPermissions()}>
          <AuthContext.Provider value={authValue}>
            <LoginCard />
          </AuthContext.Provider>
        </AuthorizationContext.Provider>
      </NotificationBusContext.Provider>
    </I18nProvider>,
  )
}

const getUsernameInput = () => screen.getByLabelText(USERNAME_LABEL, { exact: false })
const getPasswordInput = () => screen.getByLabelText(PASSWORD_LABEL, { exact: false })

