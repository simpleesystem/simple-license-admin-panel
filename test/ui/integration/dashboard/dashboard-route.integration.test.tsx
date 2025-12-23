import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { DashboardRouteComponent } from '../../../../src/routes/dashboard/DashboardRoute'
import {
  UI_ANALYTICS_STATS_TITLE,
  UI_ANALYTICS_SUMMARY_DESCRIPTION,
  UI_ANALYTICS_SUMMARY_TITLE,
} from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'

const useSystemStatsMock = vi.hoisted(() => vi.fn())
const useAnalyticsSummaryMock = vi.hoisted(() => vi.fn())
const useUsageTrendsMock = vi.hoisted(() => vi.fn())
const useTopLicensesMock = vi.hoisted(() => vi.fn())
const useActivationDistributionMock = vi.hoisted(() => vi.fn())
const useAlertThresholdsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useSystemStats: useSystemStatsMock,
    useAnalyticsSummary: useAnalyticsSummaryMock,
    useUsageTrends: useUsageTrendsMock,
    useTopLicenses: useTopLicensesMock,
    useActivationDistribution: useActivationDistributionMock,
    useAlertThresholds: useAlertThresholdsMock,
  }
})

vi.mock('../../../../src/app/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../../../../src/app/auth/useAuth', () => ({
  useAuth: () => ({
    currentUser: { role: 'SUPERUSER', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
  }),
}))

describe('DashboardRouteComponent (integration)', () => {
  test('renders dashboard panels with live data and empty states', async () => {
    useSystemStatsMock.mockReturnValue({
      data: { stats: { active_licenses: 0, expired_licenses: 0, total_customers: 0, total_activations: 0 } },
      isLoading: false,
      isError: false,
    })
    useAnalyticsSummaryMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useUsageTrendsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useTopLicensesMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useActivationDistributionMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAlertThresholdsMock.mockReturnValue({
      data: { high: { activations: 0, validations: 0, concurrency: 0 }, medium: { activations: 0, validations: 0, concurrency: 0 } },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<DashboardRouteComponent />)

    expect(await screen.findByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_SUMMARY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_SUMMARY_DESCRIPTION)).toBeInTheDocument()
  })
})
