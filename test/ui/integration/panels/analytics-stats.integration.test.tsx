import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_ANALYTICS_STATS_REFRESH_LABEL, UI_ANALYTICS_STATS_TITLE } from '../../../../src/ui/constants'
import { AnalyticsStatsPanel } from '../../../../src/ui/workflows/AnalyticsStatsPanel'
import { renderWithProviders } from '../../utils'

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

describe('AnalyticsStatsPanel integration', () => {
  test('renders stats and triggers refresh (refetch + requestHealth)', async () => {
    const refetch = vi.fn()
    const requestHealth = vi.fn()
    useSystemStatsMock.mockReturnValue({
      data: {
        stats: {
          active_licenses: 5,
          expired_licenses: 2,
          total_customers: 3,
          total_activations: 7,
        },
      },
      isLoading: false,
      isError: false,
      refetch,
    })
    useHealthWebSocketMock.mockReturnValue({
      connectionInfo: { state: 'open' },
      error: null,
      requestHealth,
      healthData: { stats: undefined },
    })

    renderWithProviders(<AnalyticsStatsPanel client={{} as never} title={UI_ANALYTICS_STATS_TITLE} />)

    expect(screen.getByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()

    fireEvent.click(screen.getByText(UI_ANALYTICS_STATS_REFRESH_LABEL))

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled()
      expect(requestHealth).toHaveBeenCalled()
    })
  })

  test('shows error state when stats fail to load', () => {
    useSystemStatsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    useHealthWebSocketMock.mockReturnValue({
      connectionInfo: { state: 'error' },
      error: new Error('ws-error'),
      requestHealth: vi.fn(),
      healthData: undefined,
    })

    renderWithProviders(<AnalyticsStatsPanel client={{} as never} />)

    expect(screen.getByText(/unable to load analytics/i)).toBeInTheDocument()
  })
})

