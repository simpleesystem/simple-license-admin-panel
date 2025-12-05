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
    const opts: WebSocketClientOptions = {}
    if (!options) {
      return opts
    }
    if (options.reconnect !== undefined) opts.reconnect = options.reconnect
    if (options.reconnectAttempts !== undefined) opts.reconnectAttempts = options.reconnectAttempts
    if (options.reconnectIntervalMs !== undefined) opts.reconnectIntervalMs = options.reconnectIntervalMs
    if (options.path !== undefined) opts.path = options.path
    if (options.webSocketFactory !== undefined) opts.webSocketFactory = options.webSocketFactory
    if (options.onOpen !== undefined) opts.onOpen = options.onOpen
    if (options.onClose !== undefined) opts.onClose = options.onClose
    if (options.onError !== undefined) opts.onError = options.onError
    return opts
  }, [options])

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
  }, [client, normalizedOptions])

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

