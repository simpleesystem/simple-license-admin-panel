import { useCallback, useEffect, useState } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'
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
  type ToastNotificationPayload,
} from './constants'
import { useNotificationBus } from './useNotificationBus'

type ToastItem = ToastNotificationPayload & {
  key: string
  visible: boolean
}

const getVariantStyle = (variant?: NotificationVariant) => {
  switch (variant) {
    case NOTIFICATION_VARIANT_SUCCESS:
      return 'success'
    case NOTIFICATION_VARIANT_ERROR:
      return 'danger'
    case NOTIFICATION_VARIANT_WARNING:
      return 'warning'
    default:
      return 'light'
  }
}

const getVariantHeaderClass = (variant?: NotificationVariant) => {
  switch (variant) {
    case NOTIFICATION_VARIANT_SUCCESS:
      return 'text-success'
    case NOTIFICATION_VARIANT_ERROR:
      return 'text-danger'
    case NOTIFICATION_VARIANT_WARNING:
      return 'text-warning'
    default:
      return ''
  }
}

export function ToastProvider() {
  const bus = useNotificationBus()
  const { t } = useTranslation()
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (payload: ToastNotificationPayload) => {
      const key = payload.id || Math.random().toString(36).slice(2)

      setToasts((prev) => {
        // Strict de-duplication by content/id if provided, or avoid stacking identical messages
        // If an ID is provided, check if it exists
        if (payload.id) {
          const exists = prev.some((item) => item.id === payload.id)
          if (exists) {
            return prev
          }
        }

        // Add new toast
        return [...prev, { ...payload, key, visible: true }]
      })
    }

    bus.on(NOTIFICATION_EVENT_TOAST, handler)

    return () => {
      bus.off(NOTIFICATION_EVENT_TOAST, handler)
    }
  }, [bus])

  const removeToast = useCallback((key: string) => {
    setToasts((prev) => prev.filter((item) => item.key !== key))
  }, [])

  // Map position constant to Bootstrap ToastContainer position
  // 'bottom-right' -> 'bottom-end'
  // 'top-right' -> 'top-end', etc.
  // Assuming DEFAULT_NOTIFICATION_POSITION is 'bottom-right' or similar
  const positionMap: Record<
    string,
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'middle-start'
    | 'middle-center'
    | 'middle-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end'
  > = {
    'top-left': 'top-start',
    'top-center': 'top-center',
    'top-right': 'top-end',
    'bottom-left': 'bottom-start',
    'bottom-center': 'bottom-center',
    'bottom-right': 'bottom-end',
  }

  const bsPosition = positionMap[DEFAULT_NOTIFICATION_POSITION] || 'bottom-end'

  return (
    <div data-testid={TEST_ID_NOTIFICATION_PORTAL} aria-live="polite" aria-atomic="true" className="position-relative">
      <ToastContainer className="p-3" position={bsPosition} style={{ zIndex: 1090, position: 'fixed' }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.key}
            onClose={() => removeToast(toast.key)}
            show={toast.visible}
            delay={DEFAULT_NOTIFICATION_DURATION}
            autohide={true}
            bg={getVariantStyle(toast.variant) === 'light' ? 'light' : undefined}
          >
            <Toast.Header>
              <strong className={`me-auto ${getVariantHeaderClass(toast.variant)}`}>
                {typeof toast.message === 'string' ? toast.message : t(toast.titleKey)}
              </strong>
            </Toast.Header>
            {toast.descriptionKey ? (
              <Toast.Body className={getVariantStyle(toast.variant) !== 'light' ? 'text-white' : ''}>
                {t(toast.descriptionKey)}
              </Toast.Body>
            ) : null}
          </Toast>
        ))}
      </ToastContainer>
    </div>
  )
}
