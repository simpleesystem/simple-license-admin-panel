/* c8 ignore file */
/* istanbul ignore file */
import type { ChangePasswordRequest } from '@simple-license/react-sdk'
import { useChangePassword } from '@simple-license/react-sdk'
import Joi from 'joi'
import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { useLogger } from '../../app/logging/loggerContext'
import { raiseErrorFromUnknown } from '../../app/state/dispatchers'
import { useAppStore } from '../../app/state/store'
import { AppForm } from '../../forms/Form'
import {
  UI_CHANGE_PASSWORD_BUTTON_UPDATE,
  UI_CHANGE_PASSWORD_BUTTON_UPDATING,
  UI_CHANGE_PASSWORD_DESCRIPTION,
  UI_CHANGE_PASSWORD_ERROR_CONFIRM_REQUIRED,
  UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID,
  UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH,
  UI_CHANGE_PASSWORD_ERROR_REQUIRED,
  UI_CHANGE_PASSWORD_HEADING,
  UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD,
  UI_CHANGE_PASSWORD_LABEL_EMAIL,
  UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD,
  UI_CHANGE_PASSWORD_SECTION_DESCRIPTION,
  UI_CHANGE_PASSWORD_SECTION_TITLE,
  UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD,
  UI_CHANGE_PASSWORD_VALIDATION_NEW_PASSWORD,
  UI_FORM_CONTROL_TYPE_EMAIL,
  UI_FORM_CONTROL_TYPE_PASSWORD,
} from '../constants'
import { FormActions } from '../forms/FormActions'
import { FormSection } from '../forms/FormSection'
import { TextField } from '../forms/TextField'

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
  const { currentUser, refreshCurrentUser } = useAuth()
  const dispatch = useAppStore((state) => state.dispatch)
  const logger = useLogger()
  const mutation = useChangePassword(client)
  const schema = useMemo(() => buildSchema(currentUser?.email ?? ''), [currentUser?.email])
  const defaultValues = useMemo<ChangePasswordValues>(() => {
    return {
      ...DEFAULT_VALUES,
      email: currentUser?.email ?? '',
    }
  }, [currentUser?.email])

  const handleSubmit = async (values: ChangePasswordValues) => {
    try {
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
      await mutation.mutateAsync(payload)
      await refreshCurrentUser()
      onSuccess?.()
      logger.info('change-password:submit:success', {
        emailUpdated: Boolean(trimmedEmail && trimmedEmail !== currentUser?.email),
        passwordUpdated: wantsPasswordChange,
      })
    } catch (error) {
      const appError = raiseErrorFromUnknown({
        error,
        dispatch,
        scope: 'auth',
      })
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
    <Card>
      <Card.Body>
        <h1 className="h4 mb-3">{UI_CHANGE_PASSWORD_HEADING}</h1>
        <p className="text-muted mb-4">{UI_CHANGE_PASSWORD_DESCRIPTION}</p>

        <AppForm<ChangePasswordValues> schema={schema} defaultValues={defaultValues} onSubmit={handleSubmit}>
          <FormSection title={UI_CHANGE_PASSWORD_SECTION_TITLE} description={UI_CHANGE_PASSWORD_SECTION_DESCRIPTION}>
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
          </FormSection>

          <FormActions>
            <Button type="submit" variant="primary" disabled={mutation.isPending}>
              {mutation.isPending ? UI_CHANGE_PASSWORD_BUTTON_UPDATING : UI_CHANGE_PASSWORD_BUTTON_UPDATE}
            </Button>
          </FormActions>
        </AppForm>
      </Card.Body>
    </Card>
  )
}
