import type { SystemStatsResponse } from './api'

export const WS_MESSAGE_TYPE_HEALTH_UPDATE = 'health_update' as const
export const WS_MESSAGE_TYPE_PONG = 'pong' as const
export const WS_MESSAGE_TYPE_PING = 'ping' as const
export const WS_MESSAGE_TYPE_REQUEST_HEALTH = 'request_health' as const
export const WS_MESSAGE_TYPE_ERROR = 'error' as const
export const WS_MESSAGE_TYPE_UNKNOWN = 'unknown' as const

export const WS_STATE_CONNECTING = 'connecting' as const
export const WS_STATE_CONNECTED = 'connected' as const
export const WS_STATE_DISCONNECTED = 'disconnected' as const
export const WS_STATE_ERROR = 'error' as const

export interface WebSocketMemoryMetrics {
  heap_used: number
  heap_total: number
  usage_percent: number
}

export interface WebSocketSystemMetrics {
  uptime: number
  memory: WebSocketMemoryMetrics
  clients_connected: number
}

export interface WebSocketLicenseMetrics {
  total: number
  active: number
  expired: number
  demo_mode: number
  customers: number
  recent: number
}

export interface WebSocketSecurityMetrics {
  failed_logins_last_hour: number
}

export interface WebSocketDatabaseMetrics {
  active_connections: number
}

export interface HealthUpdatePayload {
  system: WebSocketSystemMetrics
  licenses: WebSocketLicenseMetrics
  security: WebSocketSecurityMetrics
  database: WebSocketDatabaseMetrics
  stats?: SystemStatsResponse['stats']
  error?: string
}

export type WebSocketState =
  | typeof WS_STATE_CONNECTING
  | typeof WS_STATE_CONNECTED
  | typeof WS_STATE_DISCONNECTED
  | typeof WS_STATE_ERROR

export interface HealthUpdateMessage {
  type: typeof WS_MESSAGE_TYPE_HEALTH_UPDATE
  timestamp: string
  data: HealthUpdatePayload
}

export interface PongMessage {
  type: typeof WS_MESSAGE_TYPE_PONG
}

export interface ErrorMessage {
  type: typeof WS_MESSAGE_TYPE_ERROR
  message: string
}

export interface UnknownMessage {
  type: typeof WS_MESSAGE_TYPE_UNKNOWN
  raw: unknown
}

export type WebSocketMessage = HealthUpdateMessage | PongMessage | ErrorMessage | UnknownMessage

export type WebSocketOutboundMessage =
  | {
      type: typeof WS_MESSAGE_TYPE_REQUEST_HEALTH
    }
  | {
      type: typeof WS_MESSAGE_TYPE_PING
    }

export interface WebSocketClientOptions {
  reconnect?: boolean | undefined
  reconnectAttempts?: number | undefined
  reconnectIntervalMs?: number | undefined
  onOpen?: (() => void) | undefined
  onClose?: (() => void) | undefined
  onError?: ((error: Error) => void) | undefined
  path?: string | undefined
  webSocketFactory?: ((url: string) => WebSocket) | undefined
}

export interface WebSocketConnectionInfo {
  state: WebSocketState
  connectedAt?: string
  disconnectedAt?: string
  reconnectAttempt?: number
}

