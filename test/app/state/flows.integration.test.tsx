import {
  API_ENDPOINT_ADMIN_USERS_ME,
  API_ENDPOINT_ADMIN_USERS_ME_PASSWORD,
  API_ENDPOINT_AUTH_LOGIN,
  ApiException,
  ERROR_CODE_INVALID_CREDENTIALS,
} from '@simple-license/react-sdk'
import { useQuery } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { useState } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '../../../src/app/AppProviders'
import { useAuth } from '../../../src/app/auth/authContext'
import { derivePermissionsFromUser } from '../../../src/app/auth/permissions'
import { router } from '../../../src/app/router'
import { selectErrorSurface, selectPermissions, selectUser, useAppStore } from '../../../src/app/state/store'
import { ChangePasswordFlow } from '../../../src/ui/auth/ChangePasswordFlow'
import { buildUser } from '../../factories/userFactory'
import { server } from '../../msw/server'

const resetStore = () => {
  const dispatch = useAppStore.getState().dispatch
  useAppStore.setState({
    user: null,
    permissions: derivePermissionsFromUser(null),
    data: {},
    surface: { errors: {}, lastScope: null, loading: {} },
    navigationIntent: null,
    dispatch,
  })
}

const StateProbe = () => {
  const user = useAppStore(selectUser)
  const permissions = useAppStore(selectPermissions)
  const error = useAppStore(selectErrorSurface)
  return (
    <div>
      <div data-testid="probe-email">{user?.email ?? ''}</div>
      <div data-testid="probe-change-password">{permissions.changePassword ? 'true' : 'false'}</div>
      <div data-testid="probe-error-code">{error?.code ?? ''}</div>
      <div data-testid="probe-error-scope">{error?.scope ?? ''}</div>
    </div>
  )
}

const AuthHarness = () => {
  const { login } = useAuth()
  return (
    <div>
      <button type="button" onClick={() => login('admin', 'goodpass').catch(() => {})}>
        login-success
      </button>
      <button type="button" onClick={() => login('admin', 'badpass').catch(() => {})}>
        login-fail
      </button>
      <RouterProvider router={router} />
      <StateProbe />
    </div>
  )
}

const QueryHarness = () => {
  const [enabled, setEnabled] = useState(false)
  useQuery({
    queryKey: ['query-error'],
    enabled,
    queryFn: async () => {
      throw new ApiException('Server blew up', 'SERVER_ERROR', { status: 500, requestId: 'req-123' })
    },
    retry: false,
  })

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setEnabled(true)
        }}
      >
        query-error
      </button>
      <StateProbe />
    </div>
  )
}

const Thrower = () => {
  throw new Error('boom')
}

const RuntimeHarness = () => {
  return (
    <div>
      <Thrower />
      <StateProbe />
    </div>
  )
}

describe('integration flows', () => {
  beforeEach(() => {
    resetStore()
  })

  it('logs in successfully and hydrates user/permissions', async () => {
    const user = buildUser({ email: 'admin@example.com', role: 'ADMIN', passwordResetRequired: false })

    server.use(
      http.post(API_ENDPOINT_AUTH_LOGIN, async () => {
        return HttpResponse.json(
          {
            token: 'test-token',
            token_type: 'Bearer',
            expires_in: 3600,
            must_change_password: false,
            user,
          },
          { status: 200 }
        )
      }),
      http.get(API_ENDPOINT_ADMIN_USERS_ME, () => {
        return HttpResponse.json({
          success: true,
          data: { user },
        })
      })
    )

    render(
      <AppProviders>
        <AuthHarness />
      </AppProviders>
    )

    await userEvent.click(screen.getByText('login-success'))

    await waitFor(() => {
      expect(screen.getByTestId('probe-email').textContent).toBe('admin@example.com')
      expect(screen.getByTestId('probe-change-password').textContent).toBe('false')
      expect(screen.getByTestId('probe-error-code').textContent).toBe('')
    })
  })

  it('surfaces invalid credential errors via the central surface', async () => {
    server.use(
      http.post(API_ENDPOINT_AUTH_LOGIN, () => {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODE_INVALID_CREDENTIALS,
              message: 'Invalid credentials',
            },
          },
          { status: 401 }
        )
      })
    )

    render(
      <AppProviders>
        <AuthHarness />
      </AppProviders>
    )

    await userEvent.click(screen.getByText('login-fail'))

    await waitFor(() => {
      expect(screen.getByTestId('probe-error-code').textContent).toBe(ERROR_CODE_INVALID_CREDENTIALS)
      expect(screen.getByTestId('probe-error-scope').textContent).toBe('auth')
    })
  })

  it('allows change-password flow to clear reset requirement and permissions', async () => {
    const user = buildUser({ email: 'reset@example.com', role: 'ADMIN', passwordResetRequired: true })
    let resetCleared = false

    server.use(
      http.post(API_ENDPOINT_AUTH_LOGIN, () => {
        return HttpResponse.json(
          {
            token: 'test-token',
            token_type: 'Bearer',
            expires_in: 3600,
            must_change_password: true,
            user,
          },
          { status: 200 }
        )
      }),
      http.get(API_ENDPOINT_ADMIN_USERS_ME, () => {
        return HttpResponse.json({
          success: true,
          data: { user: { ...user, passwordResetRequired: !resetCleared } },
        })
      }),
      http.patch(API_ENDPOINT_ADMIN_USERS_ME_PASSWORD, async () => {
        resetCleared = true
        return HttpResponse.json({
          success: true,
        })
      })
    )

    const ChangePasswordHarness = () => {
      const { login } = useAuth()
      return (
        <div>
          <button type="button" onClick={() => login('admin', 'goodpass').catch(() => {})}>
            login-reset
          </button>
          <ChangePasswordFlow />
          <StateProbe />
        </div>
      )
    }

    render(
      <AppProviders>
        <ChangePasswordHarness />
      </AppProviders>
    )

    await userEvent.click(screen.getByText('login-reset'))

    const currentPassword = screen.getByLabelText('Current password')
    const newPassword = screen.getByLabelText('New password')
    const confirmPassword = screen.getByLabelText('Confirm new password')

    await userEvent.type(currentPassword, 'oldpass')
    await userEvent.type(newPassword, 'newpass123')
    await userEvent.type(confirmPassword, 'newpass123')

    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByTestId('probe-change-password').textContent).toBe('false')
      expect(screen.getByTestId('probe-error-code').textContent).toBe('')
    })
  })

  it('routes query failures through the central surface with correlation', async () => {
    render(
      <AppProviders>
        <QueryHarness />
      </AppProviders>
    )

    await userEvent.click(screen.getByText('query-error'))

    await waitFor(() => {
      expect(screen.getByTestId('probe-error-code').textContent).toBe('SERVER_ERROR')
      expect(screen.getByTestId('probe-error-scope').textContent).toBe('data')
    })
  })

  it('captures runtime errors via the global boundary', async () => {
    render(
      <AppProviders>
        <RuntimeHarness />
      </AppProviders>
    )

    await waitFor(() => {
      expect(screen.getByTestId('probe-error-code').textContent).toBe('RUNTIME_ERROR')
      expect(screen.getByTestId('probe-error-scope').textContent).toBe('global')
    })
  })
})
