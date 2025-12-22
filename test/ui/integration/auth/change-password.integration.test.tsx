import type { Client } from '@simple-license/react-sdk'
import type { ChangePasswordRequest, ChangePasswordResponse } from '@simple-license/react-sdk'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi, type MockedFunction } from 'vitest'

import { ChangePasswordFlow } from '../../../../src/ui/auth/ChangePasswordFlow'
import { UI_CHANGE_PASSWORD_BUTTON_UPDATE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'

const mockChangePassword = vi.fn() as MockedFunction<
  (request: ChangePasswordRequest) => Promise<ChangePasswordResponse>
>

const mockClient = {
  changePassword: mockChangePassword,
  restoreSession: vi.fn().mockResolvedValue(null),
} as unknown as Client

vi.mock('../../../../src/app/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../../../../src/app/auth/useAuth', () => ({
  useAuth: () => ({
    currentUser: { email: 'user@example.com', role: 'SUPERUSER', vendorId: 'vendor-1' },
    login: vi.fn(),
    logout: vi.fn(),
    refreshCurrentUser: vi.fn(),
    isAuthenticated: true,
  }),
}))

describe('ChangePasswordFlow integration', () => {
  test('submits success path and shows success message', async () => {
    mockChangePassword.mockResolvedValue({})

    renderWithProviders(<ChangePasswordFlow />, { client: mockClient })

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'old-pass' } })
    fireEvent.change(screen.getAllByLabelText(/new password/i)[0], { target: { value: 'new-pass' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'new-pass' } })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    await waitFor(() => {
      expect(mockClient.changePassword).toHaveBeenCalled()
    })
    expect(screen.queryByText(/failed/i)).toBeNull()
  })

  test('shows error message on failure', async () => {
    mockChangePassword.mockRejectedValue(new Error('bad creds'))

    renderWithProviders(<ChangePasswordFlow />, { client: mockClient })

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'old-pass' } })
    fireEvent.change(screen.getAllByLabelText(/new password/i)[0], { target: { value: 'new-pass' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'new-pass' } })
    fireEvent.click(screen.getByRole('button', { name: UI_CHANGE_PASSWORD_BUTTON_UPDATE }))

    expect(await screen.findByText(/bad creds/i)).toBeInTheDocument()
  })
})
