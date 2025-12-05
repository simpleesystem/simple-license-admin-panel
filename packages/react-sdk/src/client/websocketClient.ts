import {
  WS_MESSAGE_TYPE_ERROR,
  WS_MESSAGE_TYPE_HEALTH_UPDATE,
  WS_MESSAGE_TYPE_PING,
  WS_MESSAGE_TYPE_PONG,
  WS_MESSAGE_TYPE_REQUEST_HEALTH,
  WS_MESSAGE_TYPE_UNKNOWN,
  WS_STATE_CONNECTED,
  WS_STATE_CONNECTING,
  WS_STATE_DISCONNECTED,
  WS_STATE_ERROR,
  type ErrorMessage,
  type HealthUpdateMessage,
  type PongMessage,
  type UnknownMessage,
  type WebSocketClientOptions,
  type WebSocketConnectionInfo,
  type WebSocketMessage,
  type WebSocketOutboundMessage,
  type WebSocketState,
} from '../types/websocket'

const DEFAULT_WS_RECONNECT_INTERVAL_MS = 2_000
const DEFAULT_WS_MAX_RECONNECT_ATTEMPTS = 10
const DEFAULT_WS_PATH = '/ws/health'
const WS_READY_STATE_DEFAULT_CONNECTING = 0
const WS_READY_STATE_DEFAULT_OPEN = 1

type MessageListener = (message: WebSocketMessage) => void
type StateListener = (info: WebSocketConnectionInfo) => void

export class WebSocketClient {
  private socket: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempt = 0
  private manuallyClosed = false
  private readonly baseOrigin: string
  private readonly options: Required<
    Pick<WebSocketClientOptions, 'reconnect' | 'reconnectAttempts' | 'reconnectIntervalMs' | 'path'>
  > &
    Omit<WebSocketClientOptions, 'reconnect' | 'reconnectAttempts' | 'reconnectIntervalMs' | 'path'>
  private connectionInfo: WebSocketConnectionInfo = { state: WS_STATE_DISCONNECTED }
  private readonly messageListeners = new Set<MessageListener>()
  private readonly stateListeners = new Set<StateListener>()

  constructor(baseUrl: string, options?: WebSocketClientOptions) {
    this.baseOrigin = this.resolveOrigin(baseUrl)
    this.options = {
      reconnect: options?.reconnect ?? true,
      reconnectAttempts: options?.reconnectAttempts ?? DEFAULT_WS_MAX_RECONNECT_ATTEMPTS,
      reconnectIntervalMs: options?.reconnectIntervalMs ?? DEFAULT_WS_RECONNECT_INTERVAL_MS,
      path: options?.path ?? DEFAULT_WS_PATH,
      onOpen: options?.onOpen,
      onClose: options?.onClose,
      onError: options?.onError,
      webSocketFactory: options?.webSocketFactory,
    }
  }

  connect(): void {
    if (this.socket && (this.isOpen(this.socket) || this.isConnecting(this.socket))) {
      return
    }

    this.clearReconnectTimer()
    this.manuallyClosed = false
    this.setState(WS_STATE_CONNECTING, { reconnectAttempt: this.reconnectAttempt })

    const url = this.buildWebSocketUrl()
    const webSocketFactory = this.options.webSocketFactory ?? this.createDefaultWebSocketFactory()
    const socket = webSocketFactory(url)
    this.socket = socket

    socket.onopen = () => {
      this.reconnectAttempt = 0
      this.setState(WS_STATE_CONNECTED, { connectedAt: new Date().toISOString(), reconnectAttempt: 0 })
      this.options.onOpen?.()
    }

    socket.onmessage = (event: MessageEvent) => {
      const message = this.parseMessage(event.data)
      this.dispatchMessage(message)
    }

    socket.onerror = () => {
      this.setState(WS_STATE_ERROR)
      const error = new Error('WebSocket connection error')
      this.options.onError?.(error)
    }

    socket.onclose = () => {
      this.socket = null
      this.setState(WS_STATE_DISCONNECTED, { disconnectedAt: new Date().toISOString() })
      this.options.onClose?.()
      if (!this.manuallyClosed) {
        this.scheduleReconnect()
      }
    }
  }

  disconnect(): void {
    this.manuallyClosed = true
    this.clearReconnectTimer()
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.setState(WS_STATE_DISCONNECTED, { disconnectedAt: new Date().toISOString() })
  }

  send(message: WebSocketOutboundMessage): boolean {
    if (!this.socket || !this.isOpen(this.socket)) {
      return false
    }
    this.socket.send(JSON.stringify(message))
    return true
  }

  requestHealth(): boolean {
    return this.send({ type: WS_MESSAGE_TYPE_REQUEST_HEALTH })
  }

  sendPing(): boolean {
    return this.send({ type: WS_MESSAGE_TYPE_PING })
  }

  getConnectionInfo(): WebSocketConnectionInfo {
    return { ...this.connectionInfo }
  }

