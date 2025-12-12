import { fireEvent, screen, waitFor } from '@testing-library/react'
import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { ChangePasswordRouteComponent } from '../../../../src/routes/auth/ChangePasswordRoute'
import { ROUTE_PATH_ROOT } from '../../../../src/app/constants'
import { UI_CHANGE_PASSWORD_BUTTON_UPDATE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'
import { buildUser } from '../../../factories/userFactory'

const useChangePasswordMock = vi.hoisted(() => vi.fn())
const navigateMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useChangePassword: useChangePasswordMock,
  }
})

vi.mock('../../../../src/app/auth/authContext', async () => {
  const actual = await vi.importActual<typeof import('../../../../src/app/auth/authContext')>(
    '../../../../src/app/auth/authContext'
  )
  return {
    ...actual,
    useAuth: () => ({
      currentUser: buildUser({ email: faker.internet.email() }),
      isAuthenticated: true,
      status: actual.AUTH_STATUS_IDLE,
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
    useNavigate: () => navigateMock,
  }
})

describe('ChangePasswordRouteComponent', () => {
  test('submits change password and navigates after success', async () => {
    const mutateAsync = vi.fn(async () => ({}))
    useChangePasswordMock.mockReturnValue({ mutateAsync, isPending: false })
    const currentPassword = faker.internet.password()
    const newPassword = faker.internet.password()

    renderWithProviders(<ChangePasswordRouteComponent />)

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: currentPassword } })
    fireEvent.change(screen.getAllByLabelText(/new password/i)[0], { target: { value: newPassword } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: newPassword } })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        current_password: currentPassword,
        new_password: newPassword,
      })
    })
    expect(navigateMock).toHaveBeenCalledWith({ to: ROUTE_PATH_ROOT })
  })

  test('shows error message when mutation fails', async () => {
    const error = new Error('failed to update')
    const mutateAsync = vi.fn(async () => {
      throw error
    })
    useChangePasswordMock.mockReturnValue({ mutateAsync, isPending: false })
    const currentPassword = faker.internet.password()
    const newPassword = faker.internet.password()

    renderWithProviders(<ChangePasswordRouteComponent />)

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: currentPassword } })
    fireEvent.change(screen.getAllByLabelText(/new password/i)[0], { target: { value: newPassword } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: newPassword } })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    expect(await screen.findByText(/Unable to update account settings/i)).toBeInTheDocument()
  })
})

