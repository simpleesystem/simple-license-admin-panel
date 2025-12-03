import type { ApiException } from '@simple-license/react-sdk'

import { I18N_KEY_APP_ERROR_MESSAGE, I18N_KEY_APP_ERROR_TITLE, NOTIFICATION_VARIANT_ERROR } from '../app/constants'
import type { NotificationVariant, ToastNotificationPayload } from '../notifications/constants'

export type AppErrorDescriptor = {
  titleKey: string
  descriptionKey?: string
  variant: NotificationVariant
}

export const mapErrorToDescriptor = (): AppErrorDescriptor => ({
  titleKey: I18N_KEY_APP_ERROR_TITLE,
  descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
  variant: NOTIFICATION_VARIANT_ERROR,
})

export const mapApiExceptionToDescriptor = (error: ApiException): AppErrorDescriptor => ({
  titleKey: error.errorCode || I18N_KEY_APP_ERROR_TITLE,
  descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
  variant: NOTIFICATION_VARIANT_ERROR,
})

export const convertDescriptorToToastPayload = (descriptor: AppErrorDescriptor): ToastNotificationPayload => ({
  titleKey: descriptor.titleKey,
  descriptionKey: descriptor.descriptionKey,
  variant: descriptor.variant,
})

export const mapApiException = (error: ApiException): ToastNotificationPayload => {
  return convertDescriptorToToastPayload(mapApiExceptionToDescriptor(error))
}

export const mapErrorToNotification = (): ToastNotificationPayload => {
  return convertDescriptorToToastPayload(mapErrorToDescriptor())
}
