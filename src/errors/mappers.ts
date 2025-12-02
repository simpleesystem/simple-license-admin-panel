import type { ApiException } from '@simple-license/react-sdk'

import {
  I18N_KEY_APP_ERROR_MESSAGE,
  I18N_KEY_APP_ERROR_TITLE,
  NOTIFICATION_VARIANT_ERROR,
} from '../app/constants'
import type { ToastNotificationPayload } from '../notifications/constants'

export const mapErrorToNotification = (): ToastNotificationPayload => ({
  titleKey: I18N_KEY_APP_ERROR_TITLE,
  descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
  variant: NOTIFICATION_VARIANT_ERROR,
})

export const mapApiException = (error: ApiException): ToastNotificationPayload => ({
  titleKey: error.errorCode || I18N_KEY_APP_ERROR_TITLE,
  descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
  variant: NOTIFICATION_VARIANT_ERROR,
})

