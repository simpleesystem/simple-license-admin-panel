import { fireEvent, render, screen } from '@testing-library/react'
import { WS_STATE_CONNECTED, WS_STATE_DISCONNECTED } from '@simple-license/react-sdk'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_ANALYTICS_STATS_EMPTY_BODY,
  UI_ANALYTICS_STATS_EMPTY_TITLE,
  UI_ANALYTICS_STATS_ERROR_BODY,
  UI_ANALYTICS_STATS_ERROR_TITLE,
  UI_ANALYTICS_STATS_LABEL_ACTIVE,
  UI_ANALYTICS_STATS_LABEL_CUSTOMERS,
  UI_ANALYTICS_STATS_LOADING_BODY,
  UI_ANALYTICS_STATS_LOADING_TITLE,
  UI_ANALYTICS_STATS_REFRESH_LABEL,
  UI_ANALYTICS_STATS_TITLE,
  UI_LIVE_STATUS_CONNECTED,
} from '../../../src/ui/constants'
import { AnalyticsStatsPanel } from '../../../src/ui/workflows/AnalyticsStatsPanel'
import type { UseLiveDataResult } from '../../../src/hooks/useLiveData'
import { useLiveData } from '../../../src/hooks/useLiveData'
const useSystemStatsMock = vi.hoisted(() => vi.fn())
const useHealthWebSocketMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useSystemStats: useSystemStatsMock,
    useHealthWebSocket: useHealthWebSocketMock,
  }
})

vi.mock('../../../src/hooks/useLiveData')

const createStats = () => ({
  stats: {
    active_licenses: 100,
    expired_licenses: 5,
    total_customers: 20,
    total_activations: 500,
  },
})

type SocketConnectionInfo = {
  state: typeof WS_STATE_CONNECTED | typeof WS_STATE_DISCONNECTED
  connectedAt?: string
  disconnectedAt?: string
}

type SocketResult = {
  connectionInfo: SocketConnectionInfo
  connected: boolean
  lastMessage: unknown
  error: unknown
  requestHealth: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
  sendPing: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  reconnect: ReturnType<typeof vi.fn>
  healthMessage: unknown
  healthData: unknown
}

const createSocketResultBase = (): SocketResult => ({
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
})

type LiveDataResult = UseLiveDataResult<unknown, SocketResult, ReturnType<typeof createStats>['stats']>

const createSocketResult = (overrides: Partial<SocketResult> = {}): SocketResult => {
  const base = createSocketResultBase()
  return {
    ...base,
    ...overrides,
    connectionInfo: {
      ...base.connectionInfo,
      ...overrides.connectionInfo,
    },
  }
}

const createLiveDataResult = (
  overrides: Partial<LiveDataResult> = {},
): LiveDataResult => {
  const socketResult = overrides.socketResult ?? createSocketResult()
  const data = overrides.data
  const queryData = overrides.queryData
  const liveData = overrides.liveData
  const hasDataOverride =
    overrides.hasData ??
    Boolean(
      (data !== undefined && data !== null) ||
        (queryData !== undefined && queryData !== null) ||
        (liveData !== undefined && liveData !== null),
    )

  return {
    data,
    queryData,
    liveData,
    hasData: hasDataOverride,
    isLoading: false,
    isError: false,
    queryResult: {
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as LiveDataResult['queryResult'],
    socketResult,
    refresh: vi.fn(),
    ...overrides,
  }
}

describe('AnalyticsStatsPanel', () => {
  const useLiveDataMock = vi.mocked(useLiveData)

  beforeEach(() => {
    vi.clearAllMocks()
    useSystemStatsMock.mockReturnValue({
      data: createStats(),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useHealthWebSocketMock.mockReturnValue(createSocketResult({ connectionInfo: { state: WS_STATE_CONNECTED }, connected: true }))
    useLiveDataMock.mockReturnValue(
      createLiveDataResult({
        data: createStats().stats,
      }),
    )
  })

  test('renders summary list when data available', () => {
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LABEL_ACTIVE)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LABEL_CUSTOMERS)).toBeInTheDocument()
  })

  test('shows loading alert when no data yet', () => {
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        isLoading: true,
        hasData: false,
      }),
    )
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LOADING_BODY)).toBeInTheDocument()
  })

  test('shows error alert when both sources fail', () => {
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        isError: true,
        hasData: false,
      }),
    )
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_ERROR_BODY)).toBeInTheDocument()
  })

  test('shows empty state when stats missing', () => {
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        hasData: false,
      }),
    )
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('allows manual refresh and triggers live request', () => {
    const refresh = vi.fn()
    const socketResult = createSocketResult({
      connectionInfo: { state: WS_STATE_CONNECTED, connectedAt: new Date().toISOString(), disconnectedAt: undefined },
      connected: true,
    })
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: createStats().stats,
        refresh,
        socketResult,
      }),
    )

    render(<AnalyticsStatsPanel client={{} as never} />)
    fireEvent.click(screen.getByRole('button', { name: UI_ANALYTICS_STATS_REFRESH_LABEL }))
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  test('uses live stats when API data unavailable', () => {
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: {
          active_licenses: 200,
          expired_licenses: 10,
          total_customers: 40,
          total_activations: 800,
        },
      }),
    )

    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
  })

  test('renders live status badge text', () => {
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        socketResult: createSocketResult({
          connectionInfo: { state: WS_STATE_CONNECTED, connectedAt: new Date().toISOString(), disconnectedAt: undefined },
          connected: true,
        }),
      }),
    )
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_LIVE_STATUS_CONNECTED)).toBeInTheDocument()
  })
})
