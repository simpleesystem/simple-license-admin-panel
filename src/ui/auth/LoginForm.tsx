import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/app/auth/useAuth'
import { ROUTE_PATH_DASHBOARD } from '@/app/constants'
import { Stack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/typography/Heading'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({})

  const validateForm = (newUsername: string, newPassword: string) => {
    const newErrors: { username?: string; password?: string } = {}
    if (!newUsername.trim() && newPassword.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!newPassword.trim() && newUsername.trim()) {
      newErrors.password = 'Password is required'
    }
    setValidationErrors(newErrors)
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    validateForm(value, password)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    validateForm(username, value)
  }

  const isFormValid = username.trim() !== '' && password.trim() !== '' && Object.keys(validationErrors).length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ username, password })
      await navigate({ to: ROUTE_PATH_DASHBOARD })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="large">
        <Heading level={2}>Login</Heading>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div>
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="form-control"
            value={username}
            onChange={handleUsernameChange}
            disabled={isSubmitting}
            required={true}
          />
          {validationErrors.username && (
            <div className="text-danger small mt-1">{validationErrors.username}</div>
          )}
        </div>

        <div>
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={password}
            onChange={handlePasswordChange}
            disabled={isSubmitting}
            required={true}
          />
          {validationErrors.password && (
            <div className="text-danger small mt-1">{validationErrors.password}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting || !isFormValid}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </Stack>
    </form>
  )
}
