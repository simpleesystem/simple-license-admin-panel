import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useCallback } from 'react'
import { beforeEach, vi } from 'vitest'

import { AppProviders } from '../../../src/app/AppProviders'
import { useAuth } from '../../../src/app/auth/authContext'
import {
  AUTH_STATUS_IDLE,
  STORAGE_KEY_AUTH_EXPIRY,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
} from '../../../src/app/constants'
import { buildUser } from '../../factories/userFactory'

const mockClient = {
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  setToken: vi.fn(),
}

vi.mock('../../../src/api/apiContext', async () => {
  const actual = await vi.importActual<typeof import('../../../src/api/apiContext')>('../../../src/api/apiContext')
  return {
    ...actual,
    useApiClient: () => mockClient,
  }
})

const TEST_USERNAME = 'admin@example.com' as const
const TEST_PASSWORD = 'password123!' as const
const BUTTON_LABEL_LOGIN = 'login' as const
const BUTTON_LABEL_LOGOUT = 'logout' as const
const TEXT_AUTHENTICATED = 'authenticated' as const
const TEXT_ANONYMOUS = 'anonymous' as const
const TEST_ID_AUTH_STATUS = 'auth-status' as const
const TEST_ID_AUTH_USER = 'auth-user' as const
const REFRESH_BUTTON_ID = 'refresh-user' as const
const TEST_ID_AUTH_STATUS_VALUE = 'auth-status-value' as const
const LOGIN_ERROR_MESSAGE = 'login-failed' as const

const AuthConsumer = () => {
  const { login, logout, currentUser, isAuthenticated, refreshCurrentUser, status } = useAuth()

  const handleLogin = useCallback(() => {
    void login(TEST_USERNAME, TEST_PASSWORD).catch(() => {})
  }, [login])

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  const handleRefresh = useCallback(() => {
    void refreshCurrentUser()
  }, [refreshCurrentUser])

  return (
    <div>
      <button onClick={handleLogin} type="button">
        {BUTTON_LABEL_LOGIN}
      </button>
      <button onClick={handleLogout} type="button">
        {BUTTON_LABEL_LOGOUT}
      </button>
      <button data-testid={REFRESH_BUTTON_ID} onClick={handleRefresh} type="button">
        refresh
      </button>
      <div data-testid={TEST_ID_AUTH_STATUS}>{isAuthenticated ? TEXT_AUTHENTICATED : TEXT_ANONYMOUS}</div>
      <div data-testid={TEST_ID_AUTH_USER}>{currentUser?.username ?? ''}</div>
      <div data-testid={TEST_ID_AUTH_STATUS_VALUE}>{status}</div>
    </div>
  )
}

const renderAuthTree = () => {
  return render(
    <AppProviders>
      <AuthConsumer />
    </AppProviders>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
  const user = buildUser({ username: TEST_USERNAME })
  mockClient.login.mockResolvedValue({
    token: 'test-token',
    token_type: 'Bearer',
    expires_in: 3600,
    user,
  })
  mockClient.getCurrentUser.mockResolvedValue({ user })
})

describe('AuthProvider', () => {
  it('logs in and exposes authenticated user details', async () => {
    renderAuthTree()

    fireEvent.click(screen.getByText(BUTTON_LABEL_LOGIN))

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_AUTH_STATUS).textContent).toBe(TEXT_AUTHENTICATED)
    })
    expect(screen.getByTestId(TEST_ID_AUTH_USER).textContent).toBeTruthy()
  })

  it('logs out and clears the user state', async () => {
    renderAuthTree()
    fireEvent.click(screen.getByText(BUTTON_LABEL_LOGIN))
    await screen.findByText(TEXT_AUTHENTICATED)

    fireEvent.click(screen.getByText(BUTTON_LABEL_LOGOUT))

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_AUTH_STATUS).textContent).toBe(TEXT_ANONYMOUS)
    })
    expect(screen.getByTestId(TEST_ID_AUTH_USER).textContent).toBe('')
  })

  it('refreshes the current user even if the API rejects', async () => {
    mockClient.getCurrentUser.mockRejectedValueOnce(new Error('network'))
    renderAuthTree()

    fireEvent.click(screen.getByTestId(REFRESH_BUTTON_ID))

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_AUTH_STATUS).textContent).toBe(TEXT_ANONYMOUS)
    })
  })

  it('removes expired persisted tokens during initialization', () => {
    window.localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'legacy-token')
    window.localStorage.setItem(STORAGE_KEY_AUTH_EXPIRY, `${Date.now() - 1_000}`)

    renderAuthTree()

    expect(screen.getByTestId(TEST_ID_AUTH_STATUS).textContent).toBe(TEXT_ANONYMOUS)
    expect(window.localStorage.getItem(STORAGE_KEY_AUTH_TOKEN)).toBeNull()
  })

  it('refreshes the user when authenticated', async () => {
    renderAuthTree()
    fireEvent.click(screen.getByText(BUTTON_LABEL_LOGIN))
    await screen.findByText(TEXT_AUTHENTICATED)

    const refreshedUser = buildUser({ username: 'refreshed-user' })
    await waitFor(() => {
      expect(mockClient.getCurrentUser).toHaveBeenCalled()
    })
    mockClient.getCurrentUser.mockResolvedValueOnce({ user: refreshedUser })

    fireEvent.click(screen.getByTestId(REFRESH_BUTTON_ID))

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_AUTH_USER).textContent).toBe(refreshedUser.username)
    })
  })

  it('skips network calls when refreshing without a token', async () => {
    renderAuthTree()

    fireEvent.click(screen.getByTestId(REFRESH_BUTTON_ID))

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_AUTH_STATUS).textContent).toBe(TEXT_ANONYMOUS)
    })
    expect(mockClient.getCurrentUser).not.toHaveBeenCalled()
  })

  it('logs out when another tab clears the auth token', async () => {
    renderAuthTree()
    fireEvent.click(screen.getByText(BUTTON_LABEL_LOGIN))
    await screen.findByText(TEXT_AUTHENTICATED)

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY_AUTH_TOKEN, newValue: null }))
    })

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_AUTH_STATUS).textContent).toBe(TEXT_ANONYMOUS)
    })
  })

  it('updates the current user when storage events provide a new user snapshot', async () => {
    renderAuthTree()
    fireEvent.click(screen.getByText(BUTTON_LABEL_LOGIN))
    await screen.findByText(TEXT_AUTHENTICATED)

    const externalUser = buildUser({ username: 'external-user' })
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY_AUTH_USER,
          newValue: JSON.stringify(externalUser),
        })
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_AUTH_USER).textContent).toBe(externalUser.username)
    })
  })

  it('resets auth state when login fails', async () => {
    const loginError = new Error(LOGIN_ERROR_MESSAGE)
    mockClient.login.mockRejectedValueOnce(loginError)
    renderAuthTree()

    fireEvent.click(screen.getByText(BUTTON_LABEL_LOGIN))

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_AUTH_STATUS).textContent).toBe(TEXT_ANONYMOUS)
    })
    expect(screen.getByTestId(TEST_ID_AUTH_STATUS_VALUE).textContent).toBe(AUTH_STATUS_IDLE)
    expect(screen.getByTestId(TEST_ID_AUTH_USER).textContent).toBe('')
    expect(mockClient.setToken).toHaveBeenCalledWith(null, null)
  })
})
