import { ApiException } from '@simple-license/react-sdk'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import mitt from 'mitt'
import { describe, expect, test, vi } from 'vitest'
import { AuthContext } from '@/app/auth/authContext'
import { AuthorizationContext } from '@/app/auth/authorizationContext'
import { LoginCard } from '@/app/auth/LoginCard'
import type { AuthContextValue } from '@/app/auth/types'
import {
  AUTH_STATUS_IDLE,
  I18N_KEY_AUTH_FORGOT_LINK,
  I18N_KEY_AUTH_SUBMIT,
  I18N_KEY_FORM_PASSWORD_LABEL,
  I18N_KEY_FORM_PASSWORD_REQUIRED,
  I18N_KEY_FORM_USERNAME_LABEL,
  I18N_KEY_FORM_USERNAME_REQUIRED,
  NOTIFICATION_EVENT_TOAST,
} from '@/app/constants'
import { APP_CONFIG } from '@/app/config/appConfig'
import { AppConfigProvider } from '@/app/config'
import { I18nProvider } from '@/app/i18n/I18nProvider'
import { i18nResources } from '@/app/i18n/resources'
import { NotificationBusContext } from '@/notifications/busContext'
import type { NotificationEventMap } from '@/notifications/types'
import { buildPermissions } from '../../factories/permissionFactory'
import { LoggerContext } from '@/app/logging/loggerContext'
import { createAppLogger } from '@/app/logging/logger'

const SUBMIT_LABEL = i18nResources.common[I18N_KEY_AUTH_SUBMIT]
const USERNAME_LABEL = i18nResources.common[I18N_KEY_FORM_USERNAME_LABEL]
const USERNAME_REQUIRED = i18nResources.common[I18N_KEY_FORM_USERNAME_REQUIRED]
const PASSWORD_LABEL = i18nResources.common[I18N_KEY_FORM_PASSWORD_LABEL]
const PASSWORD_REQUIRED = i18nResources.common[I18N_KEY_FORM_PASSWORD_REQUIRED]
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

  test('handles authentication failure gracefully', async () => {
    const login = vi.fn().mockRejectedValueOnce(new Error('Invalid credentials'))
    const toastSpy = vi.fn()
    renderLoginCard({ authOverrides: { login }, toastSpy })

    fireEvent.change(getUsernameInput(), { target: { value: 'ops@example.com' } })
    fireEvent.change(getPasswordInput(), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(login).toHaveBeenCalled()
    })

    // Toast responsibility moved to AuthProvider/Global Error Handler
    // expect(toastSpy).toHaveBeenCalledWith(NOTIFICATION_EVENT_TOAST, expect.any(Object))
  })

  test('does not emit toast directly (handled globally)', async () => {
    const apiError = new ApiException('Auth failed', 'INVALID_CREDENTIALS')
    const login = vi.fn().mockRejectedValueOnce(apiError)
    const toastSpy = vi.fn()
    renderLoginCard({ authOverrides: { login }, toastSpy })

    fireEvent.change(getUsernameInput(), { target: { value: 'ops@example.com' } })
    fireEvent.change(getPasswordInput(), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(toastSpy).not.toHaveBeenCalled()
    })
  })

  test('disables submit until both fields are filled and validates username when only password is typed', async () => {
    renderLoginCard()

    const submitButton = getSubmitButton()
    expect(submitButton).toBeDisabled()

    fireEvent.change(getPasswordInput(), { target: { value: 'secret' } })

    await waitFor(() => {
      expect(screen.getByText(USERNAME_REQUIRED)).toBeInTheDocument()
    })
    expect(submitButton).toBeDisabled()

    fireEvent.change(getUsernameInput(), { target: { value: 'ops@example.com' } })

    await waitFor(() => {
      expect(screen.queryByText(USERNAME_REQUIRED)).toBeNull()
      expect(submitButton).not.toBeDisabled()
    })

    fireEvent.change(getPasswordInput(), { target: { value: '' } })

    await waitFor(() => {
      expect(screen.getByText(PASSWORD_REQUIRED)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
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
      <AppConfigProvider value={{ ...APP_CONFIG, authForgotPasswordUrl: 'https://example.com/forgot' }}>
        <LoggerContext.Provider value={createAppLogger(APP_CONFIG)}>
          <NotificationBusContext.Provider value={bus}>
            <AuthorizationContext.Provider value={buildPermissions()}>
              <AuthContext.Provider value={authValue}>
                <LoginCard />
              </AuthContext.Provider>
            </AuthorizationContext.Provider>
          </NotificationBusContext.Provider>
        </LoggerContext.Provider>
      </AppConfigProvider>
    </I18nProvider>
  )
}

const getUsernameInput = () => screen.getByLabelText(USERNAME_LABEL, { exact: false })
const getPasswordInput = () => screen.getByLabelText(PASSWORD_LABEL, { exact: false })
const getSubmitButton = () => screen.getByRole('button', { name: SUBMIT_LABEL })
