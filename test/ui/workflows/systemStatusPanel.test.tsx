import { faker } from '@faker-js/faker'
import type { Client, ServerStatusResponse, WebSocketHealthData } from '@simple-license/react-sdk'
import { WS_STATE_CONNECTED, WS_STATE_CONNECTING, WS_STATE_DISCONNECTED } from '@simple-license/react-sdk'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

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

import type { UseLiveDataResult } from '../../../src/hooks/useLiveData'
import { useLiveData } from '../../../src/hooks/useLiveData'
import {
  UI_LIVE_STATUS_CONNECTING,
  UI_LIVE_STATUS_ERROR,
  UI_SYSTEM_STATUS_EMPTY_BODY,
  UI_SYSTEM_STATUS_EMPTY_TITLE,
  UI_SYSTEM_STATUS_ERROR_BODY,
  UI_SYSTEM_STATUS_ERROR_TITLE,
  UI_SYSTEM_STATUS_LABEL_LAST_CHECKED,
  UI_SYSTEM_STATUS_LOADING_BODY,
  UI_SYSTEM_STATUS_LOADING_TITLE,
  UI_SYSTEM_STATUS_REFRESH_LABEL,
  UI_SYSTEM_STATUS_TITLE,
  UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED,
  UI_SYSTEM_STATUS_VALUE_DATABASE_UNAVAILABLE,
  UI_SYSTEM_STATUS_VALUE_HEALTHY,
  UI_SYSTEM_STATUS_VALUE_UNHEALTHY,
} from '../../../src/ui/constants'
import { SystemStatusPanel } from '../../../src/ui/workflows/SystemStatusPanel'

vi.mock('../../../src/hooks/useLiveData')

const createMockClient = () => ({}) as Client

type LiveDataResult = UseLiveDataResult<
  ServerStatusResponse | undefined,
  ReturnType<typeof createSocketResult>,
  WebSocketHealthData | undefined
>
type SocketResult = LiveDataResult['socketResult']

const createSocketResult = (overrides: Partial<SocketResult> = {}): SocketResult => ({
  connectionInfo: { state: WS_STATE_DISCONNECTED, connectedAt: undefined, disconnectedAt: undefined },
  connected: false,
  lastMessage: undefined,
  error: undefined,
  requestHealth: vi.fn(),
  send: vi.fn(),
  sendPing: vi.fn(),
  disconnect: vi.fn(),
  reconnect: vi.fn(),
  healthMessage: undefined,
  healthData: undefined,
  ...overrides,
})

const createLiveDataResult = (overrides: Partial<LiveDataResult> = {}): LiveDataResult => {
  const socketResult = overrides.socketResult ?? createSocketResult()
  const queryData = overrides.queryData
  const liveData = overrides.liveData
  const data = overrides.data ?? queryData
  const hasDataOverride =
    overrides.hasData ??
    Boolean(
      (data !== undefined && data !== null) ||
        (queryData !== undefined && queryData !== null) ||
        (liveData !== undefined && liveData !== null)
    )

  return {
    data,
    queryData,
    liveData,
    hasData: hasDataOverride,
    isLoading: overrides.isLoading ?? false,
    isError: overrides.isError ?? false,
    queryResult: {
      data: queryData,
      isLoading: Boolean(overrides.isLoading),
      isError: Boolean(overrides.isError),
      refetch: vi.fn(),
    } as LiveDataResult['queryResult'],
    socketResult,
    refresh: overrides.refresh ?? vi.fn(),
    ...overrides,
  }
}

