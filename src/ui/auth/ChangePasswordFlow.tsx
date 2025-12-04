import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Joi from 'joi'

import { useChangePassword } from '@simple-license/react-sdk'
import type { ChangePasswordRequest } from '@simple-license/react-sdk'

import { AppForm } from '../../forms/Form'
import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { InlineAlert } from '../feedback/InlineAlert'
import { FormSection } from '../forms/FormSection'
import { TextField } from '../forms/TextField'
import { FormActions } from '../forms/FormActions'
import {
  UI_CHANGE_PASSWORD_BUTTON_UPDATE,
  UI_CHANGE_PASSWORD_BUTTON_UPDATING,
  UI_CHANGE_PASSWORD_DESCRIPTION,
  UI_CHANGE_PASSWORD_ERROR_GENERIC,
  UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID,
  UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH,
  UI_CHANGE_PASSWORD_ERROR_CONFIRM_REQUIRED,
  UI_CHANGE_PASSWORD_ERROR_REQUIRED,
  UI_CHANGE_PASSWORD_ERROR_TITLE,
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

const buildSchema = (currentEmail: string) =>
  Joi.object<ChangePasswordValues>({
    current_password: Joi.string().allow('').label(UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD),
    new_password: Joi.string().allow('').min(PASSWORD_MIN_LENGTH).label(UI_CHANGE_PASSWORD_VALIDATION_NEW_PASSWORD),
    confirm_new_password: Joi.string()
      .allow('')
      .valid(Joi.ref('new_password'))
      .when('new_password', {
        is: Joi.string().min(1),
        then: Joi.required().messages({ 'any.required': UI_CHANGE_PASSWORD_ERROR_CONFIRM_REQUIRED }),
        otherwise: Joi.optional(),
      })
      .messages({
        'any.only': UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH,
      }),
    email: Joi.string()
      .allow('')
      .email()
      .label(UI_CHANGE_PASSWORD_LABEL_EMAIL)
      .messages({
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

type ChangePasswordFlowProps = {
  onSuccess?: () => void
}

export function ChangePasswordFlow({ onSuccess }: ChangePasswordFlowProps) {
  const client = useApiClient()
  const { currentUser } = useAuth()
  const mutation = useChangePassword(client)
  const schema = useMemo(() => buildSchema(currentUser?.email ?? ''), [currentUser?.email])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const defaultValues = useMemo<ChangePasswordValues>(() => {
    return {
      ...DEFAULT_VALUES,
      email: currentUser?.email ?? '',
    }
  }, [currentUser?.email])

  const handleSubmit = async (values: ChangePasswordValues) => {
    try {
      setSubmitError(null)
      const payload: ChangePasswordRequest = {}
      const trimmedEmail = values.email?.trim()
      const wantsPasswordChange = Boolean(values.new_password && values.new_password.length > 0)
      if (wantsPasswordChange) {
        payload.current_password = values.current_password
        payload.new_password = values.new_password
      }
      if (trimmedEmail && trimmedEmail !== currentUser?.email) {
        payload.email = trimmedEmail
      }
      await mutation.mutateAsync(payload)
      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : UI_CHANGE_PASSWORD_ERROR_GENERIC
      setSubmitError(message)
      throw error
    }
  }

  return (
    <Card>
      <Card.Body>
        <h1 className="h4 mb-3">{UI_CHANGE_PASSWORD_HEADING}</h1>
        <p className="text-muted mb-4">{UI_CHANGE_PASSWORD_DESCRIPTION}</p>

        {submitError ? (
          <div className="mb-3">
            <InlineAlert variant="danger" title={UI_CHANGE_PASSWORD_ERROR_TITLE}>
              {submitError}
            </InlineAlert>
          </div>
        ) : null}

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


