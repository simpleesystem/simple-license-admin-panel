import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { LoginCard } from '../../../../src/app/auth/LoginCard'

const loginMock = vi.hoisted(() => vi.fn())

vi.mock('../../../../src/app/auth/useAuth', async () => {
  const { AUTH_STATUS_IDLE } = await import('../../../../src/app/constants')
  return {
    useAuth: () => ({
      currentUser: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      status: AUTH_STATUS_IDLE,
      error: null,
      token: null,
      login: loginMock,
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

describe('LoginCard integration', () => {
  test('logs in successfully and shows no error', async () => {
    loginMock.mockResolvedValueOnce(undefined)

    render(<LoginCard />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ username: 'admin', password: 'password' })
    })
    expect(screen.queryByText(/unable to sign in/i)).toBeNull()
  })

  test('shows error on failure', async () => {
    loginMock.mockRejectedValueOnce(new Error('Bad credentials'))

    render(<LoginCard />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    const errorMessages = await screen.findAllByText(/Bad credentials/i)
    expect(errorMessages.length).toBeGreaterThan(0)
  })
})
