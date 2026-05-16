import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import { useTranslation } from 'react-i18next'

import {
  NOTIFICATION_EVENT_TOAST,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_SUCCESS,
  NOTIFICATION_VARIANT_WARNING,
  TEST_ID_NOTIFICATION_PORTAL,
} from '../app/constants'
import type { NotificationVariant } from './constants'
import { DEFAULT_NOTIFICATION_DURATION, NOTIFICATION_ALERT_MAX_WIDTH, type ToastNotificationPayload } from './constants'
import { useNotificationBus } from './useNotificationBus'

type ToastItem = ToastNotificationPayload & {
  key: string
}

const getVariantStyle = (variant?: NotificationVariant): 'success' | 'danger' | 'warning' | 'info' => {
  switch (variant) {
    case NOTIFICATION_VARIANT_SUCCESS:
      return 'success'
    case NOTIFICATION_VARIANT_ERROR:
      return 'danger'
    case NOTIFICATION_VARIANT_WARNING:
      return 'warning'
    default:
      return 'info'
  }
}

const formatToastContent = (value: unknown, fallback?: () => string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }
  if (fallback) {
    const fb = fallback()
    return typeof fb === 'string' && fb.trim().length > 0 ? fb : ''
  }
  return ''
}

export function NotificationBannerProvider() {
  const bus = useNotificationBus()
  const { t } = useTranslation()
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearRemovalTimer = useCallback((key: string) => {
    const timerId = timeoutMapRef.current.get(key)
    if (!timerId) {
      return
    }
    clearTimeout(timerId)
    timeoutMapRef.current.delete(key)
  }, [])

  const removeToast = useCallback(
    (key: string) => {
      clearRemovalTimer(key)
      setToasts((prev) => prev.filter((item) => item.key !== key))
    },
    [clearRemovalTimer]
  )

  const scheduleRemoval = useCallback(
    (key: string, delayMs: number) => {
      clearRemovalTimer(key)
      const timerId = setTimeout(() => {
        removeToast(key)
      }, delayMs)
      timeoutMapRef.current.set(key, timerId)
    },
    [clearRemovalTimer, removeToast]
  )

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
        return [...prev, { ...payload, key }]
      })

      scheduleRemoval(key, DEFAULT_NOTIFICATION_DURATION)
    }

    bus.on(NOTIFICATION_EVENT_TOAST, handler)

    return () => {
      bus.off(NOTIFICATION_EVENT_TOAST, handler)
      for (const timerId of timeoutMapRef.current.values()) {
        clearTimeout(timerId)
      }
      timeoutMapRef.current.clear()
    }
  }, [bus, scheduleRemoval])

  const bannerContainerClass = useMemo(() => 'px-3 py-2 border-top bg-body-tertiary', [])

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      data-testid={TEST_ID_NOTIFICATION_PORTAL}
      aria-live="polite"
      aria-atomic="true"
      className={bannerContainerClass}
    >
      <div className="d-flex flex-column gap-2">
        {toasts.map((toast) => {
          const title = formatToastContent(toast.message, () => t(toast.titleKey))
          const description = toast.descriptionKey ? formatToastContent(t(toast.descriptionKey)) : ''
          return (
            <Alert
              key={toast.key}
              variant={getVariantStyle(toast.variant)}
              dismissible={true}
              onClose={() => removeToast(toast.key)}
              className="mb-0"
              style={{ maxWidth: NOTIFICATION_ALERT_MAX_WIDTH, width: '100%' }}
            >
              <div className="fw-semibold">{title}</div>
              {description ? <div className="small mt-1">{description}</div> : null}
            </Alert>
          )
        })}
      </div>
    </div>
  )
}
