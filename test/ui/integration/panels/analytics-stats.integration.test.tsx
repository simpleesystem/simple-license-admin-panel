import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_ANALYTICS_STATS_REFRESH_LABEL, UI_ANALYTICS_STATS_TITLE, UI_USER_ROLE_SUPERUSER, UI_BADGE_VARIANT_SECONDARY, UI_LIVE_STATUS_DISCONNECTED } from '../../../../src/ui/constants'
import { AnalyticsStatsPanel } from '../../../../src/ui/workflows/AnalyticsStatsPanel'
import { renderWithProviders } from '../../utils'
import { buildUser } from '../../../factories/userFactory'

const useSystemStatsMock = vi.hoisted(() => vi.fn())
const mockUser = buildUser({ role: UI_USER_ROLE_SUPERUSER })
const mockRequestHealth = vi.fn()

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useSystemStats: useSystemStatsMock,
  }
})

vi.mock('../../../../src/app/auth/useAuth', () => {
  return {
    useAuth: () => ({
      user: mockUser,
      currentUser: mockUser,
      isAuthenticated: true,
    }),
  }
})

// Mock live feed hooks to avoid context dependency in this test
vi.mock('../../../../src/app/live/useAdminSystemLiveFeed', () => ({
  useAdminSystemLiveFeed: () => ({
    state: {},
    requestHealth: mockRequestHealth,
  }),
}))

vi.mock('../../../../src/app/live/useLiveStatusBadgeModel', () => ({
  useLiveStatusBadgeModel: () => ({
    text: UI_LIVE_STATUS_DISCONNECTED,
    variant: UI_BADGE_VARIANT_SECONDARY,
  }),
}))

describe('AnalyticsStatsPanel integration', () => {
  test('renders stats and triggers refresh (refetch + requestHealth)', async () => {
    const refetch = vi.fn()
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

    renderWithProviders(
        <AnalyticsStatsPanel client={{} as never} title={UI_ANALYTICS_STATS_TITLE} />
    )

    await waitFor(() => {
        expect(screen.getByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    })
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()

    fireEvent.click(screen.getByText(UI_ANALYTICS_STATS_REFRESH_LABEL))

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled()
      expect(mockRequestHealth).toHaveBeenCalled()
    })
  })

  test('shows error state when stats fail to load', async () => {
    useSystemStatsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderWithProviders(<AnalyticsStatsPanel client={{} as never} />)

    await waitFor(() => {
        expect(screen.getByText(/unable to load analytics/i)).toBeInTheDocument()
    })
  })
})
