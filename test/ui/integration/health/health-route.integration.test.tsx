import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { HealthRouteComponent } from '../../../../src/routes/health/HealthRoute'
import {
  UI_HEALTH_METRICS_TITLE,
  UI_SYSTEM_METRICS_TITLE,
  UI_SYSTEM_STATUS_TITLE,
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

describe('HealthRouteComponent (integration)', () => {
  test('renders live health panels with server data', async () => {
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

    renderWithProviders(<HealthRouteComponent />)

    expect(await screen.findByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_TITLE)).toBeInTheDocument()
  })
})

