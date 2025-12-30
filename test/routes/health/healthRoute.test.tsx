import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import type { Client } from '@/simpleLicense'

import { AppConfigProvider } from '@/app/config'
import { I18nProvider } from '@/app/i18n/I18nProvider'
import { i18nResources } from '@/app/i18n/resources'
import { I18N_KEY_HEALTH_HEADING } from '@/app/constants'
import { ApiContext } from '@/api/apiContext'
import { HealthRouteComponent } from '@/routes/health/HealthRoute'

const HEALTH_HEADING = i18nResources.common[I18N_KEY_HEALTH_HEADING]

vi.mock('@/ui/workflows/SystemStatusPanel', () => ({
  SystemStatusPanel: () => <div data-testid="system-status-panel" />,
}))

vi.mock('@/ui/workflows/HealthMetricsPanel', () => ({
  HealthMetricsPanel: () => <div data-testid="health-metrics-panel" />,
}))

vi.mock('@/ui/workflows/SystemMetricsPanel', () => ({
  SystemMetricsPanel: () => <div data-testid="system-metrics-panel" />,
}))

describe('HealthRouteComponent', () => {
  it('renders health header and all monitoring panels', () => {
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
              <HealthRouteComponent />
            </ApiContext.Provider>
          </I18nProvider>
        </QueryClientProvider>
      </AppConfigProvider>,
    )

    expect(screen.getByRole('heading', { name: HEALTH_HEADING })).toBeInTheDocument()
    expect(screen.getByTestId('system-status-panel')).toBeInTheDocument()
    expect(screen.getByTestId('health-metrics-panel')).toBeInTheDocument()
    expect(screen.getByTestId('system-metrics-panel')).toBeInTheDocument()
  })
})
