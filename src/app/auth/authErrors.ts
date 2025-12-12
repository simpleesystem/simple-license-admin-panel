import {
  ApiException,
  ERROR_CODE_ACCOUNT_LOCKED,
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_TOO_MANY_ATTEMPTS,
} from '@simple-license/react-sdk'

import { mapApiException, mapErrorToNotification } from '../../errors/mappers'
import type { ToastNotificationPayload } from '../../notifications/constants'
import { AUTH_ERROR_MESSAGE_KEY, NOTIFICATION_VARIANT_ERROR, NOTIFICATION_VARIANT_WARNING } from '../constants'

const AUTH_WARNING_CODES = new Set([ERROR_CODE_TOO_MANY_ATTEMPTS, ERROR_CODE_ACCOUNT_LOCKED])

export const buildAuthErrorNotification = (error: unknown): ToastNotificationPayload => {
  if (error instanceof ApiException) {
    const code = error.errorCode?.toUpperCase?.()
    if (code === ERROR_CODE_INVALID_CREDENTIALS || code === ERROR_CODE_AUTHENTICATION_ERROR) {
      return {
        id: 'auth-login-error',
        titleKey: AUTH_ERROR_MESSAGE_KEY,
        variant: NOTIFICATION_VARIANT_ERROR,
      }
    }
    if (code && AUTH_WARNING_CODES.has(code)) {
      return {
        id: `auth-warning-${code.toLowerCase()}`,
        titleKey: code,
        variant: NOTIFICATION_VARIANT_WARNING,
      }
    }
    return mapApiException(error)
  }
  return mapErrorToNotification()
}
