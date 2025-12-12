import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { LoginCard } from '../../../../src/app/auth/LoginCard'
import { AuthProvider } from '../../../../src/app/auth/AuthProvider'
import { AppProviders } from '../../../../src/app/AppProviders'
import { renderWithProviders } from '../../utils'

const loginMock = vi.hoisted(() => vi.fn())

vi.mock('../../../../src/app/auth/authContext', async () => {
  const actual = await vi.importActual<typeof import('../../../../src/app/auth/authContext')>(
    '../../../../src/app/auth/authContext'
  )
  return {
    ...actual,
    useAuth: () => ({
      ...actual.useAuth(),
      login: loginMock,
    }),
  }
})

describe('LoginCard integration', () => {
  test('logs in successfully and shows no error', async () => {
    loginMock.mockResolvedValueOnce(undefined)

    renderWithProviders(
      <AppProviders>
        <AuthProvider>
          <LoginCard />
        </AuthProvider>
      </AppProviders>,
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('admin', 'password')
    })
    expect(screen.queryByText(/unable to sign in/i)).toBeNull()
  })

  test('shows error on failure', async () => {
    loginMock.mockRejectedValueOnce(new Error('Bad credentials'))

    renderWithProviders(
      <AppProviders>
        <AuthProvider>
          <LoginCard />
        </AuthProvider>
      </AppProviders>,
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    const errorMessages = await screen.findAllByText(/Bad credentials/i)
    expect(errorMessages.length).toBeGreaterThan(0)
  })
})

