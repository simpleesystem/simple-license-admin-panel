import { useCallback, useEffect, useRef } from 'react'

import {
  I18N_KEY_SESSION_EXPIRED_BODY,
  I18N_KEY_SESSION_EXPIRED_TITLE,
  I18N_KEY_SESSION_WARNING_BODY,
  I18N_KEY_SESSION_WARNING_TITLE,
  NOTIFICATION_EVENT_TOAST,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_WARNING,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_IDLE_WARNING_MS,
  TRACKING_EVENT_SESSION_TIMEOUT,
  TRACKING_EVENT_SESSION_WARNING,
} from '../../app/constants'
import { useAuth } from './authContext'
import { useNotificationBus } from '../../notifications/busContext'
import type { NotificationEventMap } from '../../notifications/types'
import { useTracking } from '../analytics/trackingContext'

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'click', 'scroll']

export const SessionManager = () => {
  const { isAuthenticated, logout } = useAuth()
  const bus = useNotificationBus()
  const tracking = useTracking()
  const warningTimerRef = useRef<number | null>(null)
  const timeoutTimerRef = useRef<number | null>(null)
  const warningShownRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      window.clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (timeoutTimerRef.current) {
      window.clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
  }, [])

  const publishToast = useCallback(
    (payload: NotificationEventMap[typeof NOTIFICATION_EVENT_TOAST]) => {
      bus.emit(NOTIFICATION_EVENT_TOAST, payload)
    },
    [bus],
  )

  const scheduleTimers = useCallback(() => {
    clearTimers()
    warningTimerRef.current = window.setTimeout(() => {
      if (warningShownRef.current) {
        return
      }
      warningShownRef.current = true
      tracking.track(TRACKING_EVENT_SESSION_WARNING)
      publishToast({
        titleKey: I18N_KEY_SESSION_WARNING_TITLE,
        descriptionKey: I18N_KEY_SESSION_WARNING_BODY,
        variant: NOTIFICATION_VARIANT_WARNING,
      })
    }, SESSION_IDLE_WARNING_MS)

    timeoutTimerRef.current = window.setTimeout(() => {
      publishToast({
        titleKey: I18N_KEY_SESSION_EXPIRED_TITLE,
        descriptionKey: I18N_KEY_SESSION_EXPIRED_BODY,
        variant: NOTIFICATION_VARIANT_ERROR,
      })
      tracking.track(TRACKING_EVENT_SESSION_TIMEOUT)
      logout()
    }, SESSION_IDLE_TIMEOUT_MS)
  }, [clearTimers, logout, publishToast, tracking])

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers()
      return
    }

    const handleActivity = () => {
      warningShownRef.current = false
      scheduleTimers()
    }

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true })
    })
    document.addEventListener('visibilitychange', handleActivity)
    scheduleTimers()

    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleActivity)
    }
  }, [clearTimers, isAuthenticated, scheduleTimers])

  return null
}


