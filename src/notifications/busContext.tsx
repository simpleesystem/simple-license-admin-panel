import { useMemo } from 'react'
import { fallbackBus, NotificationBusContext } from './NotificationBusContext'
import type { NotificationBus } from './types'

export const NotificationBusProvider = ({ bus, children }: { bus?: NotificationBus; children: React.ReactNode }) => {
  const value = useMemo(() => bus ?? fallbackBus, [bus])
  return <NotificationBusContext.Provider value={value}>{children}</NotificationBusContext.Provider>
}
