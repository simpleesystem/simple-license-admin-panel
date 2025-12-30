import mitt from 'mitt'

import {
  ADMIN_SYSTEM_WS_BACKOFF_JITTER_RATIO,
  ADMIN_SYSTEM_WS_BACKOFF_MS_INITIAL,
  ADMIN_SYSTEM_WS_BACKOFF_MS_MAX,
  ADMIN_SYSTEM_WS_CONNECT_TIMEOUT_MS,
  ADMIN_SYSTEM_WS_ERROR_INVALID_MESSAGE,
  ADMIN_SYSTEM_WS_ERROR_SOCKET,
  ADMIN_SYSTEM_WS_ERROR_UNKNOWN_MESSAGE,
  ADMIN_SYSTEM_WS_HEALTH_REQUEST_DEBOUNCE_MS,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_ERROR,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_HEALTH_UPDATE,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_PING,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_PONG,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_REQUEST_HEALTH,
  ADMIN_SYSTEM_WS_STATUS_CONNECTED,
  ADMIN_SYSTEM_WS_STATUS_CONNECTING,
  ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
  ADMIN_SYSTEM_WS_STATUS_ERROR,
} from '../constants'
import type {
  AdminSystemWsClientMessage,
  AdminSystemWsConnectionStatus,
  AdminSystemWsHealthUpdate,
  AdminSystemWsServerMessage,
} from './adminSystemWsProtocol'
import { parseAdminSystemServerMessage } from './adminSystemWsProtocol'

type AdminSystemWsClientEvents = {
  status: { status: AdminSystemWsConnectionStatus; error?: string }
  healthUpdate: AdminSystemWsHealthUpdate
  serverError: { message: string }
}

type EventKey = keyof AdminSystemWsClientEvents
type EventHandler<K extends EventKey> = (event: AdminSystemWsClientEvents[K]) => void

const exponentialBackoffWithJitter = (attempt: number): number => {
  const base = ADMIN_SYSTEM_WS_BACKOFF_MS_INITIAL * 2 ** attempt
  const capped = Math.min(base, ADMIN_SYSTEM_WS_BACKOFF_MS_MAX)
  const jitter = capped * ADMIN_SYSTEM_WS_BACKOFF_JITTER_RATIO * Math.random()
  return Math.floor(capped + jitter)
}

export class AdminSystemWsClient {
  private socket: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private connectTimer: ReturnType<typeof setTimeout> | null = null
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempt = 0
  private stopped = false
  private emitter = mitt<AdminSystemWsClientEvents>()
  private readonly url: string

  constructor(url: string) {
    this.url = url
  }

  start(): void {
    if (this.stopped) {
      this.stopped = false
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.connect()
  }

  stop(): void {
    this.stopped = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.connectTimer) {
      clearTimeout(this.connectTimer)
      this.connectTimer = null
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.reconnectAttempt = 0
    this.emitStatus(ADMIN_SYSTEM_WS_STATUS_DISCONNECTED)
  }

  subscribe<K extends EventKey>(event: K, handler: EventHandler<K>): () => void {
    this.emitter.on(event, handler as (event: AdminSystemWsClientEvents[EventKey]) => void)
    return () => {
      this.emitter.off(event, handler as (event: AdminSystemWsClientEvents[EventKey]) => void)
    }
  }

  ping(): void {
    this.send({ type: ADMIN_SYSTEM_WS_MESSAGE_TYPE_PING })
  }

  requestHealth(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.debounceTimer = setTimeout(() => {
      this.send({ type: ADMIN_SYSTEM_WS_MESSAGE_TYPE_REQUEST_HEALTH })
    }, ADMIN_SYSTEM_WS_HEALTH_REQUEST_DEBOUNCE_MS)
  }

  private connect(): void {
    this.emitStatus(ADMIN_SYSTEM_WS_STATUS_CONNECTING)
    this.socket = new WebSocket(this.url)

    this.connectTimer = setTimeout(() => {
      if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close()
      }
    }, ADMIN_SYSTEM_WS_CONNECT_TIMEOUT_MS)

    this.socket.onopen = () => {
      if (this.connectTimer) {
        clearTimeout(this.connectTimer)
        this.connectTimer = null
      }
      this.reconnectAttempt = 0
      this.emitStatus(ADMIN_SYSTEM_WS_STATUS_CONNECTED)
      this.requestHealth()
    }

    this.socket.onmessage = (event: MessageEvent<string>) => {
      this.handleMessage(event.data)
    }

    this.socket.onerror = () => {
      this.emitStatus(ADMIN_SYSTEM_WS_STATUS_ERROR, ADMIN_SYSTEM_WS_ERROR_SOCKET)
    }

    this.socket.onclose = () => {
      if (this.connectTimer) {
        clearTimeout(this.connectTimer)
        this.connectTimer = null
      }
      this.emitStatus(ADMIN_SYSTEM_WS_STATUS_DISCONNECTED)
      this.socket = null
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.stopped) {
      return
    }

    const delay = exponentialBackoffWithJitter(this.reconnectAttempt)
    this.reconnectAttempt += 1
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private emitStatus(status: AdminSystemWsConnectionStatus, error?: string): void {
    this.emitter.emit('status', { status, error })
  }

  private handleMessage(raw: string): void {
    const parsed = parseAdminSystemServerMessage(raw)
    if (!parsed.success) {
      this.emitter.emit('serverError', { message: ADMIN_SYSTEM_WS_ERROR_INVALID_MESSAGE })
      return
    }

    const message = parsed.data as AdminSystemWsServerMessage
    switch (message.type) {
      case ADMIN_SYSTEM_WS_MESSAGE_TYPE_HEALTH_UPDATE:
        this.emitter.emit('healthUpdate', message)
        break
      case ADMIN_SYSTEM_WS_MESSAGE_TYPE_PONG:
        this.emitStatus(ADMIN_SYSTEM_WS_STATUS_CONNECTED)
        break
      case ADMIN_SYSTEM_WS_MESSAGE_TYPE_ERROR:
        this.emitter.emit('serverError', { message: message.message })
        this.emitStatus(ADMIN_SYSTEM_WS_STATUS_ERROR, message.message)
        break
      default:
        this.emitter.emit('serverError', { message: ADMIN_SYSTEM_WS_ERROR_UNKNOWN_MESSAGE })
    }
  }

  private send(message: AdminSystemWsClientMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }
    this.socket.send(JSON.stringify(message))
  }
}

export default AdminSystemWsClient
