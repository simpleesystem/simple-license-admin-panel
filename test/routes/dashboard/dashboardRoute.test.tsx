import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiContext } from '@/api/apiContext'

import { AppConfigProvider } from '@/app/config'
import { I18N_KEY_DASHBOARD_HEADING } from '@/app/constants'
import { I18nProvider } from '@/app/i18n/I18nProvider'
import { i18nResources } from '@/app/i18n/resources'
import { DashboardRouteComponent } from '@/routes/dashboard/DashboardRoute'
import type { Client } from '@/simpleLicense'

const DASHBOARD_HEADING = i18nResources.common[I18N_KEY_DASHBOARD_HEADING]

vi.mock('@/simpleLicense', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/simpleLicense')>()
  return {
    ...actual,
    useDashboardSnapshot: vi.fn(() => ({
      data: undefined,
      isError: true,
    })),
  }
})

vi.mock('@/ui/workflows/AnalyticsStatsPanel', () => ({
  AnalyticsStatsPanel: () => <div data-testid="analytics-stats-panel" />,
}))

vi.mock('@/ui/workflows/UsageSummaryPanel', () => ({
  UsageSummaryPanel: () => <div data-testid="usage-summary-panel" />,
}))

vi.mock('@/ui/workflows/UsageTrendsPanel', () => ({
  UsageTrendsPanel: () => <div data-testid="usage-trends-panel" />,
}))

vi.mock('@/ui/workflows/TopLicensesPanel', () => ({
  TopLicensesPanel: () => <div data-testid="top-licenses-panel" />,
}))

vi.mock('@/ui/workflows/ActivationDistributionPanel', () => ({
  ActivationDistributionPanel: () => <div data-testid="activation-distribution-panel" />,
}))

vi.mock('@/ui/workflows/AlertThresholdsPanel', () => ({
  AlertThresholdsPanel: () => <div data-testid="alert-thresholds-panel" />,
}))

describe('DashboardRouteComponent', () => {
  it('renders dashboard header and all analytics panels', async () => {
    const client = {} as Client
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    render(
      <AppConfigProvider>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <ApiContext.Provider value={client}>
              <DashboardRouteComponent />
            </ApiContext.Provider>
          </I18nProvider>
        </QueryClientProvider>
      </AppConfigProvider>
    )

    expect(screen.getByRole('heading', { name: DASHBOARD_HEADING })).toBeInTheDocument()
    expect(await screen.findByTestId('analytics-stats-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('usage-summary-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('usage-trends-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('top-licenses-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('activation-distribution-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('alert-thresholds-panel')).toBeInTheDocument()
  })
})
