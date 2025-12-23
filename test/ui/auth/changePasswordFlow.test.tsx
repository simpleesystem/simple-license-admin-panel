import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ApiContext } from '../../../src/api/apiContext'
import { AuthContext } from '../../../src/app/auth/authContext'
import type { AuthContextValue } from '../../../src/app/auth/types'
import { APP_ERROR_MESSAGE_NON_ERROR_THROWABLE, AUTH_STATUS_IDLE } from '../../../src/app/constants'
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

const useChangePasswordMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useChangePassword: useChangePasswordMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const renderWithProviders = (ui: React.ReactElement, authOverrides?: Partial<AuthContextValue>) => {
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

  return render(
    <AuthContext.Provider value={authValue}>
      <ApiContext.Provider value={{} as never}>{ui}</ApiContext.Provider>
    </AuthContext.Provider>
  )
}

describe('ChangePasswordFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits change password request', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)
    const onSuccess = vi.fn()

    renderWithProviders(<ChangePasswordFlow onSuccess={onSuccess} />)

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
      expect(mutation.mutateAsync).toHaveBeenCalledWith({
        current_password: 'old-pass',
        new_password: 'new-pass',
      })
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  test('submits email-only change', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)
    const onSuccess = vi.fn()

    renderWithProviders(<ChangePasswordFlow onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'updated@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() =>
      expect(mutation.mutateAsync).toHaveBeenCalledWith({
        email: 'updated@example.com',
      })
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  test('submits combined email and password change', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

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
      expect(mutation.mutateAsync).toHaveBeenCalledWith({
        email: 'combined@example.com',
        current_password: 'old-pass',
        new_password: 'new-pass',
      })
    )
  })

  test('requires at least one change before submission', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(mutation.mutateAsync).not.toHaveBeenCalled())
  })

  test('validates email format', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'not-an-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(screen.getByText(UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID)).toBeInTheDocument())
    expect(mutation.mutateAsync).not.toHaveBeenCalled()
  })

  test('enforces matching password confirmation', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD), {
      target: { value: 'different' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(screen.getByText(UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH)).toBeInTheDocument())
    expect(mutation.mutateAsync).not.toHaveBeenCalled()
  })

  test('requires confirmation when changing password', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(mutation.mutateAsync).not.toHaveBeenCalled())
  })

  test('requires current password when submitting a password change', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD), {
      target: { value: 'new-pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(mutation.mutateAsync).not.toHaveBeenCalled())
    expect(screen.getByText(UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD)).toBeInTheDocument()
  })

  test('uses generic error message when non-Error rejection thrown', async () => {
    const mutation = mockMutation()
    mutation.mutateAsync.mockRejectedValueOnce('unhandled')
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'updated@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(screen.getByText(APP_ERROR_MESSAGE_NON_ERROR_THROWABLE)).toBeInTheDocument())
  })

  test('does not submit when only unchanged email provided', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    const currentUser = buildUser({ email: 'same@example.com' })

    renderWithProviders(<ChangePasswordFlow />, { currentUser })

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'same@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(mutation.mutateAsync).not.toHaveBeenCalled())
  })

  test('displays server errors using alert', async () => {
    const mutation = mockMutation()
    mutation.mutateAsync.mockRejectedValueOnce(new Error('Network issue'))
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL), {
      target: { value: 'updated@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => expect(screen.getByText('Network issue')).toBeInTheDocument())
  })
})
