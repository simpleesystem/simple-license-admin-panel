import { useState } from 'react'
import { useApiClient } from '@/api/apiContext'
import { useAuth } from '@/app/auth/useAuth'
import { APP_ERROR_MESSAGE_NON_ERROR_THROWABLE, NOTIFICATION_EVENT_TOAST, NOTIFICATION_VARIANT_SUCCESS } from '@/app/constants'
import { useNotificationBus } from '@/notifications/useNotificationBus'
import {
  UI_CHANGE_PASSWORD_BUTTON_UPDATE,
  UI_CHANGE_PASSWORD_BUTTON_UPDATING,
  UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID,
  UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH,
  UI_CHANGE_PASSWORD_ERROR_REQUIRED,
  UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_EMAIL,
  UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD,
  UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD,
} from '@/ui/constants'
import { Stack } from '@/ui/layout/Stack'

type ChangePasswordFormProps = {
  onSuccess?: () => void
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { refreshCurrentUser, currentUser } = useAuth()
  const client = useApiClient()
  const notificationBus = useNotificationBus()

  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const isEmailChanged = email !== currentUser?.email
    const isPasswordChanged = !!newPassword

    if (!isEmailChanged && !isPasswordChanged) {
      // Logic for "requires at least one change" - maybe just return or show error?
      // Test expects nothing to happen or validation error?
      // "requires at least one change before submission" test expects mutation NOT called.
      // But typically form submission is disabled or shows error.
      // Let's assume we just return for now, but UI should probably disable button.
      // Wait, test: await waitFor(() => expect(mutation.mutateAsync).not.toHaveBeenCalled())
      // So if we return early, it passes.
      // But maybe we should show an error?
      // "UI_CHANGE_PASSWORD_ERROR_REQUIRED" exists.
      setError(UI_CHANGE_PASSWORD_ERROR_REQUIRED)
      return
    }

    if (isEmailChanged) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError(UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID)
            return
        }
    }

    if (isPasswordChanged) {
      if (!currentPassword) {
        setError(UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD)
        return
      }
      if (newPassword !== confirmPassword) {
        setError(UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH)
        return
      }
    }

    setIsSubmitting(true)

    try {
      await client.changePassword({
        ...(isEmailChanged ? { email } : {}),
        ...(isPasswordChanged ? { current_password: currentPassword, new_password: newPassword } : {}),
      })

      notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
        variant: NOTIFICATION_VARIANT_SUCCESS,
        titleKey: 'auth.password_changed',
        message: 'Account settings updated successfully', // UI_CHANGE_PASSWORD_TOAST_SUCCESS
      })

      // Refresh user to clear the reset required flag or update email
      await refreshCurrentUser()

      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : APP_ERROR_MESSAGE_NON_ERROR_THROWABLE
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="large">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div>
          <label className="form-label" htmlFor="email">
            {UI_CHANGE_PASSWORD_LABEL_EMAIL}
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="currentPassword">
            {UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD}
          </label>
          <input
            id="currentPassword"
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSubmitting}
            required={true}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="newPassword">
            {UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD}
          </label>
          <input
            id="newPassword"
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            required={true}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="confirmPassword">
            {UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD}
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            required={true}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? UI_CHANGE_PASSWORD_BUTTON_UPDATING : UI_CHANGE_PASSWORD_BUTTON_UPDATE}
        </button>
      </Stack>
    </form>
  )
}
