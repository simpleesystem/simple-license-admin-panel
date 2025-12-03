import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { AnalyticsStatsPanel } from '../../../src/ui/workflows/AnalyticsStatsPanel'

const useSystemStatsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useSystemStats: useSystemStatsMock,
  }
})

const createStats = () => ({
  stats: {
    active_licenses: 100,
    expired_licenses: 5,
    total_customers: 20,
    total_activations: 500,
  },
})

describe('AnalyticsStatsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSystemStatsMock.mockReturnValue({
      data: createStats(),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  test('renders summary list when data available', () => {
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText('Active licenses')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Customers')).toBeInTheDocument()
  })

  test('shows loading alert', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText('Loading system stats')).toBeInTheDocument()
  })

  test('shows error alert', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText('Unable to load analytics')).toBeInTheDocument()
  })

  test('shows empty state when stats missing', () => {
    useSystemStatsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    render(<AnalyticsStatsPanel client={{} as never} />)
    expect(screen.getByText('No analytics data yet')).toBeInTheDocument()
  })

  test('allows manual refresh', () => {
    const refetch = vi.fn()
    useSystemStatsMock.mockReturnValueOnce({
      data: createStats(),
      isLoading: false,
      isError: false,
      refetch,
    })
    render(<AnalyticsStatsPanel client={{} as never} />)
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(refetch).toHaveBeenCalled()
  })
})


