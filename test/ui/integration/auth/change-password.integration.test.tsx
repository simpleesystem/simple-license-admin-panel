import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ChangePasswordFlow } from '../../../../src/ui/auth/ChangePasswordFlow'
import { renderWithProviders } from '../../utils'

const useChangePasswordMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useChangePassword: useChangePasswordMock,
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
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'new-pass' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'new-pass' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(mutation.mutateAsync).toHaveBeenCalled()
    })
    expect(screen.getByText(/password updated/i)).toBeInTheDocument()
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
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'new-pass' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'new-pass' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to update password/i)).toBeInTheDocument()
    })
  })
})

