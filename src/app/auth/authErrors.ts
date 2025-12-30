/**
 * Auth Error Utilities
 * Maps authentication errors to user-friendly notification payloads
 */

import {
  ApiException,
  ERROR_CODE_ACCOUNT_LOCKED,
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_TOO_MANY_ATTEMPTS,
} from '@/simpleLicense'
import {
  AUTH_ERROR_MESSAGE_KEY,
  I18N_KEY_APP_ERROR_TITLE,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_WARNING,
} from '@/app/constants'

export interface AuthErrorNotification {
  titleKey: string
  variant: typeof NOTIFICATION_VARIANT_ERROR | typeof NOTIFICATION_VARIANT_WARNING
}

/**
 * Builds a notification payload from an authentication error
 */
export function buildAuthErrorNotification(error: unknown): AuthErrorNotification {
  if (error instanceof ApiException) {
    const errorCode = error.errorCode

    // Map specific error codes to notification variants
    if (errorCode === ERROR_CODE_INVALID_CREDENTIALS || errorCode === ERROR_CODE_AUTHENTICATION_ERROR) {
      return {
        titleKey: AUTH_ERROR_MESSAGE_KEY,
        variant: NOTIFICATION_VARIANT_ERROR,
      }
    }

    if (errorCode === ERROR_CODE_ACCOUNT_LOCKED || errorCode === ERROR_CODE_TOO_MANY_ATTEMPTS) {
      return {
        titleKey: errorCode,
        variant: NOTIFICATION_VARIANT_WARNING,
      }
    }
  }

  // Fallback for non-API errors or unknown error codes
  return {
    titleKey: I18N_KEY_APP_ERROR_TITLE,
    variant: NOTIFICATION_VARIANT_ERROR,
  }
}
