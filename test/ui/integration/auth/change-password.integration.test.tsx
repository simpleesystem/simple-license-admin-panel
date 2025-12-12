import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ChangePasswordFlow } from '../../../../src/ui/auth/ChangePasswordFlow'
import { UI_CHANGE_PASSWORD_BUTTON_UPDATE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'

const useChangePasswordMock = vi.hoisted(() => vi.fn())

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
      currentUser: { email: 'user@example.com', role: 'SUPERUSER', vendorId: 'vendor-1' },
      login: vi.fn(),
      logout: vi.fn(),
    }),
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('ChangePasswordFlow integration', () => {
  test('submits success path and shows success message', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'old-pass' } })
    fireEvent.change(screen.getAllByLabelText(/new password/i)[0], { target: { value: 'new-pass' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'new-pass' } })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => {
      expect(mutation.mutateAsync).toHaveBeenCalled()
    })
    expect(screen.queryByText(/failed/i)).toBeNull()
  })

  test('shows error message on failure', async () => {
    const error = new Error('bad creds')
    const mutation = {
      mutateAsync: vi.fn(async () => {
        throw error
      }),
      isPending: false,
    }
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithProviders(<ChangePasswordFlow />)

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'old-pass' } })
    fireEvent.change(screen.getAllByLabelText(/new password/i)[0], { target: { value: 'new-pass' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'new-pass' } })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    expect(await screen.findByText(/Unable to update account settings/i)).toBeInTheDocument()
  })
})
