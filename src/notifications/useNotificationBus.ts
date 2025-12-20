import { useContext } from 'react'
import { fallbackBus, NotificationBusContext } from './NotificationBusContext'
import type { NotificationBus } from './types'

export const useNotificationBus = (): NotificationBus => {
  const context = useContext(NotificationBusContext)
  if (!context) {
    return fallbackBus
  }
  return context
}
