/**
 * SessionManager - Monitors user activity and manages session timeouts
 * Shows warnings and logs out users after idle periods
 */

import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from './authContext'
import { useNotificationBus } from '@/notifications/busContext'
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

export function SessionManager(): null {
  const { isAuthenticated, logout } = useAuth()
  const notificationBus = useNotificationBus()
  const tracking = useTracking()

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef<number>(0)
  const warningShownRef = useRef<boolean>(false)

  // Initialize lastActivityRef in useEffect to avoid calling Date.now() during render
  useEffect(() => {
    lastActivityRef.current = Date.now()
  }, [])

  const resetTimers = () => {
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
  }

  const setupTimers = useCallback(() => {
    if (!isAuthenticated) {
      return
    }

    resetTimers()

    // Set up warning timer
    warningTimerRef.current = setTimeout(() => {
      if (isAuthenticated && !warningShownRef.current) {
        notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
          titleKey: I18N_KEY_SESSION_WARNING_TITLE,
          variant: 'warning',
        })
        tracking.track(TRACKING_EVENT_SESSION_WARNING)
        warningShownRef.current = true
      }
    }, SESSION_IDLE_WARNING_MS)

    // Set up timeout timer
    timeoutTimerRef.current = setTimeout(() => {
      if (isAuthenticated) {
        notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
          titleKey: I18N_KEY_SESSION_EXPIRED_TITLE,
          variant: 'error',
        })
        tracking.track(TRACKING_EVENT_SESSION_TIMEOUT)
        logout()
      }
    }, SESSION_IDLE_TIMEOUT_MS)
  }, [isAuthenticated, logout, notificationBus, tracking])

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
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      resetTimers()
    }
  }, [isAuthenticated, logout, notificationBus, tracking, setupTimers])

  return null
}

