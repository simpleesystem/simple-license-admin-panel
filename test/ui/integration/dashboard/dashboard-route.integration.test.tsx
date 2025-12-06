import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { DashboardRouteComponent } from '../../../../src/routes/dashboard/DashboardRoute'
import {
  UI_ANALYTICS_STATS_TITLE,
  UI_ANALYTICS_SUMMARY_TITLE,
  UI_ANALYTICS_SUMMARY_DESCRIPTION,
} from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'

const useHealthWebSocketMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useHealthWebSocket: useHealthWebSocketMock,
  }
})

describe('DashboardRouteComponent (integration)', () => {
  test('renders dashboard panels with live data and empty states', async () => {
    useHealthWebSocketMock.mockReturnValue({
      connectionInfo: { state: 'open' },
      error: null,
      requestHealth: vi.fn(),
      healthData: undefined,
      healthMessage: undefined,
      send: vi.fn(),
      sendPing: vi.fn(),
      disconnect: vi.fn(),
      reconnect: vi.fn(),
    })

    renderWithProviders(<DashboardRouteComponent />)

    expect(await screen.findByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_SUMMARY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_SUMMARY_DESCRIPTION)).toBeInTheDocument()
  })
})

