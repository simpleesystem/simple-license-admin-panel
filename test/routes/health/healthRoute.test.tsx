import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiContext } from '@/api/apiContext'

import { AppConfigProvider } from '@/app/config'
import { I18N_KEY_HEALTH_HEADING } from '@/app/constants'
import { I18nProvider } from '@/app/i18n/I18nProvider'
import { i18nResources } from '@/app/i18n/resources'
import { HealthRouteComponent } from '@/routes/health/HealthRoute'
import type { Client } from '@/simpleLicense'

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
  it('renders health header and all monitoring panels', async () => {
    const client = {
      getHealthSnapshot: async () => ({
        status: { status: 'healthy', timestamp: new Date().toISOString(), checks: { database: 'ok' } },
        health: {
          metrics: {
            uptime: 1,
            memory: { rss: 1, heapTotal: 1, heapUsed: 1, external: 1 },
            cpu: { user: 1, system: 1 },
          },
        },
        metrics: {
          timestamp: new Date().toISOString(),
          application: { version: 'test', environment: 'test' },
          system: {
            uptime: 1,
            memory: { rss: 1, heapTotal: 1, heapUsed: 1, external: 1 },
            cpu: { user: 1, system: 1 },
          },
        },
      }),
    } as unknown as Client
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
      </AppConfigProvider>
    )

    expect(screen.getByRole('heading', { name: HEALTH_HEADING })).toBeInTheDocument()
    expect(await screen.findByTestId('system-status-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('health-metrics-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('system-metrics-panel')).toBeInTheDocument()
  })
})
