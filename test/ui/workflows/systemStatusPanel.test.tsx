import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Client } from '@/simpleLicense'
import { ADMIN_SYSTEM_WS_STATUS_DISCONNECTED } from '../../../src/app/constants'
import { AdminSystemLiveFeedContext } from '../../../src/app/live/AdminSystemLiveFeedContextDef'
import {
  UI_LIVE_STATUS_DISCONNECTED,
  UI_SYSTEM_STATUS_EMPTY_BODY,
  UI_SYSTEM_STATUS_EMPTY_TITLE,
  UI_SYSTEM_STATUS_ERROR_BODY,
  UI_SYSTEM_STATUS_ERROR_TITLE,
  UI_SYSTEM_STATUS_LABEL_DATABASE,
  UI_SYSTEM_STATUS_LABEL_LAST_CHECKED,
  UI_SYSTEM_STATUS_LABEL_STATUS,
  UI_SYSTEM_STATUS_LOADING_BODY,
  UI_SYSTEM_STATUS_LOADING_TITLE,
  UI_SYSTEM_STATUS_REFRESH_LABEL,
  UI_SYSTEM_STATUS_TITLE,
  UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED,
  UI_SYSTEM_STATUS_VALUE_HEALTHY,
} from '../../../src/ui/constants'
import { SystemStatusPanel } from '../../../src/ui/workflows/SystemStatusPanel'
import { buildUser } from '../../factories/userFactory'

const useServerStatusMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useServerStatus: useServerStatusMock,
  }
})

vi.mock('../../../src/app/auth/useAuth', () => ({
  useAuth: () => ({
    currentUser: buildUser({ role: 'SUPERUSER' }),
    isAuthenticated: true,
  }),
}))

const createMockClient = () => ({}) as Client

const createStatus = () => ({
  status: 'healthy',
  timestamp: '2024-01-01T00:00:00.000Z',
  checks: {
    database: UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED,
  },
})

const mockLiveContext = {
  state: {
    connectionStatus: ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
    lastHealthUpdate: null,
    lastError: null,
  },
  requestHealth: vi.fn(),
}

const renderWithContext = (ui: React.ReactElement) => {
  return render(<AdminSystemLiveFeedContext.Provider value={mockLiveContext}>{ui}</AdminSystemLiveFeedContext.Provider>)
}

describe('SystemStatusPanel', () => {
  beforeEach(() => {
    useServerStatusMock.mockReturnValue({
      data: createStatus(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  test('renders system status summary', () => {
    renderWithContext(<SystemStatusPanel client={createMockClient()} />)
    expect(screen.getByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_VALUE_HEALTHY)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_LABEL_STATUS)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_LABEL_LAST_CHECKED)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_LABEL_DATABASE)).toBeInTheDocument()
    expect(screen.getByText(UI_LIVE_STATUS_DISCONNECTED)).toBeInTheDocument()
  })

  test('renders loading state', () => {
    useServerStatusMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithContext(<SystemStatusPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    useServerStatusMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderWithContext(<SystemStatusPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when no status data exists', () => {
    useServerStatusMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithContext(<SystemStatusPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_STATUS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_STATUS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('allows manual refresh', () => {
    const refetch = vi.fn()
    useServerStatusMock.mockReturnValueOnce({
      data: createStatus(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    })

    renderWithContext(<SystemStatusPanel client={createMockClient()} />)
    fireEvent.click(screen.getByRole('button', { name: UI_SYSTEM_STATUS_REFRESH_LABEL }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