describe('SystemStatusPanel', () => {
  const useLiveDataMock = vi.mocked(useLiveData)

  beforeEach(() => {
    vi.clearAllMocks()
    useServerStatusMock.mockReturnValue({
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: { database: faker.company.buzzPhrase() },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useHealthWebSocketMock.mockReturnValue(createSocketResult())
    useLiveDataMock.mockReturnValue(
      createLiveDataResult({
        queryData: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: faker.company.buzzPhrase(),
          },
        },
      })
    )
  })

  test('renders system status summary', () => {
    const client = createMockClient()
    render(<SystemStatusPanel client={client} />)
    expect(screen.getByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_HEALTHY)).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        queryData: undefined,
        isLoading: true,
        hasData: false,
      })
    )

    render(<SystemStatusPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        queryData: undefined,
        isError: true,
        hasData: false,
      })
    )

    render(<SystemStatusPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when no status data exists', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        queryData: undefined,
        hasData: false,
      })
    )

    render(<SystemStatusPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('prefers live payload when loading and formats database unavailability', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        isLoading: true,
        liveData: {
          status: 'unhealthy',
          timestamp: '2024-01-01T00:00:00.000Z',
          checks: { database: 0 },
        },
      })
    )

    render(<SystemStatusPanel client={client} />)

    expect(screen.queryByText(UI_SYSTEM_STATUS_LOADING_TITLE)).toBeNull()
    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_UNHEALTHY)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_DATABASE_UNAVAILABLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_LABEL_LAST_CHECKED)).toBeInTheDocument()
  })

  test('shows live status error badge when socket reports error', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        queryData: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          checks: { database: UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED },
        },
        socketResult: createSocketResult({
          error: new Error('socket-failure'),
        }),
      })
    )

    render(<SystemStatusPanel client={client} />)

    expect(screen.getByText(UI_LIVE_STATUS_ERROR)).toBeInTheDocument()
  })

  test('shows connecting badge and renders string database value from live payload', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        liveData: {
          status: 'healthy',
          timestamp: '2024-02-02T00:00:00.000Z',
          checks: { database: 'primary-replica' },
        },
        socketResult: createSocketResult({
          connectionInfo: { state: WS_STATE_CONNECTING, connectedAt: undefined, disconnectedAt: undefined },
        }),
      })
    )

    render(<SystemStatusPanel client={client} />)

    expect(screen.getByText(UI_LIVE_STATUS_CONNECTING)).toBeInTheDocument()
    expect(screen.getByText('primary-replica')).toBeInTheDocument()
  })

  test('refresh button triggers refresh handler', () => {
    const client = createMockClient()
    const refresh = vi.fn()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        queryData: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
        },
        refresh,
        socketResult: createSocketResult({
          connectionInfo: {
            state: WS_STATE_CONNECTED,
            connectedAt: new Date().toISOString(),
            disconnectedAt: undefined,
          },
        }),
      })
    )

    render(<SystemStatusPanel client={client} />)

    fireEvent.click(screen.getByRole('button', { name: UI_SYSTEM_STATUS_REFRESH_LABEL }))

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  test('renders unhealthy status label', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        queryData: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
        },
      })
    )

    render(<SystemStatusPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_UNHEALTHY)).toBeInTheDocument()
  })

  test('falls back to live data when API status is unavailable', () => {
    const client = createMockClient()
    const liveTimestamp = new Date().toISOString()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        queryData: undefined,
        liveData: {
          status: 'healthy',
          timestamp: liveTimestamp,
          checks: { database: UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED },
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
        socketResult: createSocketResult({
          connectionInfo: { state: WS_STATE_CONNECTED, connectedAt: liveTimestamp, disconnectedAt: undefined },
          healthMessage: { type: 'health_update', timestamp: liveTimestamp, data: {} } as never,
        }),
      })
    )

    render(<SystemStatusPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_HEALTHY)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED)).toBeInTheDocument()
  })

  test('renders empty state when no data and not loading or error', () => {
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        queryData: undefined,
        liveData: undefined,
        hasData: false,
        isLoading: false,
        isError: false,
        refresh: vi.fn(),
      })
    )

    render(<SystemStatusPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('renders error state when query fails and no live payload', () => {
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        queryData: undefined,
        liveData: undefined,
        hasData: false,
        isLoading: false,
        isError: true,
      })
    )

    render(<SystemStatusPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_ERROR_BODY)).toBeInTheDocument()
  })
})
