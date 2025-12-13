import { useQueryClient } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { QUERY_KEYS } from '../../../packages/react-sdk/src/hooks/queryKeys'
import type { HealthMetricsResponse, MetricsResponse } from '../../../packages/react-sdk/src/types/api'
import {
  UI_BADGE_VARIANT_DANGER,
  UI_BADGE_VARIANT_INFO,
  UI_BADGE_VARIANT_SECONDARY,
  UI_BADGE_VARIANT_SUCCESS,
  UI_LIVE_STATUS_CONNECTED,
  UI_LIVE_STATUS_CONNECTING,
  UI_LIVE_STATUS_DISCONNECTED,
  UI_LIVE_STATUS_ERROR,
} from '../../ui/constants'
import { useAppConfig } from '../config'
import {
  ADMIN_SYSTEM_WS_ERROR_CONTEXT_UNAVAILABLE,
  ADMIN_SYSTEM_WS_HEALTH_PATH,
  ADMIN_SYSTEM_WS_STATUS_CONNECTED,
  ADMIN_SYSTEM_WS_STATUS_CONNECTING,
  ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
  ADMIN_SYSTEM_WS_STATUS_ERROR,
} from '../constants'
import { createLifecycle } from '../lifecycle/lifecycle'
import AdminSystemWsClient from './AdminSystemWsClient'
import type { AdminSystemWsConnectionStatus, AdminSystemWsHealthUpdate } from './adminSystemWsProtocol'

type LiveAction =
  | { type: 'live/wsConnecting' }
  | { type: 'live/wsConnected' }
  | { type: 'live/wsDisconnected' }
  | { type: 'live/wsError'; payload?: string }
  | { type: 'live/healthUpdate'; payload: AdminSystemWsHealthUpdate }

type AdminSystemLiveState = {
  connectionStatus: AdminSystemWsConnectionStatus
  lastHealthUpdate: AdminSystemWsHealthUpdate | null
  lastError: string | null
}

type AdminSystemLiveContextValue = {
  state: AdminSystemLiveState
  requestHealth: () => void
}

const initialState: AdminSystemLiveState = {
  connectionStatus: ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
  lastHealthUpdate: null,
  lastError: null,
}

export const AdminSystemLiveFeedContext = createContext<AdminSystemLiveContextValue | null>(null)

const liveReducer = (state: AdminSystemLiveState, action: LiveAction): AdminSystemLiveState => {
  switch (action.type) {
    case 'live/wsConnecting':
      return { ...state, connectionStatus: ADMIN_SYSTEM_WS_STATUS_CONNECTING, lastError: null }
    case 'live/wsConnected':
      return { ...state, connectionStatus: ADMIN_SYSTEM_WS_STATUS_CONNECTED, lastError: null }
    case 'live/wsDisconnected':
      return { ...state, connectionStatus: ADMIN_SYSTEM_WS_STATUS_DISCONNECTED }
    case 'live/wsError':
      return { ...state, connectionStatus: ADMIN_SYSTEM_WS_STATUS_ERROR, lastError: action.payload ?? null }
    case 'live/healthUpdate':
      return { ...state, lastHealthUpdate: action.payload, lastError: null }
    default:
      return state
  }
}

