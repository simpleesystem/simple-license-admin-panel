import { useState } from 'react'
import { useApiClient } from '@/api/apiContext'
import { useAuth } from '@/app/auth/useAuth'
import { APP_ERROR_MESSAGE_NON_ERROR_THROWABLE, NOTIFICATION_EVENT_TOAST, NOTIFICATION_VARIANT_SUCCESS } from '@/app/constants'
import { useNotificationBus } from '@/notifications/useNotificationBus'
import {
  UI_CHANGE_PASSWORD_BUTTON_UPDATE,
  UI_CHANGE_PASSWORD_BUTTON_UPDATING,
  UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH,
  UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD,
} from '@/ui/constants'
import { Stack } from '@/ui/layout/Stack'

type ChangePasswordFormProps = {
  onSuccess?: () => void
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { refreshCurrentUser } = useAuth()
  const client = useApiClient()
  const notificationBus = useNotificationBus()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError(UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH)
      return
    }

    setIsSubmitting(true)

    try {
      await client.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })

      notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
        variant: NOTIFICATION_VARIANT_SUCCESS,
        titleKey: 'auth.password_changed',
        message: 'Password updated successfully',
      })

      // Refresh user to clear the reset required flag
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
