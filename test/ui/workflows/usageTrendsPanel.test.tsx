import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { UsageTrendsPanel } from '../../../src/ui/workflows/UsageTrendsPanel'

const useUsageTrendsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useUsageTrends: useUsageTrendsMock,
  }
})

const createTrends = () => ({
  periodStart: '2024-01-01',
  periodEnd: '2024-02-01',
  groupBy: 'day',
  trends: [
    {
      period: '2024-01-01',
      totalActivations: 10,
      totalValidations: 8,
      totalUsageReports: 3,
      uniqueDomains: 2,
      uniqueIPs: 3,
      peakConcurrency: 1,
    },
  ],
})

describe('UsageTrendsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUsageTrendsMock.mockReturnValue({
      data: createTrends(),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  test('renders trend table when data exists', () => {
    render(<UsageTrendsPanel client={{} as never} />)
    expect(screen.getByText('Usage Trends')).toBeInTheDocument()
    expect(screen.getByText('2024-01-01')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  test('renders loading state', () => {
    useUsageTrendsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })
    render(<UsageTrendsPanel client={{} as never} />)
    expect(screen.getByText('Loading usage trends')).toBeInTheDocument()
  })

  test('renders error state', () => {
    useUsageTrendsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    render(<UsageTrendsPanel client={{} as never} />)
    expect(screen.getByText('Unable to load usage trends')).toBeInTheDocument()
  })

  test('renders empty message when no trends', () => {
    useUsageTrendsMock.mockReturnValueOnce({
      data: { ...createTrends(), trends: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    render(<UsageTrendsPanel client={{} as never} />)
    expect(screen.getByText('No usage trends yet')).toBeInTheDocument()
  })
})


