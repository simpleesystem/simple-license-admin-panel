import { faker } from '@faker-js/faker'
import type { Client, MetricsResponse } from '@/simpleLicense'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_LIVE_STATUS_DISCONNECTED,
  UI_SYSTEM_METRICS_EMPTY_BODY,
  UI_SYSTEM_METRICS_EMPTY_TITLE,
  UI_SYSTEM_METRICS_ERROR_BODY,
  UI_SYSTEM_METRICS_ERROR_TITLE,
  UI_SYSTEM_METRICS_LOADING_BODY,
  UI_SYSTEM_METRICS_LOADING_TITLE,
  UI_SYSTEM_METRICS_REFRESH_LABEL,
  UI_SYSTEM_METRICS_SECTION_APPLICATION,
  UI_SYSTEM_METRICS_SECTION_DATABASE,
  UI_SYSTEM_METRICS_SECTION_SYSTEM,
  UI_SYSTEM_METRICS_TITLE,
} from '../../../src/ui/constants'
import { SystemMetricsPanel } from '../../../src/ui/workflows/SystemMetricsPanel'
import { AdminSystemLiveFeedContext } from '../../../src/app/live/AdminSystemLiveFeedContextDef'
import { ADMIN_SYSTEM_WS_STATUS_DISCONNECTED } from '../../../src/app/constants'
import { buildUser } from '../../factories/userFactory'

const useSystemMetricsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useSystemMetrics: useSystemMetricsMock,
  }
})

vi.mock('../../../src/app/auth/useAuth', () => ({
  useAuth: () => ({
    currentUser: buildUser({ role: 'SUPERUSER' }),
    isAuthenticated: true,
  }),
}))

const createMockClient = () => ({}) as Client

const createMetrics = (): MetricsResponse => ({
  timestamp: new Date().toISOString(),
  application: {
    version: faker.system.semver(),
    environment: faker.helpers.arrayElement(['development', 'production']),
  },
  system: {
    uptime: 3600,
    memory: {
      rss: 2048,
      heapTotal: 1024,
      heapUsed: 512,
      external: 256,
    },
    cpu: {
      user: 30,
      system: 15,
    },
  },
  database: { nodes: 2 } as unknown as MetricsResponse['database'],
  cache: { nodes: 2 } as unknown as MetricsResponse['cache'],
  security: undefined,
  tenants: undefined,
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
  return render(
    <AdminSystemLiveFeedContext.Provider value={mockLiveContext}>
      {ui}
    </AdminSystemLiveFeedContext.Provider>
  )
}

describe('SystemMetricsPanel', () => {
  beforeEach(() => {
    useSystemMetricsMock.mockReturnValue({
      data: createMetrics(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  test('renders application and runtime sections', () => {
    renderWithContext(<SystemMetricsPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_SECTION_APPLICATION)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_SECTION_SYSTEM)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_SECTION_DATABASE)).toBeInTheDocument()
    expect(screen.getByText(UI_LIVE_STATUS_DISCONNECTED)).toBeInTheDocument()
  })

  test('renders loading state', () => {
    useSystemMetricsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithContext(<SystemMetricsPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    useSystemMetricsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderWithContext(<SystemMetricsPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when metrics are missing', () => {
    useSystemMetricsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithContext(<SystemMetricsPanel client={createMockClient()} />)

    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_EMPTY_BODY)).toBeInTheDocument()
  })

  test('formats array metric values and triggers refresh', () => {
    const refetch = vi.fn()
    useSystemMetricsMock.mockReturnValueOnce({
      data: {
        ...createMetrics(),
        cache: { nodes: [1, 2, 3] } as unknown as MetricsResponse['cache'],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    })

    renderWithContext(<SystemMetricsPanel client={createMockClient()} />)

    expect(screen.getByText('1, 2, 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: UI_SYSTEM_METRICS_REFRESH_LABEL }))
    expect(refetch).toHaveBeenCalled()
  })
})
