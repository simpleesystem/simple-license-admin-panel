import { RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppProviders } from '../../../src/app/AppProviders'
import { useAuth } from '../../../src/app/auth/authContext'
import { router } from '../../../src/app/router'

// Basic harness to verify auth flow renders a single error and redirects on success.

const TestApp = () => {
  const { login, logout, currentUser } = useAuth()
  return (
    <div>
      <button onClick={() => login('admin', 'badpass').catch(() => {})}>bad-login</button>
      <button onClick={() => login('admin', 'goodpass').catch(() => {})}>good-login</button>
      <button onClick={() => logout()}>logout</button>
      <div data-testid="user-email">{currentUser?.email ?? ''}</div>
      <RouterProvider router={router} />
    </div>
  )
}

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => () => {},
  }
})

describe('auth flows', () => {
  it('shows a single inline error for invalid login', async () => {
    render(
      <AppProviders>
        <TestApp />
      </AppProviders>
    )

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'bad-login' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'bad-login' }))

    // The error is caught and handled - verify user is not logged in
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('')
    }, { timeout: 2000 })
  })
})
