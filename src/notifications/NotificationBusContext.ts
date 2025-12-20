import { createContext } from 'react'
import type { NotificationBus } from './types'

export const createNoopBus = (): NotificationBus => ({
  all: undefined as never,
  on: () => {},
  off: () => {},
  emit: () => {},
})

export const fallbackBus = createNoopBus()

export const NotificationBusContext = createContext<NotificationBus | null>(null)
