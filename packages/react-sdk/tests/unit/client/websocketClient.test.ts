/**
 * @vitest-environment jsdom
 */

import { waitFor } from '@testing-library/react'
import type { Client as MockServerClient, ServerOptions } from 'mock-socket'
import { Server, WebSocket as MockSocket } from 'mock-socket'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { WebSocketClient } from '@/client/websocketClient'
import {
  WS_MESSAGE_TYPE_HEALTH_UPDATE,
  WS_MESSAGE_TYPE_REQUEST_HEALTH,
  WS_STATE_CONNECTED,
  WS_STATE_DISCONNECTED,
} from '@/types/websocket'
import {
  TEST_BOOLEAN_FALSE,
  TEST_DATE_CREATED,
  TEST_NUMBER_HUNDRED,
  TEST_NUMBER_ONE,
  TEST_NUMBER_TEN,
  TEST_NUMBER_ZERO,
  TEST_STRING_VALUE,
  TEST_TIMEOUT_SHORT,
  TEST_WS_CLOSE_CODE_NORMAL,
  TEST_WS_BASE_URL,
  TEST_WS_SERVER_URL,
} from '../../constants'

const MOCK_SERVER_OPTIONS: ServerOptions = { mock: TEST_BOOLEAN_FALSE }
const activeServers: Server[] = []
const createServer = () => {
  const server = new Server(TEST_WS_SERVER_URL, MOCK_SERVER_OPTIONS)
  activeServers.push(server)
  return server
}
const createFactory = () =>
  vi.fn((url: string) => {
    const socket = new MockSocket(url)
    return socket as unknown as WebSocket
  })
const waitMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const forceCloseSocket = (instance: WebSocketClient) => {
  const handle = instance as unknown as { socket: WebSocket | null }
  if (!handle.socket) {
    throw new Error('Active socket not found')
  }
  handle.socket.close(TEST_WS_CLOSE_CODE_NORMAL, TEST_STRING_VALUE)
}

describe('WebSocketClient', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    while (activeServers.length > TEST_NUMBER_ZERO) {
      activeServers.pop()?.stop()
    }
  })

  it('connects and dispatches health update messages to listeners', async () => {
    const server = createServer()
    let serverSocket: MockServerClient | null = null
    server.on('connection', (socket) => {
      serverSocket = socket
    })

    const factory = createFactory()
    const client = new WebSocketClient(TEST_WS_BASE_URL, { webSocketFactory: factory })
    const messageListener = vi.fn()
    const stateListener = vi.fn()
    client.addMessageListener(messageListener)
    client.addStateListener(stateListener)

    client.connect()
    await waitFor(() => {
      expect(stateListener).toHaveBeenCalledWith(expect.objectContaining({ state: WS_STATE_CONNECTED }))
    })

    const payload = {
      type: WS_MESSAGE_TYPE_HEALTH_UPDATE,
      timestamp: TEST_DATE_CREATED.toISOString(),
      data: {
        system: {
          uptime: TEST_NUMBER_TEN,
          memory: {
            heap_used: TEST_NUMBER_ONE,
            heap_total: TEST_NUMBER_TEN,
            usage_percent: TEST_NUMBER_HUNDRED,
          },
          clients_connected: TEST_NUMBER_ONE,
        },
        licenses: {
          total: TEST_NUMBER_HUNDRED,
          active: TEST_NUMBER_TEN,
          expired: TEST_NUMBER_ONE,
          demo_mode: TEST_NUMBER_ZERO,
          customers: TEST_NUMBER_TEN,
          recent: TEST_NUMBER_ONE,
        },
        security: {
          failed_logins_last_hour: TEST_NUMBER_ZERO,
        },
        database: {
          active_connections: TEST_NUMBER_ONE,
        },
        stats: {
          active_licenses: TEST_NUMBER_TEN,
          expired_licenses: TEST_NUMBER_ONE,
          total_customers: TEST_NUMBER_ONE,
          total_activations: TEST_NUMBER_HUNDRED,
        },
      },
    }

    serverSocket?.send(JSON.stringify(payload))

    await waitFor(() => {
      expect(factory).toHaveBeenCalledTimes(TEST_NUMBER_ONE)
      expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({ type: WS_MESSAGE_TYPE_HEALTH_UPDATE }))
    })
  })

  it('sends request health messages when connected', async () => {
    const server = createServer()
    const messages: Array<Record<string, unknown>> = []
    server.on('connection', (socket) => {
      socket.on('message', (data) => {
        messages.push(JSON.parse(data as string))
      })
    })

    const factory = createFactory()
    const client = new WebSocketClient(TEST_WS_BASE_URL, { webSocketFactory: factory })
    client.connect()

    await waitFor(() => {
      expect(client.getConnectionInfo().state).toBe(WS_STATE_CONNECTED)
    })

    const sent = client.requestHealth()
    expect(sent).toBe(true)

    await waitFor(() => {
      expect(messages).toHaveLength(TEST_NUMBER_ONE)
      expect(messages[TEST_NUMBER_ZERO].type).toBe(WS_MESSAGE_TYPE_REQUEST_HEALTH)
    })
  })

  it('schedules reconnect after unexpected closure', async () => {
    const server = createServer()
    let connectionCount = TEST_NUMBER_ZERO
    server.on('connection', () => {
      connectionCount += TEST_NUMBER_ONE
    })

    const factory = createFactory()
    const client = new WebSocketClient(TEST_WS_BASE_URL, {
      reconnectIntervalMs: TEST_NUMBER_ONE,
      webSocketFactory: factory,
    })
    client.connect()

    await waitFor(() => {
      expect(connectionCount).toBe(TEST_NUMBER_ONE)
    })
    await waitFor(() => {
      expect(client.getConnectionInfo().state).toBe(WS_STATE_CONNECTED)
    })

    forceCloseSocket(client)

    await waitFor(() => {
      expect(connectionCount).toBe(TEST_NUMBER_ONE + TEST_NUMBER_ONE)
    })
    await waitFor(() => {
      expect(client.getConnectionInfo().state).toBe(WS_STATE_CONNECTED)
    })
  })

  it('does not reconnect after manual disconnect', async () => {
    const server = createServer()
    let connectionCount = TEST_NUMBER_ZERO
    server.on('connection', () => {
      connectionCount += TEST_NUMBER_ONE
    })

    const factory = createFactory()
    const client = new WebSocketClient(TEST_WS_BASE_URL, {
      reconnectIntervalMs: TEST_TIMEOUT_SHORT,
      webSocketFactory: factory,
    })
    client.connect()
    await waitFor(() => {
      expect(connectionCount).toBe(TEST_NUMBER_ONE)
    })

    client.disconnect()
    expect(client.getConnectionInfo().state).toBe(WS_STATE_DISCONNECTED)

    await waitMs(TEST_TIMEOUT_SHORT)
    expect(connectionCount).toBe(TEST_NUMBER_ONE)
  })
})

