import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Client } from '@simple-license/react-sdk'
import { WS_STATE_DISCONNECTED } from '@simple-license/react-sdk'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
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

describe('HealthMetricsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useHealthWebSocketMock.mockReturnValue(createHealthSocketValue())
  })

  test('renders health metrics summary', () => {
    const client = createMockClient()
    useHealthMetricsMock.mockReturnValue({
      data: {
        metrics: {
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
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<HealthMetricsPanel client={client} />, client)

    expect(screen.getByText(UI_HEALTH_METRICS_TITLE)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useHealthMetricsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<HealthMetricsPanel client={client} />, client)

    expect(screen.getByText(UI_HEALTH_METRICS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useHealthMetricsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderWithProviders(<HealthMetricsPanel client={client} />, client)

    expect(screen.getByText(UI_HEALTH_METRICS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when metrics missing', () => {
    const client = createMockClient()
    useHealthMetricsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<HealthMetricsPanel client={client} />, client)

    expect(screen.getByText(UI_HEALTH_METRICS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_EMPTY_BODY)).toBeInTheDocument()
  })
})

