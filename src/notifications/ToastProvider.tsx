import { useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import type { ToastOptions } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import {
  NOTIFICATION_EVENT_TOAST,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_SUCCESS,
  NOTIFICATION_VARIANT_WARNING,
  TEST_ID_NOTIFICATION_PORTAL,
} from '../app/constants'
import type { NotificationVariant } from './constants'
import {
  DEFAULT_NOTIFICATION_DURATION,
  DEFAULT_NOTIFICATION_POSITION,
  DEFAULT_NOTIFICATION_VARIANT,
  type ToastNotificationPayload,
} from './constants'
import { useNotificationBus } from './busContext'

const showToastByVariant = (
  variant: NotificationVariant,
  message: string,
  options: Partial<ToastOptions>,
) => {
  switch (variant) {
    case NOTIFICATION_VARIANT_SUCCESS:
      toast.success(message, options)
      return
    case NOTIFICATION_VARIANT_ERROR:
      toast.error(message, options)
      return
    case NOTIFICATION_VARIANT_WARNING:
      toast(message, options)
      return
    default:
      toast(message, options)
  }
}

export function ToastProvider() {
  const bus = useNotificationBus()
  const { t } = useTranslation()

  useEffect(() => {
    const handler = (payload: ToastNotificationPayload) => {
      const variant = payload.variant ?? DEFAULT_NOTIFICATION_VARIANT
      const title = t(payload.titleKey)
      const description = payload.descriptionKey ? t(payload.descriptionKey) : ''
      const renderedMessage = description ? `${title} - ${description}` : title

      showToastByVariant(variant, renderedMessage, {
        id: payload.id,
        duration: DEFAULT_NOTIFICATION_DURATION,
        position: DEFAULT_NOTIFICATION_POSITION,
      })
    }

    bus.on(NOTIFICATION_EVENT_TOAST, handler)

    return () => {
      bus.off(NOTIFICATION_EVENT_TOAST, handler)
    }
  }, [bus, t])

  return (
    <div data-testid={TEST_ID_NOTIFICATION_PORTAL}>
      <Toaster
        position={DEFAULT_NOTIFICATION_POSITION}
        toastOptions={{
          duration: DEFAULT_NOTIFICATION_DURATION,
        }}
      />
    </div>
  )
}

