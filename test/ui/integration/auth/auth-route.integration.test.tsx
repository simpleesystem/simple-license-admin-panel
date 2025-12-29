import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { AuthRouteComponent } from '../../../../src/routes/auth/AuthRoute'
import { renderWithProviders } from '../../utils'

const loginMock = vi.hoisted(() => vi.fn())

vi.mock('../../../../src/app/auth/authContext', async () => {
  const actual = await vi.importActual<typeof import('../../../../src/app/auth/authContext')>(
    '../../../../src/app/auth/authContext'
  )
  const { AUTH_STATUS_IDLE } = await import('../../../../src/app/constants')
  return {
    ...actual,
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
    useSearch: () => ({ redirect: undefined }),
    useRouterState: () => ({ location: { pathname: '/auth' } }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  }
})

describe('AuthRouteComponent', () => {
  test('renders login page shell with form fields', async () => {
    renderWithProviders(<AuthRouteComponent />)

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })
})
