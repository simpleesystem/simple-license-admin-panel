import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { AuthRouteComponent } from '../../../../src/routes/auth/AuthRoute'
import { UI_TEST_ID_PAGE_HEADER } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'

const loginMock = vi.hoisted(() => vi.fn())

vi.mock('../../../../src/app/auth/authContext', async () => {
  const actual = await vi.importActual<typeof import('../../../../src/app/auth/authContext')>(
    '../../../../src/app/auth/authContext'
  )
  return {
    ...actual,
    useAuth: () => ({
      currentUser: null,
      isAuthenticated: false,
      status: actual.AUTH_STATUS_IDLE,
      token: null,
      login: loginMock,
      logout: vi.fn(),
      refreshCurrentUser: vi.fn(),
    }),
  }
})

describe('AuthRouteComponent', () => {
  test('renders login page shell with form fields', () => {
    renderWithProviders(<AuthRouteComponent />)

    expect(screen.getByTestId(UI_TEST_ID_PAGE_HEADER)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })
})

