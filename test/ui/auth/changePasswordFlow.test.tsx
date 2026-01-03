import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ApiContext } from '../../../src/api/apiContext'
import { AuthContext } from '../../../src/app/auth/authContext'
import type { AuthContextValue } from '../../../src/app/auth/types'
import { APP_ERROR_MESSAGE_NON_ERROR_THROWABLE, AUTH_STATUS_IDLE, ROUTE_PATH_DASHBOARD } from '../../../src/app/constants'
import { useAppStore } from '../../../src/app/state/store'
import { NotificationBusProvider } from '../../../src/notifications/bus'
import { ChangePasswordFlow } from '../../../src/ui/auth/ChangePasswordFlow'
import {
  UI_CHANGE_PASSWORD_BUTTON_UPDATE,
  UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID,
  UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH,
  UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_EMAIL,
  UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD,
  UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD,
} from '../../../src/ui/constants'
import { buildUser } from '../../factories/userFactory'

const createMockClient = () => ({
  changePassword: vi.fn(async () => ({})),
})

const renderWithProviders = (ui: React.ReactElement, authOverrides?: Partial<AuthContextValue>, mockClient = createMockClient()) => {
  const authValue: AuthContextValue = {
    token: 'token',
    currentUser: authOverrides?.currentUser ?? buildUser({ email: 'current@example.com' }),
    status: AUTH_STATUS_IDLE,
    isAuthenticated: true,
    login: vi.fn() as AuthContextValue['login'],
    logout: vi.fn(),
    refreshCurrentUser: vi.fn() as AuthContextValue['refreshCurrentUser'],
    ...authOverrides,
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <NotificationBusProvider>
          <AuthContext.Provider value={authValue}>
            <ApiContext.Provider value={mockClient as never}>{ui}</ApiContext.Provider>
          </AuthContext.Provider>
        </NotificationBusProvider>
      </QueryClientProvider>
    ),
    mockClient,
  }
}

describe('ChangePasswordFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset navigation intent before each test
    useAppStore.setState({ navigationIntent: null })
  })

  test('submits change password request', async () => {
    const mockClient = createMockClient()
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD), {
      target: { value: 'old-pass' },
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() =>
      expect(mockClient.changePassword).toHaveBeenCalledWith({
        current_password: 'old-pass',
        new_password: 'new-pass',
      })
    )

    // Verify navigation intent is dispatched after successful password change
    await waitFor(() => {
      const state = useAppStore.getState()
      expect(state.navigationIntent).toEqual({
        to: ROUTE_PATH_DASHBOARD,
        replace: true,
      })
    })
  })

  test('submits email-only change', async () => {
    const mockClient = createMockClient()
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'updated@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() =>
      expect(mockClient.changePassword).toHaveBeenCalledWith({
        email: 'updated@example.com',
      })
    )
  })

  test('submits combined email and password change', async () => {
    const mockClient = createMockClient()
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'combined@example.com' },
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD), {
      target: { value: 'old-pass' },
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() =>
      expect(mockClient.changePassword).toHaveBeenCalledWith({
        email: 'combined@example.com',
        current_password: 'old-pass',
        new_password: 'new-pass',
      })
    )
  })

  test('requires at least one change before submission', async () => {
    const mockClient = createMockClient()
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(mockClient.changePassword).not.toHaveBeenCalled())
  })

  test('validates email format', async () => {
    const mockClient = createMockClient()
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'not-an-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(screen.getByText(UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID)).toBeInTheDocument())
    expect(mockClient.changePassword).not.toHaveBeenCalled()
  })

  test('enforces matching password confirmation', async () => {
    const mockClient = createMockClient()
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    await act(async () => {
      fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD), {
        target: { value: 'old-pass' },
      })
      fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), {
        target: { value: 'new-pass' },
      })
      fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD), {
        target: { value: 'different' },
      })
      fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))
    })

    await waitFor(() => expect(screen.getByText(UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH)).toBeInTheDocument())
    expect(mockClient.changePassword).not.toHaveBeenCalled()
  })

  test('requires confirmation when changing password', async () => {
    const mockClient = createMockClient()
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(mockClient.changePassword).not.toHaveBeenCalled())
  })

  test('requires current password when submitting a password change', async () => {
    const mockClient = createMockClient()
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => {
      expect(mockClient.changePassword).not.toHaveBeenCalled()
      // Check for error in alert (role="alert") to avoid matching the label
      expect(screen.getByRole('alert')).toHaveTextContent(UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD)
    })
  })

  test('uses generic error message when non-Error rejection thrown', async () => {
    const mockClient = createMockClient()
    mockClient.changePassword.mockRejectedValueOnce('unhandled')
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'updated@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(screen.getByText(APP_ERROR_MESSAGE_NON_ERROR_THROWABLE)).toBeInTheDocument())
  })

  test('does not submit when only unchanged email provided', async () => {
    const mockClient = createMockClient()
    const currentUser = buildUser({ email: 'same@example.com' })

    renderWithProviders(<ChangePasswordFlow />, { currentUser }, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'same@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(mockClient.changePassword).not.toHaveBeenCalled())
  })

  test('displays server errors using alert', async () => {
    const mockClient = createMockClient()
    mockClient.changePassword.mockRejectedValueOnce(new Error('Network issue'))
    renderWithProviders(<ChangePasswordFlow />, undefined, mockClient)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'updated@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(screen.getByText('Network issue')).toBeInTheDocument())
  })
})
