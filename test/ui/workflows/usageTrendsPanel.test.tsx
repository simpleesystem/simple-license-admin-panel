import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Client, UsageTrendsResponse } from '@/simpleLicense'

import {
  UI_USAGE_TRENDS_EMPTY_BODY,
  UI_USAGE_TRENDS_EMPTY_TITLE,
  UI_USAGE_TRENDS_TITLE,
} from '../../../src/ui/constants'
import { UsageTrendsPanel } from '../../../src/ui/workflows/UsageTrendsPanel'
import { renderWithProviders } from '../utils'

const useUsageTrendsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useUsageTrends: useUsageTrendsMock,
  }
})

const createMockClient = () => {
  return {
    restoreSession: vi.fn().mockResolvedValue(null),
    getToken: vi.fn().mockReturnValue(null),
    setToken: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  } as unknown as Client
}

const trendResponse: UsageTrendsResponse = {
  periodStart: '2026-03-25T21:52:02.987Z',
  periodEnd: '2026-04-24T21:52:02.987Z',
  groupBy: 'day',
  trends: [
    {
      period: '2026-04-24',
      totalActivations: 3,
      totalValidations: 7,
      totalUsageReports: 11,
      uniqueDomains: 2,
      uniqueIPs: 4,
      peakConcurrency: 5,
    },
  ],
}

describe('UsageTrendsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders formatted periods and trend rows when data is available', async () => {
    const client = createMockClient()
    useUsageTrendsMock.mockReturnValue({
      data: trendResponse,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsageTrendsPanel client={client} />, { client })

    await waitFor(() => {
      expect(screen.getByText(UI_USAGE_TRENDS_TITLE)).toBeInTheDocument()
    })
    expect(screen.getByText('Mar 25, 2026 - Apr 24, 2026')).toBeInTheDocument()
    expect(screen.getByText('Apr 24, 2026')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
  })

  test('renders formatted range for the empty state without raw timestamps', async () => {
    const client = createMockClient()
    useUsageTrendsMock.mockReturnValue({
      data: {
        ...trendResponse,
        trends: [],
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsageTrendsPanel client={client} />, { client })

    await waitFor(() => {
      expect(screen.getByText(UI_USAGE_TRENDS_EMPTY_TITLE)).toBeInTheDocument()
    })
    expect(screen.getByText('Mar 25, 2026 - Apr 24, 2026')).toBeInTheDocument()
    expect(screen.getByText(UI_USAGE_TRENDS_EMPTY_BODY)).toBeInTheDocument()
    expect(screen.queryByText(/2026-03-25T/)).not.toBeInTheDocument()
  })
})
