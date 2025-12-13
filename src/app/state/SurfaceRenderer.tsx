import { useEffect, useRef } from 'react'
import { useNotificationBus } from '../../notifications/busContext'
import { NOTIFICATION_EVENT_TOAST, NOTIFICATION_VARIANT_ERROR } from '../../app/constants'

import { selectLatestError, useAppStore } from './store'

export function SurfaceRenderer() {
  const error = useAppStore(selectLatestError)
  const lastId = useRef<string | null>(null)
  const notificationBus = useNotificationBus()

  useEffect(() => {
    if (!error) {
      // Dismissal logic would go here if we supported dismissing by ID
      // For now, we rely on auto-hide or user dismissal
      lastId.current = null
      return
    }

    // De-duplicate if same error
    const errorId = error.correlationId ?? error.code
    if (lastId.current === errorId) {
      return
    }

    notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
      titleKey: error.message,
      variant: NOTIFICATION_VARIANT_ERROR,
      id: errorId,
    })
    lastId.current = errorId
  }, [error, notificationBus])

  return null
}
