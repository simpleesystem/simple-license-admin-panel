import {
  ApiException,
  ERROR_CODE_ACCOUNT_LOCKED,
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_TOO_MANY_ATTEMPTS,
} from '@simple-license/react-sdk'
import { describe, expect, it } from 'vitest'
import { buildAuthErrorNotification } from '@/app/auth/authErrors'
import {
  AUTH_ERROR_MESSAGE_KEY,
  I18N_KEY_APP_ERROR_TITLE,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_WARNING,
} from '@/app/constants'

describe('buildAuthErrorNotification', () => {
  it('maps invalid credentials to the auth error message key', () => {
    const error = new ApiException('invalid', ERROR_CODE_INVALID_CREDENTIALS)

    const payload = buildAuthErrorNotification(error)

    expect(payload).toEqual({
      titleKey: AUTH_ERROR_MESSAGE_KEY,
      variant: NOTIFICATION_VARIANT_ERROR,
    })
  })

  it('maps authentication errors to the auth error message key', () => {
    const error = new ApiException('auth', ERROR_CODE_AUTHENTICATION_ERROR)

    const payload = buildAuthErrorNotification(error)

    expect(payload).toEqual({
      titleKey: AUTH_ERROR_MESSAGE_KEY,
      variant: NOTIFICATION_VARIANT_ERROR,
    })
  })

  it('maps account lockout to a warning notification', () => {
    const error = new ApiException('locked', ERROR_CODE_ACCOUNT_LOCKED)

    const payload = buildAuthErrorNotification(error)

    expect(payload).toEqual({
      titleKey: ERROR_CODE_ACCOUNT_LOCKED,
      variant: NOTIFICATION_VARIANT_WARNING,
    })
  })

  it('maps too many attempts to a warning notification', () => {
    const error = new ApiException('rate', ERROR_CODE_TOO_MANY_ATTEMPTS)

    const payload = buildAuthErrorNotification(error)

    expect(payload).toEqual({
      titleKey: ERROR_CODE_TOO_MANY_ATTEMPTS,
      variant: NOTIFICATION_VARIANT_WARNING,
    })
  })

  it('falls back to generic notifications for non-API errors', () => {
    const payload = buildAuthErrorNotification(new Error('boom'))

    expect(payload.titleKey).toBe(I18N_KEY_APP_ERROR_TITLE)
    expect(payload.variant).toBe(NOTIFICATION_VARIANT_ERROR)
  })
})
