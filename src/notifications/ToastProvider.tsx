import { useEffect, useRef } from 'react'
import type { ToastOptions } from 'react-hot-toast'
import { Toaster, toast, useToasterStore } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import {
  NOTIFICATION_EVENT_TOAST,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_SUCCESS,
  NOTIFICATION_VARIANT_WARNING,
  TEST_ID_NOTIFICATION_PORTAL,
} from '../app/constants'
import { useNotificationBus } from './busContext'
import type { NotificationVariant } from './constants'
import {
  DEFAULT_NOTIFICATION_DURATION,
  DEFAULT_NOTIFICATION_POSITION,
  DEFAULT_NOTIFICATION_VARIANT,
  type ToastNotificationPayload,
} from './constants'

const showToastByVariant = (variant: NotificationVariant, message: string, options: Partial<ToastOptions>) => {
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
  const handlerRef = useRef<((payload: ToastNotificationPayload) => void) | null>(null)
  const handlerIdRef = useRef<string | null>(null)
  const { toasts } = useToasterStore()

  useEffect(() => {
    // Only subscribe one handler (singleton pattern for React Strict Mode/HMR)
    if (handlerRef.current) {
      return undefined
    }

    const handlerId = 'toast-handler-singleton'
    handlerIdRef.current = handlerId

    const handler = (payload: ToastNotificationPayload) => {
      // Explicit de-duplication: check if a toast with this ID is already visible
      if (payload.id) {
        const isDuplicate = toasts.some((t) => t.id === payload.id && t.visible)
        if (isDuplicate) {
          return
        }
      }

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

    handlerRef.current = handler
    bus.on(NOTIFICATION_EVENT_TOAST, handler)

    return () => {
      if (handlerRef.current) {
        bus.off(NOTIFICATION_EVENT_TOAST, handlerRef.current)
        handlerRef.current = null
        handlerIdRef.current = null
      }
    }
  }, [bus, t, toasts])

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
