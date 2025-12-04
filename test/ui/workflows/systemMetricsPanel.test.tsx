import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Client, MetricValue } from '@simple-license/react-sdk'
import { WS_STATE_DISCONNECTED } from '@simple-license/react-sdk'
import { faker } from '@faker-js/faker'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
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

const createMockClient = () => ({}) as Client

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

const createHealthSocketValue = () => ({
  connected: false,
  connectionInfo: { state: WS_STATE_DISCONNECTED, connectedAt: undefined, disconnectedAt: undefined },
  error: undefined,
  healthData: undefined,
  healthMessage: undefined,
  lastMessage: undefined,
  requestHealth: vi.fn(),
  send: vi.fn(),
  sendPing: vi.fn(),
  disconnect: vi.fn(),
  reconnect: vi.fn(),
})

describe('SystemMetricsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useHealthWebSocketMock.mockReturnValue(createHealthSocketValue())
  })

  test('renders application and runtime sections', () => {
    const client = createMockClient()
    const cacheNodes = ['cache-a', 'cache-b']
    useSystemMetricsMock.mockReturnValue({
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
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemMetricsPanel client={client} />, client)

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
    useSystemMetricsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemMetricsPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_METRICS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useSystemMetricsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemMetricsPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_METRICS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when metrics are missing', () => {
    const client = createMockClient()
    useSystemMetricsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemMetricsPanel client={client} />, client)

    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_BODY)).toBeInTheDocument()
  })
})

