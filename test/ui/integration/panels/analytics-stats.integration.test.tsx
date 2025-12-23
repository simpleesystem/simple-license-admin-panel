import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_ANALYTICS_STATS_REFRESH_LABEL, UI_ANALYTICS_STATS_TITLE, UI_USER_ROLE_SUPERUSER } from '../../../../src/ui/constants'
import { AnalyticsStatsPanel } from '../../../../src/ui/workflows/AnalyticsStatsPanel'
import { renderWithProviders } from '../../utils'
import { AdminSystemLiveFeedContext } from '../../../../src/app/live/AdminSystemLiveFeedContextDef'
import { ADMIN_SYSTEM_WS_STATUS_DISCONNECTED } from '../../../../src/app/constants'
import { buildUser } from '../../../factories/userFactory'

const useSystemStatsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useSystemStats: useSystemStatsMock,
  }
})

vi.mock('../../../../src/app/auth/useAuth', () => {
  const user = buildUser({ role: UI_USER_ROLE_SUPERUSER })
  return {
    useAuth: () => ({
      user,
      currentUser: user,
      isAuthenticated: true,
    }),
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

    const liveContextValue = {
        state: {
            connectionStatus: ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
            lastHealthUpdate: null,
            lastError: null,
        },
        requestHealth,
    }

    renderWithProviders(
        <AdminSystemLiveFeedContext.Provider value={liveContextValue}>
            <AnalyticsStatsPanel client={{} as never} title={UI_ANALYTICS_STATS_TITLE} />
        </AdminSystemLiveFeedContext.Provider>
    )

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

    renderWithProviders(<AnalyticsStatsPanel client={{} as never} />)

    expect(screen.getByText(/unable to load analytics/i)).toBeInTheDocument()
  })
})
