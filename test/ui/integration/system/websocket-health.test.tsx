import { faker } from '@faker-js/faker'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_SYSTEM_STATUS_TITLE } from '../../../../src/ui/constants'
import { SystemStatusPanel } from '../../../../src/ui/workflows/SystemStatusPanel'

const useHealthWebSocketMock = vi.hoisted(() => vi.fn())
const useServerStatusMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useHealthWebSocket: useHealthWebSocketMock,
    useServerStatus: useServerStatusMock,
  }
})

describe('SystemStatusPanel websocket integration', () => {
  test('shows error then recovers on reconnect', async () => {
    const client = {} as never
    const vendorId = faker.string.uuid()

    const baseSocket = {
      connected: false,
      connectionInfo: { state: 'disconnected' as const },
      lastMessage: undefined,
      error: null,
      requestHealth: vi.fn(),
      send: vi.fn(),
      sendPing: vi.fn(),
      disconnect: vi.fn(),
      reconnect: vi.fn(),
      healthMessage: undefined,
      healthData: undefined,
    }

    useServerStatusMock
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          checks: { database: 1 },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      })

    useHealthWebSocketMock
      .mockReturnValueOnce({
        ...baseSocket,
        connectionInfo: { state: 'error' as const },
        error: new Error('ws-down'),
      })
      .mockReturnValueOnce({
        ...baseSocket,
        connectionInfo: { state: 'open' as const },
        connected: true,
        healthData: { stats: { active_licenses: 1, expired_licenses: 0, total_customers: 1, total_activations: 1 } },
      })

    const { rerender } = render(
      <SystemStatusPanel client={client} currentUser={{ role: 'SUPERUSER', vendorId }} onRefresh={vi.fn()} />,
    )

    await waitFor(() => {
      expect(screen.getByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
      expect(screen.getByText(/Unable to load system status/i)).toBeInTheDocument()
    })

    rerender(<SystemStatusPanel client={client} currentUser={{ role: 'SUPERUSER', vendorId }} onRefresh={vi.fn()} />)

    await waitFor(() => {
      expect(screen.queryByText(/Unable to load system status/i)).toBeNull()
    })
  })
})

