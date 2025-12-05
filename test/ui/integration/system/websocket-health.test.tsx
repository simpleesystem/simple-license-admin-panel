import { faker } from '@faker-js/faker'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_SYSTEM_STATUS_TITLE } from '../../../../src/ui/constants'
import { SystemStatusPanel } from '../../../../src/ui/workflows/SystemStatusPanel'

const useHealthWebSocketMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useHealthWebSocket: useHealthWebSocketMock,
  }
})

describe('SystemStatusPanel websocket integration', () => {
  test('shows error then recovers on reconnect', async () => {
    const client = {} as never
    const vendorId = faker.string.uuid()

    useHealthWebSocketMock
      .mockReturnValueOnce({
        status: 'error',
        lastMessage: null,
        error: new Error('ws-down'),
      })
      .mockReturnValueOnce({
        status: 'open',
        lastMessage: { status: 'ok' },
        error: null,
      })

    const { rerender } = render(
      <SystemStatusPanel client={client} currentUser={{ role: 'SUPERUSER', vendorId }} onRefresh={vi.fn()} />,
    )

    await waitFor(() => {
      expect(screen.getByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
    })
    expect(screen.getByText(/error/i)).toBeInTheDocument()

    rerender(<SystemStatusPanel client={client} currentUser={{ role: 'SUPERUSER', vendorId }} onRefresh={vi.fn()} />)

    await waitFor(() => {
      expect(screen.queryByText(/error/i)).toBeNull()
    })
  })
})