const buildWebSocketUrl = (apiBaseUrl: string): string => {
  const base = new URL(apiBaseUrl)
  const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${base.host}${ADMIN_SYSTEM_WS_HEALTH_PATH}`
}

const patchHealthMetricsCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  update: AdminSystemWsHealthUpdate
): void => {
  queryClient.setQueryData<HealthMetricsResponse | undefined>(QUERY_KEYS.adminSystem.health(), (current) => {
    if (!current) {
      return current
    }
    // Safety check for metrics and memory objects
    const currentMetrics = current.metrics || {}
    const currentMemory = currentMetrics.memory || {}

    return {
      ...current,
      metrics: {
        ...currentMetrics,
        uptime: update.data.system.uptime,
        memory: {
          ...currentMemory,
          heapTotal: update.data.system.memory.heap_total,
          heapUsed: update.data.system.memory.heap_used,
        },
      },
    } as HealthMetricsResponse
  })
}

const patchSystemMetricsCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  update: AdminSystemWsHealthUpdate
): void => {
  queryClient.setQueryData<MetricsResponse | undefined>(QUERY_KEYS.adminSystem.metrics(), (current) => {
    if (!current) {
      return current
    }
    // Safety check for system and memory objects
    const currentSystem = current.system || {}
    const currentMemory = currentSystem.memory || {}

    return {
      ...current,
      system: {
        ...currentSystem,
        uptime: update.data.system.uptime,
        memory: {
          ...currentMemory,
          heapTotal: update.data.system.memory.heap_total,
          heapUsed: update.data.system.memory.heap_used,
        },
      },
    } as MetricsResponse
  })
}

export function AdminSystemLiveFeedProvider({ children }: PropsWithChildren) {
  const { apiBaseUrl } = useAppConfig()
  const queryClient = useQueryClient()
  const [state, dispatch] = useReducer(liveReducer, initialState)
  const clientRef = useRef<AdminSystemWsClient | null>(null)
  const lifecycleRef = useRef(createLifecycle())

  const wsUrl = useMemo(() => buildWebSocketUrl(apiBaseUrl), [apiBaseUrl])

  useEffect(() => {
    lifecycleRef.current.dispose()
    lifecycleRef.current = createLifecycle()
    const lifecycle = lifecycleRef.current

    const client = new AdminSystemWsClient(wsUrl)
    clientRef.current = client

    const unsubscribes = [
      client.subscribe('status', ({ status, error }) => {
        if (status === ADMIN_SYSTEM_WS_STATUS_CONNECTING) {
          dispatch({ type: 'live/wsConnecting' })
          return
        }
        if (status === ADMIN_SYSTEM_WS_STATUS_CONNECTED) {
          dispatch({ type: 'live/wsConnected' })
          return
        }
        if (status === ADMIN_SYSTEM_WS_STATUS_DISCONNECTED) {
          dispatch({ type: 'live/wsDisconnected' })
          return
        }
        dispatch({ type: 'live/wsError', payload: error })
      }),
      client.subscribe('healthUpdate', (payload) => {
        dispatch({ type: 'live/healthUpdate', payload })
        patchHealthMetricsCache(queryClient, payload)
        patchSystemMetricsCache(queryClient, payload)
      }),
      client.subscribe('serverError', ({ message }) => {
        dispatch({ type: 'live/wsError', payload: message })
      }),
    ]

    lifecycle.addCleanup(() => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe()
      }
    })

    // Delay connection start to avoid "WebSocket is closed before the connection is established"
    // error in React Strict Mode (which mounts/unmounts immediately in dev)
    const connectTimer = setTimeout(() => {
      if (!lifecycle.signal.aborted) {
        client.start()
        lifecycle.addCleanup(() => client.stop())
      }
    }, 0)

    lifecycle.addCleanup(() => clearTimeout(connectTimer))

    return () => {
      lifecycle.dispose()
    }
  }, [queryClient, wsUrl])

  const value = useMemo<AdminSystemLiveContextValue>(
    () => ({
      state,
      requestHealth: () => {
        clientRef.current?.requestHealth()
      },
    }),
    [state]
  )

  return <AdminSystemLiveFeedContext.Provider value={value}>{children}</AdminSystemLiveFeedContext.Provider>
}

export const useAdminSystemLiveFeed = (): AdminSystemLiveContextValue => {
  const context = useContext(AdminSystemLiveFeedContext)
  if (!context) {
    throw new Error(ADMIN_SYSTEM_WS_ERROR_CONTEXT_UNAVAILABLE)
  }
  return context
}

export const useLiveStatusBadgeModel = (): { text: string; variant: string } => {
  const { state } = useAdminSystemLiveFeed()
  switch (state.connectionStatus) {
    case ADMIN_SYSTEM_WS_STATUS_CONNECTING:
      return { text: UI_LIVE_STATUS_CONNECTING, variant: UI_BADGE_VARIANT_INFO }
    case ADMIN_SYSTEM_WS_STATUS_CONNECTED:
      return { text: UI_LIVE_STATUS_CONNECTED, variant: UI_BADGE_VARIANT_SUCCESS }
    case ADMIN_SYSTEM_WS_STATUS_ERROR:
      return { text: UI_LIVE_STATUS_ERROR, variant: UI_BADGE_VARIANT_DANGER }
    default:
      return { text: UI_LIVE_STATUS_DISCONNECTED, variant: UI_BADGE_VARIANT_SECONDARY }
  }
}
