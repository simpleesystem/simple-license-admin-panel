import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Client } from '@simple-license/react-sdk'
import { WS_STATE_CONNECTED, WS_STATE_DISCONNECTED } from '@simple-license/react-sdk'
import { faker } from '@faker-js/faker'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
import {
  UI_SYSTEM_STATUS_EMPTY_BODY,
  UI_SYSTEM_STATUS_EMPTY_TITLE,
  UI_SYSTEM_STATUS_ERROR_BODY,
  UI_SYSTEM_STATUS_ERROR_TITLE,
  UI_SYSTEM_STATUS_LOADING_BODY,
  UI_SYSTEM_STATUS_LOADING_TITLE,
  UI_SYSTEM_STATUS_REFRESH_LABEL,
  UI_SYSTEM_STATUS_TITLE,
  UI_SYSTEM_STATUS_VALUE_HEALTHY,
  UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED,
  UI_SYSTEM_STATUS_VALUE_UNHEALTHY,
} from '../../../src/ui/constants'
import { SystemStatusPanel } from '../../../src/ui/workflows/SystemStatusPanel'

const useServerStatusMock = vi.hoisted(() => vi.fn())
const useHealthWebSocketMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useServerStatus: useServerStatusMock,
    useHealthWebSocket: useHealthWebSocketMock,
  }
})

const createMockClient = () => ({}) as Client

const createHealthSocketValue = (overrides: Partial<ReturnType<typeof useHealthWebSocketMock>> = {}) => {
  const requestHealth = vi.fn()
  return {
    connected: false,
    connectionInfo: { state: WS_STATE_DISCONNECTED, connectedAt: undefined, disconnectedAt: undefined },
    error: undefined,
    healthData: undefined,
    healthMessage: undefined,
    lastMessage: undefined,
    send: vi.fn(),
    sendPing: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    requestHealth,
    ...overrides,
  }
}

const renderWithProviders = (ui: React.ReactElement, client: Client) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ client }}>{ui}</ApiContext.Provider>
    </QueryClientProvider>
  )
}

describe('SystemStatusPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useHealthWebSocketMock.mockReturnValue(createHealthSocketValue())
  })

  test('renders system status summary', () => {
    const client = createMockClient()
    useServerStatusMock.mockReturnValue({
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: faker.company.buzzPhrase(),
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemStatusPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_HEALTHY)).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useServerStatusMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemStatusPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_STATUS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useServerStatusMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemStatusPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_STATUS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when no status data exists', () => {
    const client = createMockClient()
    useServerStatusMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemStatusPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_STATUS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('refresh button triggers refetch', () => {
    const client = createMockClient()
    const refetch = vi.fn()
    useServerStatusMock.mockReturnValue({
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      isLoading: false,
      isError: false,
      refetch,
    })
    const requestHealth = vi.fn()
    useHealthWebSocketMock.mockReturnValue(
      createHealthSocketValue({
        connectionInfo: { state: WS_STATE_CONNECTED, connectedAt: new Date().toISOString() },
        requestHealth,
      })
    )

    renderWithProviders(<SystemStatusPanel client={client} />, client)

    fireEvent.click(screen.getByRole('button', { name: UI_SYSTEM_STATUS_REFRESH_LABEL }))

    expect(refetch).toHaveBeenCalledTimes(1)
    expect(requestHealth).toHaveBeenCalledTimes(1)
  })

  test('renders unhealthy status label', () => {
    const client = createMockClient()
    useServerStatusMock.mockReturnValue({
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemStatusPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_UNHEALTHY)).toBeInTheDocument()
  })

  test('falls back to live data when API status is unavailable', () => {
    const client = createMockClient()
    useServerStatusMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const liveTimestamp = new Date().toISOString()
    useHealthWebSocketMock.mockReturnValue(
      createHealthSocketValue({
        connectionInfo: { state: WS_STATE_CONNECTED, connectedAt: liveTimestamp },
        healthMessage: { type: 'health_update', timestamp: liveTimestamp, data: {} } as never,
        healthData: {
          system: {
            uptime: 1,
            memory: { heap_used: 1, heap_total: 2, usage_percent: 50 },
            clients_connected: 1,
          },
          licenses: {
            total: 1,
            active: 1,
            expired: 0,
            demo_mode: 0,
            customers: 1,
            recent: 1,
          },
          security: { failed_logins_last_hour: 0 },
          database: { active_connections: 1 },
        },
      })
    )

    renderWithProviders(<SystemStatusPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_HEALTHY)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED)).toBeInTheDocument()
  })
})

