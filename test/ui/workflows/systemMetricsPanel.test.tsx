import { faker } from '@faker-js/faker'
import type { Client, MetricsResponse, MetricValue } from '@simple-license/react-sdk'
import { WS_STATE_DISCONNECTED } from '@simple-license/react-sdk'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const useSystemMetricsMock = vi.hoisted(() => vi.fn())
const useHealthWebSocketMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useSystemMetrics: useSystemMetricsMock,
    useHealthWebSocket: useHealthWebSocketMock,
  }
})
vi.mock('../../../src/hooks/useLiveData')

import type { UseLiveDataResult } from '../../../src/hooks/useLiveData'
import { useLiveData } from '../../../src/hooks/useLiveData'
import {
  UI_SYSTEM_METRICS_EMPTY_BODY,
  UI_SYSTEM_METRICS_EMPTY_TITLE,
  UI_SYSTEM_METRICS_ERROR_BODY,
  UI_SYSTEM_METRICS_ERROR_TITLE,
  UI_SYSTEM_METRICS_LOADING_BODY,
  UI_SYSTEM_METRICS_LOADING_TITLE,
  UI_SYSTEM_METRICS_REFRESH_LABEL,
  UI_SYSTEM_METRICS_SECTION_APPLICATION,
  UI_SYSTEM_METRICS_SECTION_DATABASE,
  UI_SYSTEM_METRICS_SECTION_SYSTEM,
  UI_SYSTEM_METRICS_TITLE,
} from '../../../src/ui/constants'
import { SystemMetricsPanel } from '../../../src/ui/workflows/SystemMetricsPanel'

const createMockClient = () => ({}) as Client

type SocketResult = ReturnType<typeof createSocketResult>
type LiveDataResult = UseLiveDataResult<MetricsResponse | undefined, SocketResult, MetricsResponse | undefined>

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
  const data = overrides.data
  const hasDataOverride =
    overrides.hasData ??
    Boolean(
      (data !== undefined && data !== null) ||
        (overrides.queryData !== undefined && overrides.queryData !== null) ||
        (overrides.liveData !== undefined && overrides.liveData !== null)
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
    refresh: overrides.refresh ?? vi.fn(),
    socketResult,
    ...overrides,
  }
}

describe('SystemMetricsPanel', () => {
  const useLiveDataMock = vi.mocked(useLiveData)
  beforeEach(() => {
    useSystemMetricsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useHealthWebSocketMock.mockReturnValue(createSocketResult())
  })

  test('renders application and runtime sections', () => {
    const client = createMockClient()
    const cacheNodes = ['cache-a', 'cache-b']
    const metricsData: MetricsResponse = {
      timestamp: new Date().toISOString(),
      application: {
        version: faker.system.semver(),
        environment: faker.helpers.arrayElement(['development', 'production']),
      },
      system: {
        uptime: 3600,
        memory: {
          rss: 2048,
          heapTotal: 1024,
          heapUsed: 512,
          external: 256,
        },
        cpu: {
          user: 30,
          system: 15,
        },
      },
      database: { nodes: cacheNodes.length },
      cache: {
        nodes: cacheNodes.length,
      },
      security: undefined,
      tenants: undefined,
    } as unknown as MetricsResponse
    useSystemMetricsMock.mockReturnValue({
      data: metricsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useHealthWebSocketMock.mockReturnValue(createSocketResult())
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: {
          timestamp: new Date().toISOString(),
          application: {
            version: faker.system.semver(),
            environment: faker.helpers.arrayElement(['development', 'production']),
          },
          system: {
            uptime: 3600,
            memory: {
              rss: 2048,
              heapTotal: 1024,
              heapUsed: 512,
              external: 256,
            },
            cpu: {
              user: 40,
              system: 20,
            },
          },
          database: {
            status: 'ok',
          },
          cache: {
            nodes: cacheNodes,
          },
          security: {
            warnings: 2,
            certificate: { expires: 'soon' } as unknown as MetricValue,
          },
          tenants: {
            active: 5,
            archived: null,
          },
        } as unknown as MetricsResponse,
      })
    )

    render(<SystemMetricsPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_SECTION_APPLICATION)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_SECTION_SYSTEM)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_SECTION_DATABASE)).toBeInTheDocument()
    expect(screen.getByText(cacheNodes.join(', '))).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('{"expires":"soon"}')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        isLoading: true,
        hasData: false,
      })
    )

    render(<SystemMetricsPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        isError: true,
        hasData: false,
      })
    )

    render(<SystemMetricsPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when metrics are missing', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: undefined,
        hasData: false,
      })
    )

    render(<SystemMetricsPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('renders empty state when metrics exist but no sections after filtering', () => {
    const client = createMockClient()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: {
          timestamp: undefined,
          application: undefined,
          system: undefined,
          database: undefined,
          cache: undefined,
          security: undefined,
          tenants: undefined,
        },
        hasData: true,
        isLoading: false,
        isError: false,
      })
    )

    render(<SystemMetricsPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('formats array metric values and triggers refresh', () => {
    const client = createMockClient()
    const refresh = vi.fn()
    useLiveDataMock.mockReturnValueOnce(
      createLiveDataResult({
        data: {
          timestamp: new Date().toISOString(),
          application: { version: '1.0.0', environment: 'prod' },
          system: {
            uptime: 10,
            memory: { rss: 1, heapTotal: 1, heapUsed: 1, external: 1 },
            cpu: { user: 1, system: 1 },
          },
          database: undefined,
          cache: { nodes: [1, 2, 3] },
          security: undefined,
          tenants: undefined,
        },
        hasData: true,
        isLoading: false,
        isError: false,
        refresh,
      })
    )

    render(<SystemMetricsPanel client={client} />)

    expect(screen.getByText('1, 2, 3')).toBeInTheDocument()
    screen.getByRole('button', { name: UI_SYSTEM_METRICS_REFRESH_LABEL }).click()
    expect(refresh).toHaveBeenCalled()
  })
})
