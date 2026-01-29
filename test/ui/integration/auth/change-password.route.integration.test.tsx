import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ChangePasswordRouteComponent } from '../../../../src/routes/auth/ChangePasswordRoute'
import {
  UI_CHANGE_PASSWORD_BUTTON_UPDATE,
  UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_EMAIL,
  UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD,
} from '../../../../src/ui/constants'
import { buildUser } from '../../../factories/userFactory'
import { renderWithProviders } from '../../utils'

const testUserEmail = faker.internet.email()
const testUser = buildUser({ email: testUserEmail })

vi.mock('../../../../src/app/auth/useAuth', async () => {
  const { AUTH_STATUS_IDLE } = await import('../../../../src/app/constants')
  return {
    useAuth: () => ({
      currentUser: testUser,
      user: testUser,
      isAuthenticated: true,
      isLoading: false,
      status: AUTH_STATUS_IDLE,
      error: null,
      token: 'token',
      login: vi.fn(),
      logout: vi.fn(),
      refreshCurrentUser: vi.fn(),
    }),
  }
})

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('ChangePasswordRouteComponent', () => {
  test('submits change password and navigates after success', async () => {
    const changePassword = vi.fn(async () => ({}))
    const client = {
      changePassword,
      restoreSession: vi.fn().mockResolvedValue(null),
      getToken: vi.fn().mockReturnValue(null),
      setToken: vi.fn(),
      getCurrentUser: vi.fn().mockResolvedValue({ user: testUser }),
      login: vi.fn(),
    }
    const currentPassword = faker.internet.password()
    const newPassword = faker.internet.password()

    renderWithProviders(<ChangePasswordRouteComponent />, { client: client as never })

    await waitFor(() => {
      expect(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD)).toBeInTheDocument()
    })
    // Ensure email field is set to current user's email
    const emailInput = screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL) as HTMLInputElement
    await waitFor(() => {
      expect(emailInput.value).toBe(testUserEmail)
    })
    // If email doesn't match, set it
    if (emailInput.value !== testUserEmail) {
      fireEvent.change(emailInput, { target: { value: testUserEmail } })
    }
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD), {
      target: { value: currentPassword },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD)).toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), { target: { value: newPassword } })
    await waitFor(() => {
      expect(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD)).toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD), {
      target: { value: newPassword },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        current_password: currentPassword,
        new_password: newPassword,
      })
    })
  })

  test('shows error message when mutation fails', async () => {
    const errorMessage = 'failed to update'
    const error = new Error(errorMessage)
    const changePassword = vi.fn(async () => {
      throw error
    })
    const client = {
      changePassword,
      restoreSession: vi.fn().mockResolvedValue(null),
      getToken: vi.fn().mockReturnValue(null),
      setToken: vi.fn(),
      getCurrentUser: vi.fn().mockResolvedValue({ user: testUser }),
      login: vi.fn(),
    }
    const currentPassword = faker.internet.password()
    const newPassword = faker.internet.password()

    renderWithProviders(<ChangePasswordRouteComponent />, { client: client as never })

    await waitFor(() => {
      expect(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD)).toBeInTheDocument()
    })
    const emailInput = screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_EMAIL) as HTMLInputElement
    await waitFor(() => {
      expect(emailInput.value).toBe(testUserEmail)
    })
    if (emailInput.value !== testUserEmail) {
      fireEvent.change(emailInput, { target: { value: testUserEmail } })
    }
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD), {
      target: { value: currentPassword },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD)).toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD), { target: { value: newPassword } })
    await waitFor(() => {
      expect(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD)).toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText(UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD), {
      target: { value: newPassword },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })
})
