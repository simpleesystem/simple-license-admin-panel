import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ADMIN_SYSTEM_WS_STATUS_DISCONNECTED } from '../../../src/app/constants'
import { AdminSystemLiveFeedContext } from '../../../src/app/live/AdminSystemLiveFeedContextDef'
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
  UI_LIVE_STATUS_DISCONNECTED,
} from '../../../src/ui/constants'
import { AnalyticsStatsPanel } from '../../../src/ui/workflows/AnalyticsStatsPanel'

const useSystemStatsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useSystemStats: useSystemStatsMock,
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

const mockLiveContext = {
  state: {
    connectionStatus: ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
    lastHealthUpdate: null,
    lastError: null,
  },
  requestHealth: vi.fn(),
}

const renderWithContext = (ui: React.ReactElement) => {
  return render(<AdminSystemLiveFeedContext.Provider value={mockLiveContext}>{ui}</AdminSystemLiveFeedContext.Provider>)
}

describe('AnalyticsStatsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSystemStatsMock.mockReturnValue({
      data: createStats(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  test('renders summary list when data available', () => {
    renderWithContext(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LABEL_ACTIVE)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LABEL_CUSTOMERS)).toBeInTheDocument()
    expect(screen.getByText(UI_LIVE_STATUS_DISCONNECTED)).toBeInTheDocument()
  })

  test('shows loading alert when no data yet', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
    renderWithContext(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_LOADING_BODY)).toBeInTheDocument()
  })

  test('shows error alert when request fails without data', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: vi.fn(),
    })
    renderWithContext(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_ERROR_BODY)).toBeInTheDocument()
  })

  test('shows empty state when stats missing', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
    renderWithContext(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_STATS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_STATS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('allows manual refresh', () => {
    const refetch = vi.fn()
    useSystemStatsMock.mockReturnValueOnce({
      data: createStats(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    })
    renderWithContext(<AnalyticsStatsPanel client={{} as never} />)
    fireEvent.click(screen.getByRole('button', { name: UI_ANALYTICS_STATS_REFRESH_LABEL }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
