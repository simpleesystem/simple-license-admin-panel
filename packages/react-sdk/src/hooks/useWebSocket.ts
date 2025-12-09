import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Client } from '../client'
import { WebSocketClient } from '../client/websocketClient'
import {
  WS_STATE_CONNECTED,
  WS_STATE_DISCONNECTED,
  type WebSocketClientOptions,
  type WebSocketConnectionInfo,
  type WebSocketMessage,
  type WebSocketOutboundMessage,
} from '../types/websocket'

export type UseWebSocketOptions = WebSocketClientOptions

export type UseWebSocketResult = {
  connected: boolean
  connectionInfo: WebSocketConnectionInfo
  lastMessage?: WebSocketMessage | undefined
  error?: Error | undefined
  send: (message: WebSocketOutboundMessage) => boolean
  requestHealth: () => boolean
  sendPing: () => boolean
  disconnect: () => void
  reconnect: () => void
}

export function useWebSocket(client: Client, options?: UseWebSocketOptions): UseWebSocketResult {
  const webSocketRef = useRef<WebSocketClient | null>(null)
  const [connectionInfo, setConnectionInfo] = useState<WebSocketConnectionInfo>({ state: WS_STATE_DISCONNECTED })
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | undefined>()
  const [error, setError] = useState<Error | undefined>()

  const normalizedOptions = useMemo(() => {
    const { path, reconnect, reconnectAttempts, reconnectIntervalMs, webSocketFactory, onOpen, onClose, onError } =
      options ?? {}
    return {
      ...(path !== undefined ? { path } : {}),
      ...(reconnect !== undefined ? { reconnect } : {}),
      ...(reconnectAttempts !== undefined ? { reconnectAttempts } : {}),
      ...(reconnectIntervalMs !== undefined ? { reconnectIntervalMs } : {}),
      ...(webSocketFactory !== undefined ? { webSocketFactory } : {}),
      ...(onOpen !== undefined ? { onOpen } : {}),
      ...(onClose !== undefined ? { onClose } : {}),
      ...(onError !== undefined ? { onError } : {}),
    }
  }, [
    options?.path,
    options?.reconnect,
    options?.reconnectAttempts,
    options?.reconnectIntervalMs,
    options?.webSocketFactory,
    options?.onOpen,
    options?.onClose,
    options?.onError,
  ])

  useEffect(() => {
    const wsClient = new WebSocketClient(client.getBaseUrl(), {
      ...normalizedOptions,
      onOpen: () => {
        setError(undefined)
        normalizedOptions.onOpen?.()
      },
      onClose: () => {
        normalizedOptions.onClose?.()
      },
      onError: (wsError: Error) => {
        setError(wsError)
        normalizedOptions.onError?.(wsError)
      },
    })
    webSocketRef.current = wsClient
    const removeStateListener = wsClient.addStateListener((info) => {
      setConnectionInfo(info)
    })
    const removeMessageListener = wsClient.addMessageListener((message) => {
      setLastMessage(message)
    })
    wsClient.connect()

    return () => {
      removeStateListener()
      removeMessageListener()
      wsClient.disconnect()
      webSocketRef.current = null
    }
  }, [
    client,
    normalizedOptions.path,
    normalizedOptions.reconnect,
    normalizedOptions.reconnectAttempts,
    normalizedOptions.reconnectIntervalMs,
    normalizedOptions.webSocketFactory,
    normalizedOptions.onOpen,
    normalizedOptions.onClose,
    normalizedOptions.onError,
  ])

  const send = useCallback((message: WebSocketOutboundMessage) => {
    return webSocketRef.current?.send(message) ?? false
  }, [])

  const requestHealth = useCallback(() => {
    return webSocketRef.current?.requestHealth() ?? false
  }, [])

  const sendPing = useCallback(() => {
    return webSocketRef.current?.sendPing() ?? false
  }, [])

  const disconnect = useCallback(() => {
    webSocketRef.current?.disconnect()
  }, [])

  const reconnect = useCallback(() => {
    webSocketRef.current?.connect()
  }, [])

  return {
    connected: connectionInfo.state === WS_STATE_CONNECTED,
    connectionInfo,
    lastMessage,
    error,
    send,
    requestHealth,
    sendPing,
    disconnect,
    reconnect,
  }
}

