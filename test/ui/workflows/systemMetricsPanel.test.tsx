import { render, screen } from '@testing-library/react'
import type { Client, MetricValue, MetricsResponse } from '@simple-license/react-sdk'
import { WS_STATE_DISCONNECTED } from '@simple-license/react-sdk'
import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_SYSTEM_METRICS_EMPTY_BODY,
  UI_SYSTEM_METRICS_EMPTY_TITLE,
  UI_SYSTEM_METRICS_ERROR_BODY,
  UI_SYSTEM_METRICS_ERROR_TITLE,
  UI_SYSTEM_METRICS_LOADING_BODY,
  UI_SYSTEM_METRICS_LOADING_TITLE,
  UI_SYSTEM_METRICS_SECTION_APPLICATION,
  UI_SYSTEM_METRICS_SECTION_DATABASE,
  UI_SYSTEM_METRICS_SECTION_SYSTEM,
  UI_SYSTEM_METRICS_TITLE,
} from '../../../src/ui/constants'
import { SystemMetricsPanel } from '../../../src/ui/workflows/SystemMetricsPanel'
import type { UseLiveDataResult } from '../../../src/hooks/useLiveData'
import { useLiveData } from '../../../src/hooks/useLiveData'

vi.mock('../../../src/hooks/useLiveData')

const createMockClient = () => ({}) as Client

type LiveDataResult = UseLiveDataResult<MetricsResponse | undefined, ReturnType<typeof createSocketResult>, MetricsResponse | undefined>
type SocketResult = LiveDataResult['socketResult']

const createSocketResult = (overrides: Partial<SocketResult> = {}): SocketResult => ({
  connectionInfo: { state: WS_STATE_DISCONNECTED, connectedAt: undefined, disconnectedAt: undefined },
  error: undefined,
  requestHealth: vi.fn(),
  healthMessage: undefined,
  ...overrides,
})

const createLiveDataResult = (overrides: Partial<LiveDataResult> = {}): LiveDataResult => {
  const socketResult = overrides.socketResult ?? createSocketResult()
  const data = overrides.data
  const hasDataOverride = overrides.hasData ?? Boolean(data)

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
    } as LiveDataResult['queryResult'],
    socketResult,
    refresh: overrides.refresh ?? vi.fn(),
    ...overrides,
    socketResult,
    hasData: hasDataOverride,
  }
}

describe('SystemMetricsPanel', () => {
  const useLiveDataMock = vi.mocked(useLiveData)

  test('renders application and runtime sections', () => {
    const client = createMockClient()
    const cacheNodes = ['cache-a', 'cache-b']
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
        },
      }),
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
      }),
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
      }),
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
      }),
    )

    render(<SystemMetricsPanel client={client} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_BODY)).toBeInTheDocument()
  })
})

