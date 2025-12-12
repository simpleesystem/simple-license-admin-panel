import type { Client } from '@simple-license/react-sdk'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_HEALTH_METRICS_EMPTY_BODY,
  UI_HEALTH_METRICS_EMPTY_TITLE,
  UI_HEALTH_METRICS_ERROR_BODY,
  UI_HEALTH_METRICS_ERROR_TITLE,
  UI_HEALTH_METRICS_LOADING_BODY,
  UI_HEALTH_METRICS_LOADING_TITLE,
  UI_HEALTH_METRICS_REFRESH_LABEL,
  UI_HEALTH_METRICS_TITLE,
  UI_LIVE_STATUS_DISCONNECTED,
} from '../../../src/ui/constants'
import { HealthMetricsPanel } from '../../../src/ui/workflows/HealthMetricsPanel'
import { AdminSystemLiveFeedContext } from '../../../src/app/live/AdminSystemLiveFeedContext'
import { ADMIN_SYSTEM_WS_STATUS_DISCONNECTED } from '../../../src/app/constants'

const useHealthMetricsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useHealthMetrics: useHealthMetricsMock,
  }
})

const createMockClient = () => ({}) as Client

const createMetrics = () => ({
  metrics: {
    uptime: 100,
    memory: { rss: 200, heapTotal: 300, heapUsed: 150, external: 50 },
    cpu: { user: 25, system: 10 },
  },
})

const mockLiveContext = {
  state: {
    connectionStatus: ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
    lastHealthUpdate: null,
    lastError: null,
  },
  requestHealth: vi.fn(),
}

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <AdminSystemLiveFeedContext.Provider value={mockLiveContext}>
      {ui}
    </AdminSystemLiveFeedContext.Provider>
  )
}

describe('HealthMetricsPanel', () => {
  beforeEach(() => {
    useHealthMetricsMock.mockReturnValue({
      data: createMetrics(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  test('renders health metrics summary', () => {
    renderWithContext(<HealthMetricsPanel client={createMockClient()} />)
    expect(screen.getByText(UI_HEALTH_METRICS_TITLE)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText(UI_LIVE_STATUS_DISCONNECTED)).toBeInTheDocument()
  })

  test('renders loading state', () => {
    useHealthMetricsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithContext(<HealthMetricsPanel client={createMockClient()} />)

    expect(screen.getByText(UI_HEALTH_METRICS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    useHealthMetricsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderWithContext(<HealthMetricsPanel client={createMockClient()} />)

    expect(screen.getByText(UI_HEALTH_METRICS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when metrics missing', () => {
    useHealthMetricsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithContext(<HealthMetricsPanel client={createMockClient()} />)

    expect(screen.getByText(UI_HEALTH_METRICS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('allows manual refresh', () => {
    const refetch = vi.fn()
    useHealthMetricsMock.mockReturnValueOnce({
      data: createMetrics(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    })
    renderWithContext(<HealthMetricsPanel client={createMockClient()} />)
    fireEvent.click(screen.getByRole('button', { name: UI_HEALTH_METRICS_REFRESH_LABEL }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
