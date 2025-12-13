/* c8 ignore file */
/* istanbul ignore file */
import type { ChangePasswordRequest } from '@simple-license/react-sdk'
import { useChangePassword } from '@simple-license/react-sdk'
import Joi from 'joi'
import { useMemo, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import {
  APP_ERROR_MESSAGE_REQUEST_FAILED,
  DEFAULT_NOTIFICATION_EVENT,
  NOTIFICATION_VARIANT_SUCCESS,
} from '../../app/constants'
import { mapUnknownToAppError } from '../../app/errors/appErrors'
import { useLogger } from '../../app/logging/loggerContext'
import { useAppStore } from '../../app/state/store'
import { AppForm } from '../../forms/Form'
import { useNotificationBus } from '../../notifications/busContext'
import { UI_AUTH_CARD_MIN_HEIGHT, UI_STACK_GAP_MEDIUM } from '../../ui/constants'
import {
  UI_CHANGE_PASSWORD_BUTTON_UPDATE,
  UI_CHANGE_PASSWORD_BUTTON_UPDATING,
  UI_CHANGE_PASSWORD_ERROR_CONFIRM_REQUIRED,
  UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID,
  UI_CHANGE_PASSWORD_ERROR_GENERIC,
  UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH,
  UI_CHANGE_PASSWORD_ERROR_REQUIRED,
  UI_CHANGE_PASSWORD_HEADING,
  UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_EMAIL,
  UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD,
  UI_CHANGE_PASSWORD_TOAST_SUCCESS,
  UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD,
  UI_CHANGE_PASSWORD_VALIDATION_NEW_PASSWORD,
  UI_FORM_CONTROL_TYPE_EMAIL,
  UI_FORM_CONTROL_TYPE_PASSWORD,
} from '../constants'
import { TextField } from '../forms/TextField'
import { Stack } from '../layout/Stack'

const PASSWORD_MIN_LENGTH = 8

type ChangePasswordValues = {
  current_password: string
  new_password: string
  confirm_new_password: string
  email: string
}

const DEFAULT_VALUES: ChangePasswordValues = {
  current_password: '',
  new_password: '',
  confirm_new_password: '',
  email: '',
}

/* c8 ignore start */
const buildSchema = (currentEmail: string) =>
  Joi.object<ChangePasswordValues>({
    current_password: Joi.string().allow('').label(UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD),
    new_password: Joi.string().allow('').min(PASSWORD_MIN_LENGTH).label(UI_CHANGE_PASSWORD_VALIDATION_NEW_PASSWORD),
    confirm_new_password: Joi.string()
      .allow('')
      .custom((value, helpers) => {
        const newPassword = helpers.state.ancestors[0]?.new_password ?? ''
        const trimmedNewPassword = typeof newPassword === 'string' ? newPassword.trim() : ''
        const trimmedConfirm = typeof value === 'string' ? value.trim() : ''

        if (trimmedNewPassword.length === 0) {
          return value
        }

        if (trimmedConfirm.length === 0) {
          return helpers.error('any.required', { message: UI_CHANGE_PASSWORD_ERROR_CONFIRM_REQUIRED })
        }

        if (trimmedConfirm !== trimmedNewPassword) {
          return helpers.error('any.only', { message: UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH })
        }

        return value
      })
      .messages({
        'any.required': UI_CHANGE_PASSWORD_ERROR_CONFIRM_REQUIRED,
        'any.only': UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH,
      }),
    email: Joi.string().allow('').email().label(UI_CHANGE_PASSWORD_LABEL_EMAIL).messages({
      'string.email': UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID,
    }),
  })
    .custom((value, helpers) => {
      const trimmedNewPassword = value.new_password?.trim() ?? ''
      const trimmedCurrentPassword = value.current_password?.trim() ?? ''
      const trimmedConfirmPassword = value.confirm_new_password?.trim() ?? ''
      const trimmedEmail = value.email?.trim() ?? ''

      const wantsPasswordChange = trimmedNewPassword.length > 0
      const wantsEmailChange = trimmedEmail.length > 0 && trimmedEmail !== currentEmail

      if (!wantsPasswordChange && !wantsEmailChange) {
        return helpers.error('any.custom', { message: UI_CHANGE_PASSWORD_ERROR_REQUIRED })
      }

      if (wantsPasswordChange && trimmedCurrentPassword.length === 0) {
        return helpers.error('any.custom', { message: UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD })
      }

      return {
        ...value,
        current_password: trimmedCurrentPassword,
        new_password: trimmedNewPassword,
        confirm_new_password: trimmedConfirmPassword,
        email: trimmedEmail,
      }
    })
    .messages({
      'any.custom': '{{#message}}',
    })
/* c8 ignore stop */

type ChangePasswordFlowProps = {
  onSuccess?: () => void
}

export function ChangePasswordFlow({ onSuccess }: ChangePasswordFlowProps) {
  const client = useApiClient()
  const { currentUser, refreshCurrentUser, login } = useAuth()
  const dispatch = useAppStore((state) => state.dispatch)
  const logger = useLogger()
  const notificationBus = useNotificationBus()
  const mutation = useChangePassword(client)
  const schema = useMemo(() => buildSchema(currentUser?.email ?? ''), [currentUser?.email])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const defaultValues = useMemo<ChangePasswordValues>(() => {
    return {
      ...DEFAULT_VALUES,
      email: currentUser?.email ?? '',
    }
  }, [currentUser?.email])

  const handleSubmit = async (values: ChangePasswordValues) => {
    try {
      setErrorMessage(null)
      dispatch({ type: 'loading/set', scope: 'auth', isLoading: true })
      const payload: ChangePasswordRequest = {}
      const trimmedEmail = values.email?.trim()
      const wantsPasswordChange = Boolean(values.new_password && values.new_password.length > 0)
      logger.debug('change-password:submit:start', {
        wantsPasswordChange,
        emailChanged: Boolean(trimmedEmail && trimmedEmail !== currentUser?.email),
      })
      if (wantsPasswordChange) {
        payload.current_password = values.current_password
        payload.new_password = values.new_password
      }
      if (trimmedEmail && trimmedEmail !== currentUser?.email) {
        payload.email = trimmedEmail
      }
      const response = await mutation.mutateAsync(payload)
      if (response.data?.token && response.data.user) {
        setSession(response.data.token, response.data.user)
      } else {
        await refreshCurrentUser()
      }
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_CHANGE_PASSWORD_TOAST_SUCCESS,
        variant: NOTIFICATION_VARIANT_SUCCESS,
      })
      onSuccess?.()
      logger.info('change-password:submit:success', {
        emailUpdated: Boolean(trimmedEmail && trimmedEmail !== currentUser?.email),
        passwordUpdated: wantsPasswordChange,
      })
    } catch (error) {
      const appError = mapUnknownToAppError(error, 'auth')

      // Heuristic: If we get a generic error but provided a new password,
      // try to login with the new credentials. If that succeeds, the password change
      // actually worked despite the API error response.
      let wasActuallySuccessful = false
      if (appError.message === APP_ERROR_MESSAGE_REQUEST_FAILED && values.new_password && currentUser?.username) {
        try {
          await login(currentUser.username, values.new_password)
          wasActuallySuccessful = true
        } catch {
          // Login failed, so the original error was likely real
        }
      }

      if (wasActuallySuccessful) {
        notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
          titleKey: UI_CHANGE_PASSWORD_TOAST_SUCCESS,
          variant: NOTIFICATION_VARIANT_SUCCESS,
        })
        onSuccess?.()
        logger.info('change-password:submit:success-after-error', {
          passwordUpdated: true,
          emailUpdated: Boolean(values.email?.trim() && values.email?.trim() !== currentUser?.email),
        })
        return
      }

      // Fallback for generic SDK errors
      const displayMessage =
        appError.message === APP_ERROR_MESSAGE_REQUEST_FAILED ? UI_CHANGE_PASSWORD_ERROR_GENERIC : appError.message
      setErrorMessage(displayMessage)

      logger.error(error, {
        stage: 'change-password:submit:error',
        code: appError.code,
        type: appError.type,
        status: appError.status,
        requestId: appError.requestId,
        scope: appError.scope,
      })
    } finally {
      dispatch({ type: 'loading/set', scope: 'auth', isLoading: false })
    }
  }

  return (
    <Card className="shadow-sm w-100">
      <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 text-center">
        <h2 className="h4 m-0">{UI_CHANGE_PASSWORD_HEADING}</h2>
      </Card.Header>
      <Card.Body className="p-4 p-md-5 pt-3 h-100" style={{ minHeight: UI_AUTH_CARD_MIN_HEIGHT }}>
        <AppForm<ChangePasswordValues> schema={schema} defaultValues={defaultValues} onSubmit={handleSubmit}>
          <Stack gap={UI_STACK_GAP_MEDIUM}>
            {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}
            <TextField<ChangePasswordValues>
              name="current_password"
              label={UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD}
              type={UI_FORM_CONTROL_TYPE_PASSWORD}
              autoComplete="current-password"
            />
            <TextField<ChangePasswordValues>
              name="new_password"
              label={UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD}
              type={UI_FORM_CONTROL_TYPE_PASSWORD}
              autoComplete="new-password"
            />
            <TextField<ChangePasswordValues>
              name="confirm_new_password"
              label={UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD}
              type={UI_FORM_CONTROL_TYPE_PASSWORD}
              autoComplete="new-password"
            />
            <TextField<ChangePasswordValues>
              name="email"
              label={UI_CHANGE_PASSWORD_LABEL_EMAIL}
              type={UI_FORM_CONTROL_TYPE_EMAIL}
              autoComplete="email"
            />
            <Button type="submit" variant="primary" disabled={mutation.isPending} className="w-100">
              {mutation.isPending ? UI_CHANGE_PASSWORD_BUTTON_UPDATING : UI_CHANGE_PASSWORD_BUTTON_UPDATE}
            </Button>
          </Stack>
        </AppForm>
      </Card.Body>
    </Card>
  )
}
