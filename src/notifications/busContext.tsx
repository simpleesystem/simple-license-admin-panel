import { createContext, useContext } from 'react'

import { ERROR_MESSAGE_NOTIFICATION_CONTEXT_UNAVAILABLE } from '../app/constants'
import type { NotificationBus } from './types'

export const NotificationBusContext = createContext<NotificationBus | null>(null)

export const useNotificationBus = (): NotificationBus => {
  const context = useContext(NotificationBusContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_NOTIFICATION_CONTEXT_UNAVAILABLE)
  }
  return context
}

