import { useMemo, useState } from 'react'
import { Card, Button } from 'react-bootstrap'
import Joi from 'joi'
import { useTranslation } from 'react-i18next'
import { ApiException } from '@simple-license/react-sdk'

import { AppForm } from '../../forms/Form'
import { TextField } from '../../ui/forms/TextField'
import { FormActions } from '../../ui/forms/FormActions'
import { Stack } from '../../ui/layout/Stack'
import { UI_STACK_GAP_MEDIUM } from '../../ui/constants'
import { InlineAlert } from '../../ui/feedback/InlineAlert'
import {
  AUTH_FIELD_PASSWORD,
  AUTH_FIELD_USERNAME,
  AUTH_FORGOT_PASSWORD_URL,
  I18N_KEY_AUTH_FORGOT_LINK,
  I18N_KEY_AUTH_GENERIC_ERROR,
  I18N_KEY_AUTH_HEADING,
  I18N_KEY_AUTH_SUBMIT,
  I18N_KEY_AUTH_SUBTITLE,
  I18N_KEY_FORM_PASSWORD_LABEL,
  I18N_KEY_FORM_PASSWORD_REQUIRED,
  I18N_KEY_FORM_USERNAME_LABEL,
  I18N_KEY_FORM_USERNAME_REQUIRED,
  NOTIFICATION_EVENT_TOAST,
} from '../constants'
import { useAuth } from './authContext'
import { useNotificationBus } from '../../notifications/busContext'
import { mapApiException, mapErrorToNotification } from '../../errors/mappers'
import type { ToastNotificationPayload } from '../../notifications/constants'
import type { NotificationBus } from '../../notifications/types'

type LoginFormValues = {
  [AUTH_FIELD_USERNAME]: string
  [AUTH_FIELD_PASSWORD]: string
}

const DEFAULT_VALUES: LoginFormValues = {
  [AUTH_FIELD_USERNAME]: '',
  [AUTH_FIELD_PASSWORD]: '',
}

const buildSchema = (
  t: ReturnType<typeof useTranslation>['t'],
): Joi.ObjectSchema<LoginFormValues> =>
  Joi.object<LoginFormValues>({
    [AUTH_FIELD_USERNAME]: Joi.string()
      .trim()
      .required()
      .messages({
        'string.empty': t(I18N_KEY_FORM_USERNAME_REQUIRED),
        'any.required': t(I18N_KEY_FORM_USERNAME_REQUIRED),
      }),
    [AUTH_FIELD_PASSWORD]: Joi.string()
      .required()
      .messages({
        'string.empty': t(I18N_KEY_FORM_PASSWORD_REQUIRED),
        'any.required': t(I18N_KEY_FORM_PASSWORD_REQUIRED),
      }),
  })

export function LoginCard() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const notificationBus = useNotificationBus()
  const schema = useMemo(() => buildSchema(t), [t])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitError(null)
      setIsSubmitting(true)
      await login(values[AUTH_FIELD_USERNAME], values[AUTH_FIELD_PASSWORD])
    } catch (error) {
      const fallbackMessage = t(I18N_KEY_AUTH_GENERIC_ERROR)
      const message = error instanceof Error && error.message ? error.message : fallbackMessage
      setSubmitError(message)
      emitToast(notificationBus, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Body className="d-flex flex-column gap-4">
        <div className="d-flex flex-column gap-1">
          <h1 className="h4 mb-0">{t(I18N_KEY_AUTH_HEADING)}</h1>
          <p className="text-muted mb-0">{t(I18N_KEY_AUTH_SUBTITLE)}</p>
        </div>

        {submitError ? (
          <InlineAlert variant="danger" title={t(I18N_KEY_AUTH_GENERIC_ERROR)}>
            {submitError}
          </InlineAlert>
        ) : null}

        <AppForm<LoginFormValues> schema={schema} defaultValues={DEFAULT_VALUES} onSubmit={handleSubmit}>
          <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
            <TextField<LoginFormValues>
              name={AUTH_FIELD_USERNAME}
              label={t(I18N_KEY_FORM_USERNAME_LABEL)}
              autoComplete="username"
              disabled={isSubmitting}
              required
            />
            <TextField<LoginFormValues>
              name={AUTH_FIELD_PASSWORD}
              label={t(I18N_KEY_FORM_PASSWORD_LABEL)}
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
            <FormActions align="between">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? `${t(I18N_KEY_AUTH_SUBMIT)}…` : t(I18N_KEY_AUTH_SUBMIT)}
              </Button>
              <Button
                variant="link"
                className="text-decoration-none"
                href={AUTH_FORGOT_PASSWORD_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t(I18N_KEY_AUTH_FORGOT_LINK)}
              </Button>
            </FormActions>
          </Stack>
        </AppForm>
      </Card.Body>
    </Card>
  )
}

const emitToast = (bus: NotificationBus, error: unknown) => {
  const payload: ToastNotificationPayload =
    error instanceof ApiException ? mapApiException(error) : mapErrorToNotification()
  bus.emit(NOTIFICATION_EVENT_TOAST, payload)
}

