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

const createStats = () => ({
  stats: {
    active_licenses: 100,
    expired_licenses: 5,
    total_customers: 20,
    total_activations: 500,
  },
})

const createHealthSocketValue = (
  overrides: Partial<ReturnType<typeof useHealthWebSocketMock>> = {}
) => ({
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
  ...overrides,
})

describe('AnalyticsStatsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSystemStatsMock.mockReturnValue({
      data: createStats(),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useHealthWebSocketMock.mockReturnValue(createHealthSocketValue())
  })

  test('renders summary list when data available', () => {
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LABEL_ACTIVE)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LABEL_CUSTOMERS)).toBeInTheDocument()
  })

  test('shows loading alert when no data yet', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LOADING_BODY)).toBeInTheDocument()
  })

  test('shows error alert when both sources fail', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_ERROR_BODY)).toBeInTheDocument()
  })

  test('shows empty state when stats missing', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('allows manual refresh and triggers live request', () => {
    const refetch = vi.fn()
    const requestHealth = vi.fn()
    useSystemStatsMock.mockReturnValueOnce({
      data: createStats(),
      isLoading: false,
      isError: false,
      refetch,
    })
    useHealthWebSocketMock.mockReturnValueOnce(
      createHealthSocketValue({
        requestHealth,
        connectionInfo: { state: WS_STATE_CONNECTED, connectedAt: new Date().toISOString(), disconnectedAt: undefined },
      })
    )

    render(<AnalyticsStatsPanel client={{} as never} />)
    fireEvent.click(screen.getByRole('button', { name: UI_ANALYTICS_STATS_REFRESH_LABEL }))
    expect(refetch).toHaveBeenCalledTimes(1)
    expect(requestHealth).toHaveBeenCalledTimes(1)
  })

  test('uses live stats when API data unavailable', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useHealthWebSocketMock.mockReturnValueOnce(
      createHealthSocketValue({
        healthMessage: { type: 'health_update', timestamp: new Date().toISOString(), data: {} } as never,
        healthData: {
          stats: {
            active_licenses: 200,
            expired_licenses: 10,
            total_customers: 40,
            total_activations: 800,
          },
        },
      })
    )

    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
  })

  test('renders live status badge text', () => {
    useHealthWebSocketMock.mockReturnValueOnce(
      createHealthSocketValue({
        connectionInfo: { state: WS_STATE_CONNECTED, connectedAt: new Date().toISOString(), disconnectedAt: undefined },
      })
    )
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_LIVE_STATUS_CONNECTED)).toBeInTheDocument()
  })
})
