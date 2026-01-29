/**
 * SessionManager - Monitors user activity and manages session timeouts
 * Shows warnings and logs out users after idle periods
 */

import { useCallback, useEffect, useRef } from 'react'
import { useTracking } from '@/app/analytics/trackingContext'
import {
  I18N_KEY_SESSION_EXPIRED_TITLE,
  I18N_KEY_SESSION_WARNING_TITLE,
  NOTIFICATION_EVENT_TOAST,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_IDLE_WARNING_MS,
  TRACKING_EVENT_SESSION_TIMEOUT,
  TRACKING_EVENT_SESSION_WARNING,
} from '@/app/constants'
import { useNotificationBus } from '@/notifications/useNotificationBus'
import { useAuth } from './useAuth'

export function SessionManager(): null {
  const { isAuthenticated, logout } = useAuth()
  const notificationBus = useNotificationBus()
  const tracking = useTracking()

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef<number>(0)
  const warningShownRef = useRef<boolean>(false)
  const isAuthenticatedRef = useRef(isAuthenticated)

  // Keep ref in sync after render; never update ref during render (react-hooks/refs)
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  // Initialize lastActivityRef in useEffect to avoid calling Date.now() during render
  useEffect(() => {
    lastActivityRef.current = Date.now()
  }, [])

  const resetTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
    lastActivityRef.current = Date.now()
    warningShownRef.current = false
  }, [])

  const setupTimers = useCallback(() => {
    if (!isAuthenticated) {
      return
    }

    resetTimers()

    // Set up warning timer - use ref inside callback to avoid stale closure
    warningTimerRef.current = setTimeout(() => {
      if (isAuthenticatedRef.current && !warningShownRef.current) {
        notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
          titleKey: I18N_KEY_SESSION_WARNING_TITLE,
          variant: 'warning',
        })
        tracking.track(TRACKING_EVENT_SESSION_WARNING)
        warningShownRef.current = true
      }
    }, SESSION_IDLE_WARNING_MS)

    // Set up timeout timer - use ref inside callback to avoid stale closure
    timeoutTimerRef.current = setTimeout(() => {
      if (isAuthenticatedRef.current) {
        notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
          titleKey: I18N_KEY_SESSION_EXPIRED_TITLE,
          variant: 'error',
        })
        tracking.track(TRACKING_EVENT_SESSION_TIMEOUT)
        logout()
      }
    }, SESSION_IDLE_TIMEOUT_MS)
  }, [isAuthenticated, logout, notificationBus, tracking, resetTimers])

  useEffect(() => {
    if (!isAuthenticated) {
      resetTimers()
      return
    }

    setupTimers()

    const handleActivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current
      // Only reset if significant time has passed (avoid resetting on every tiny movement)
      if (timeSinceLastActivity > 1000) {
        setupTimers()
      }
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true })
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, handleActivity)
      }
      resetTimers()
    }
  }, [isAuthenticated, resetTimers, setupTimers])

  return null
}