  addMessageListener(listener: MessageListener): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  addStateListener(listener: StateListener): () => void {
    this.stateListeners.add(listener)
    listener(this.getConnectionInfo())
    return () => this.stateListeners.delete(listener)
  }

  private resolveOrigin(baseUrl: string): string {
    try {
      const url = new URL(baseUrl)
      return `${url.protocol}//${url.host}`
    } catch (error) {
      throw new Error(`Invalid base URL for WebSocket client: ${String(error)}`)
    }
  }

  private buildWebSocketUrl(): string {
    const origin = new URL(this.baseOrigin)
    const isSecure = origin.protocol === 'https:'
    const normalizedPath = (this.options.path ?? DEFAULT_WS_PATH).startsWith('/')
      ? (this.options.path ?? DEFAULT_WS_PATH)
      : `/${this.options.path ?? DEFAULT_WS_PATH}`
    const protocol = isSecure ? 'wss:' : 'ws:'
    return `${protocol}//${origin.host}${normalizedPath}`
  }

  private createDefaultWebSocketFactory(): (url: string) => WebSocket {
    return (url: string) => {
      if (typeof WebSocket === 'undefined') {
        throw new Error('WebSocket is not available in the current environment')
      }
      return new WebSocket(url)
    }
  }

  private parseMessage(data: unknown): WebSocketMessage {
    let parsed: unknown = data
    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data)
      } catch {
        return { type: WS_MESSAGE_TYPE_UNKNOWN, raw: data }
      }
    } else if (data instanceof ArrayBuffer) {
      try {
        const decoded = new TextDecoder().decode(data)
        parsed = JSON.parse(decoded)
      } catch {
        return { type: WS_MESSAGE_TYPE_UNKNOWN, raw: data }
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return { type: WS_MESSAGE_TYPE_UNKNOWN, raw: parsed }
    }

    const payload = parsed as Record<string, unknown>
    const messageType = typeof payload.type === 'string' ? payload.type : WS_MESSAGE_TYPE_UNKNOWN

    if (messageType === WS_MESSAGE_TYPE_HEALTH_UPDATE) {
      return {
        type: WS_MESSAGE_TYPE_HEALTH_UPDATE,
        timestamp: typeof payload.timestamp === 'string' ? payload.timestamp : new Date().toISOString(),
        data: (payload.data || {}) as HealthUpdateMessage['data'],
      }
    }

    if (messageType === WS_MESSAGE_TYPE_PONG) {
      return { type: WS_MESSAGE_TYPE_PONG } satisfies PongMessage
    }

    if (messageType === WS_MESSAGE_TYPE_ERROR) {
      return {
        type: WS_MESSAGE_TYPE_ERROR,
        message: typeof payload.message === 'string' ? payload.message : 'WebSocket error',
      } satisfies ErrorMessage
    }

    return { type: WS_MESSAGE_TYPE_UNKNOWN, raw: payload } satisfies UnknownMessage
  }

  private dispatchMessage(message: WebSocketMessage): void {
    for (const listener of this.messageListeners) {
      listener(message)
    }
  }

  private setState(state: WebSocketState, extras?: Partial<WebSocketConnectionInfo>): void {
    this.connectionInfo = {
      ...this.connectionInfo,
      ...extras,
      state,
    }
    for (const listener of this.stateListeners) {
      listener(this.getConnectionInfo())
    }
  }

  private scheduleReconnect(): void {
    const shouldReconnect = this.options.reconnect ?? true
    if (!shouldReconnect) {
      return
    }
    const maxAttempts = this.options.reconnectAttempts ?? DEFAULT_WS_MAX_RECONNECT_ATTEMPTS
    if (this.reconnectAttempt >= maxAttempts) {
      return
    }

    this.reconnectAttempt += 1
    const attempt = this.reconnectAttempt
    const interval = this.options.reconnectIntervalMs ?? DEFAULT_WS_RECONNECT_INTERVAL_MS
    const delay = interval * attempt
    this.setState(WS_STATE_CONNECTING, { reconnectAttempt: attempt })

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private isOpen(socket: WebSocket): boolean {
    return socket.readyState === this.getReadyStateValue(socket, 'OPEN')
  }

  private isConnecting(socket: WebSocket): boolean {
    return socket.readyState === this.getReadyStateValue(socket, 'CONNECTING')
  }

  private getReadyStateValue(socket: WebSocket, state: 'OPEN' | 'CONNECTING'): number {
    const fromInstance = (socket as unknown as Record<string, unknown>)[state]
    if (typeof fromInstance === 'number') {
      return fromInstance
    }
    const fromGlobal = (globalThis?.WebSocket?.[state] ?? undefined) as number | undefined
    if (typeof fromGlobal === 'number') {
      return fromGlobal
    }
    if (state === 'OPEN') {
      return WS_READY_STATE_DEFAULT_OPEN
    }
    return WS_READY_STATE_DEFAULT_CONNECTING
  }
}

export default WebSocketClient

