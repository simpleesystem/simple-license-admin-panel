import { createContext, useContext, useMemo } from 'react'

import type { NotificationBus } from './types'

const createNoopBus = (): NotificationBus => ({
  all: undefined as never,
  on: () => {},
  off: () => {},
  emit: () => {},
})

const fallbackBus = createNoopBus()

export const NotificationBusContext = createContext<NotificationBus | null>(null)

export const useNotificationBus = (): NotificationBus => {
  const context = useContext(NotificationBusContext)
  if (!context) {
    return fallbackBus
  }
  return context
}

export const NotificationBusProvider = ({ bus, children }: { bus?: NotificationBus; children: React.ReactNode }) => {
  const value = useMemo(() => bus ?? fallbackBus, [bus])
  return <NotificationBusContext.Provider value={value}>{children}</NotificationBusContext.Provider>
}
