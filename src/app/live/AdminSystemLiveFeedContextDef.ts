import { createContext } from 'react'
import { ADMIN_SYSTEM_WS_STATUS_DISCONNECTED } from '../constants'
import type { AdminSystemWsConnectionStatus, AdminSystemWsHealthUpdate } from './adminSystemWsProtocol'

export type AdminSystemLiveState = {
  connectionStatus: AdminSystemWsConnectionStatus
  lastHealthUpdate: AdminSystemWsHealthUpdate | null
  lastError: string | null
}

export type AdminSystemLiveContextValue = {
  state: AdminSystemLiveState
  requestHealth: () => void
}

export const initialState: AdminSystemLiveState = {
  connectionStatus: ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
  lastHealthUpdate: null,
  lastError: null,
}

export const AdminSystemLiveFeedContext = createContext<AdminSystemLiveContextValue | null>(null)
