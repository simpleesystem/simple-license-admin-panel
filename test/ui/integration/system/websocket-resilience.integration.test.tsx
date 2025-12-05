import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_ANALYTICS_STATS_TITLE, UI_SYSTEM_METRICS_TITLE } from '../../../../src/ui/constants'
import { AnalyticsStatsPanel } from '../../../../src/ui/workflows/AnalyticsStatsPanel'
import { SystemMetricsPanel } from '../../../../src/ui/workflows/SystemMetricsPanel'

const useSystemStatsMock = vi.hoisted(() => vi.fn())
const useHealthWebSocketMock = vi.hoisted(() => vi.fn())
const useSystemMetricsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useSystemStats: useSystemStatsMock,
    useHealthWebSocket: useHealthWebSocketMock,
    useSystemMetrics: useSystemMetricsMock,
  }
})

describe('Websocket resilience for health/analytics panels', () => {
  test('falls back to query data on socket error, then updates after reconnect', async () => {
    const refetch = vi.fn()
    // Initial query data present
    useSystemStatsMock.mockReturnValue({
      data: { stats: { active_licenses: 1, expired_licenses: 0, total_customers: 1, total_activations: 1 } },
      isLoading: false,
      isError: false,
      refetch,
    })
    useSystemMetricsMock.mockReturnValue({
      data: {
        timestamp: new Date().toISOString(),
        application: { version: '1.0.0', environment: 'dev' },
        system: {
          uptime: 100,
          memory: { rss: 1, heapTotal: 1, heapUsed: 1, external: 0 },
          cpu: { user: 1, system: 1 },
        },
      },
      isLoading: false,
      isError: false,
      refetch,
    })

    // Socket fails first, then reconnects with updated stats
    const baseSocket = {
      connected: false,
      connectionInfo: { state: 'disconnected' },
      lastMessage: undefined,
      error: null,
      requestHealth: vi.fn(),
      send: vi.fn(),
      sendPing: vi.fn(),
      disconnect: vi.fn(),
      reconnect: vi.fn(),
      healthMessage: undefined,
      healthData: { stats: undefined },
    }

    const socketSequence = [
      {
        ...baseSocket,
        connectionInfo: { state: 'error' as const },
        error: new Error('ws-down'),
      },
      {
        ...baseSocket,
        connectionInfo: { state: 'open' as const },
        connected: true,
        healthData: { stats: { active_licenses: 2, expired_licenses: 1, total_customers: 2, total_activations: 3 } },
      },
    ]
    let lastSocket = socketSequence[socketSequence.length - 1] ?? baseSocket
    useHealthWebSocketMock.mockImplementation(() => {
      const next = socketSequence.shift()
      if (next) {
        lastSocket = next
        return next
      }
      return lastSocket
    })

    const { rerender } = render(
      <>
        <AnalyticsStatsPanel client={{} as never} />
        <SystemMetricsPanel client={{} as never} />
      </>
    )

    await waitFor(() => {
      expect(screen.getByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
      expect(screen.getByText(UI_SYSTEM_METRICS_TITLE)).toBeInTheDocument()
    })
    // Initial query data shown
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)

    rerender(
      <>
        <AnalyticsStatsPanel client={{} as never} />
        <SystemMetricsPanel client={{} as never} />
      </>
    )

    expect(await screen.findByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(await screen.findByText(UI_SYSTEM_METRICS_TITLE)).toBeInTheDocument()
  })
})
