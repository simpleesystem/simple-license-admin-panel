import Joi from 'joi'
import { useMemo, useRef, useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AppForm } from '../../forms/Form'
import { useNotificationBus } from '../../notifications/busContext'
import { DEFAULT_NOTIFICATION_EVENT } from '../../notifications/constants'
import { UI_AUTH_CARD_MIN_HEIGHT, UI_STACK_GAP_MEDIUM } from '../../ui/constants'
import { TextField } from '../../ui/forms/TextField'
import { Stack } from '../../ui/layout/Stack'
import { useAppConfig } from '../config'
import {
  AUTH_FIELD_PASSWORD,
  AUTH_FIELD_USERNAME,
  AUTH_LOGIN_TOAST_SUCCESS,
  I18N_KEY_AUTH_FORGOT_LINK,
  I18N_KEY_AUTH_SUBMIT,
  I18N_KEY_FORM_PASSWORD_LABEL,
  I18N_KEY_FORM_PASSWORD_REQUIRED,
  I18N_KEY_FORM_USERNAME_LABEL,
  I18N_KEY_FORM_USERNAME_REQUIRED,
  ROUTE_PATH_DASHBOARD,
} from '../constants'
import { mapUnknownToAppError } from '../errors/appErrors'
import { useLogger } from '../logging/loggerContext'
import { useAppStore } from '../state/store'
import { useAuth } from './authContext'

type LoginFormValues = {
  [AUTH_FIELD_USERNAME]: string
  [AUTH_FIELD_PASSWORD]: string
}

const DEFAULT_VALUES: LoginFormValues = {
  [AUTH_FIELD_USERNAME]: '',
  [AUTH_FIELD_PASSWORD]: '',
}

const buildSchema = (t: ReturnType<typeof useTranslation>['t']): Joi.ObjectSchema<LoginFormValues> =>
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

type LoginCardProps = {
  redirectTo?: string
}

export function LoginCard({ redirectTo }: LoginCardProps) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const dispatch = useAppStore((state) => state.dispatch)
  const logger = useLogger()
  const notificationBus = useNotificationBus()
  const { authForgotPasswordUrl = null } = useAppConfig()
  const schema = useMemo(() => buildSchema(t), [t])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inFlightRef = useRef(false)
  const submitLabel = t(I18N_KEY_AUTH_SUBMIT)
  const forgotLabel = t(I18N_KEY_AUTH_FORGOT_LINK)

  const handleSubmit = async (values: LoginFormValues) => {
    const attemptId = Math.random().toString(36).slice(2)
    if (inFlightRef.current) {
      return
    }

    inFlightRef.current = true

    try {
      setIsSubmitting(true)
      dispatch({ type: 'loading/set', scope: 'auth', isLoading: true })
      const safeRedirect =
        redirectTo && redirectTo !== ROUTE_PATH_DASHBOARD && redirectTo !== '/health'
          ? redirectTo
          : ROUTE_PATH_DASHBOARD
      logger.debug('auth:login:submit', { redirectTo: safeRedirect })
      await login(values[AUTH_FIELD_USERNAME], values[AUTH_FIELD_PASSWORD])
      dispatch({
        type: 'nav/intent',
        payload: { to: safeRedirect, replace: true },
      })
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: AUTH_LOGIN_TOAST_SUCCESS,
      })
      logger.info('auth:login:dispatched-nav', { to: safeRedirect })
    } catch (error) {
      const appError = mapUnknownToAppError(error, 'auth')

      logger.error(error, {
        stage: 'auth:login:submit:error',
        code: appError.code,
        type: appError.type,
        status: appError.status,
        requestId: appError.requestId,
        scope: appError.scope,
        attemptId,
      })
    } finally {
      setIsSubmitting(false)
      inFlightRef.current = false
      dispatch({ type: 'loading/set', scope: 'auth', isLoading: false })
    }
  }

  return (
    <Card className="shadow-sm w-100">
      <Card.Body className="d-flex flex-column gap-4 p-4 p-md-5 h-100" style={{ minHeight: UI_AUTH_CARD_MIN_HEIGHT }}>
        <AppForm<LoginFormValues> schema={schema} defaultValues={DEFAULT_VALUES} onSubmit={handleSubmit}>
          <Stack direction="column" gap={UI_STACK_GAP_MEDIUM} className="w-100">
            <TextField<LoginFormValues>
              name={AUTH_FIELD_USERNAME}
              label={t(I18N_KEY_FORM_USERNAME_LABEL)}
              autoComplete="username"
              disabled={isSubmitting}
              required={true}
            />
            <TextField<LoginFormValues>
              name={AUTH_FIELD_PASSWORD}
              label={t(I18N_KEY_FORM_PASSWORD_LABEL)}
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              required={true}
              validateNames={[AUTH_FIELD_USERNAME]}
            />
            <LoginFormActions
              isSubmitting={isSubmitting}
              submitLabel={submitLabel}
              forgotLabel={forgotLabel}
              forgotPasswordUrl={authForgotPasswordUrl}
            />
          </Stack>
        </AppForm>
      </Card.Body>
    </Card>
  )
}

type LoginFormActionsProps = {
  isSubmitting: boolean
  submitLabel: string
  forgotLabel: string
  forgotPasswordUrl: string | null
}

function LoginFormActions({ isSubmitting, submitLabel, forgotLabel, forgotPasswordUrl }: LoginFormActionsProps) {
  const { control } = useFormContext<LoginFormValues>()
  const [username, password] = useWatch({
    control,
    name: [AUTH_FIELD_USERNAME, AUTH_FIELD_PASSWORD],
  })
  const trimmedUsername = (username ?? '').trim()
  const trimmedPassword = (password ?? '').trim()
  const isSubmitDisabled = isSubmitting || trimmedUsername.length === 0 || trimmedPassword.length === 0

  return (
    <div className="d-flex flex-column gap-3">
      <Button variant="primary" type="submit" disabled={isSubmitDisabled} className="w-100">
        {isSubmitting ? `${submitLabel}…` : submitLabel}
      </Button>
      {forgotPasswordUrl ? (
        <div className="text-center">
          <Button
            variant="link"
            className="text-decoration-none p-0"
            href={forgotPasswordUrl}
            target="_blank"
            rel="noreferrer"
          >
            {forgotLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
