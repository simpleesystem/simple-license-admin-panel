import { render, screen } from '@testing-library/react'
import type { Client } from '@simple-license/react-sdk'
import { WS_STATE_CONNECTED, WS_STATE_DISCONNECTED } from '@simple-license/react-sdk'
import { describe, expect, test, vi } from 'vitest'
const useHealthMetricsMock = vi.hoisted(() => vi.fn())
const useHealthWebSocketMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useHealthMetrics: useHealthMetricsMock,
    useHealthWebSocket: useHealthWebSocketMock,
  }
})
vi.mock('../../../src/hooks/useLiveData')

import {
  UI_HEALTH_METRICS_EMPTY_BODY,
  UI_HEALTH_METRICS_EMPTY_TITLE,
  UI_HEALTH_METRICS_ERROR_BODY,
  UI_HEALTH_METRICS_ERROR_TITLE,
  UI_HEALTH_METRICS_LOADING_BODY,
  UI_HEALTH_METRICS_LOADING_TITLE,
  UI_HEALTH_METRICS_TITLE,
} from '../../../src/ui/constants'
import { HealthMetricsPanel } from '../../../src/ui/workflows/HealthMetricsPanel'
import type { UseLiveDataResult } from '../../../src/hooks/useLiveData'
import { useLiveData } from '../../../src/hooks/useLiveData'

const createMockClient = () => ({}) as Client

type MetricsSource = {
  uptime: number | null
  memory: {
    rss: number | null
    heapTotal: number | null
    heapUsed: number | null
    external: number | null
  }
  cpu?: {
    user?: number | null
    system?: number | null
  }
}

type SocketResult = {
  connectionInfo: { state: typeof WS_STATE_CONNECTED | typeof WS_STATE_DISCONNECTED; connectedAt?: string; disconnectedAt?: string }
  connected: boolean
  lastMessage?: unknown
  error?: unknown
  requestHealth: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
  sendPing: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  reconnect: ReturnType<typeof vi.fn>
  healthMessage?: unknown
  healthData?: unknown
}

type LiveDataResult = UseLiveDataResult<unknown, SocketResult, MetricsSource | undefined>

const createSocketResult = (overrides: Partial<SocketResult> = {}): SocketResult => ({
  connectionInfo: { state: WS_STATE_DISCONNECTED },
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
    queryData: overrides.queryData,
    liveData: overrides.liveData,
    hasData: hasDataOverride,
    isLoading: overrides.isLoading ?? false,
    isError: overrides.isError ?? false,
    queryResult: {
      data: overrides.queryData,
      isLoading: Boolean(overrides.isLoading),
      isError: Boolean(overrides.isError),
      refetch: vi.fn(),
    } as unknown as LiveDataResult['queryResult'],
    socketResult,
    refresh: overrides.refresh ?? vi.fn(),
    ...overrides,
  }
}

describe('HealthMetricsPanel', () => {
  const useLiveDataMock = vi.mocked(useLiveData)
  beforeEach(() => {
    useHealthMetricsMock.mockReturnValue({
      data: { metrics: { uptime: 0, memory: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 }, cpu: { user: 0, system: 0 } } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useHealthWebSocketMock.mockReturnValue(createSocketResult())
  })

  test('renders health metrics summary', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: {
          uptime: 100,
          memory: {
            rss: 200,
            heapTotal: 300,
            heapUsed: 150,
            external: 50,
          },
          cpu: {
            user: 25,
            system: 10,
          },
        },
      }),
    )

    render(<HealthMetricsPanel client={client} />)

    expect(screen.getByText(UI_HEALTH_METRICS_TITLE)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        isLoading: true,
        hasData: false,
      }),
    )

    render(<HealthMetricsPanel client={client} />)

    expect(screen.getByText(UI_HEALTH_METRICS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        isError: true,
        hasData: false,
      }),
    )

    render(<HealthMetricsPanel client={client} />)

    expect(screen.getByText(UI_HEALTH_METRICS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when metrics missing', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        hasData: false,
      }),
    )

    render(<HealthMetricsPanel client={client} />)

    expect(screen.getByText(UI_HEALTH_METRICS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_EMPTY_BODY)).toBeInTheDocument()
  })
})

