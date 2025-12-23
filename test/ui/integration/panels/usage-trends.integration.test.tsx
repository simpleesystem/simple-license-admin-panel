import type { Client } from '@/simpleLicense'
import { screen } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'

import {
  UI_USAGE_TRENDS_EMPTY_BODY,
  UI_USAGE_TRENDS_EMPTY_TITLE,
  UI_USAGE_TRENDS_ERROR_BODY,
  UI_USAGE_TRENDS_ERROR_TITLE,
  UI_USAGE_TRENDS_LOADING_BODY,
  UI_USAGE_TRENDS_LOADING_TITLE,
  UI_USAGE_TRENDS_TITLE,
} from '../../../../src/ui/constants'
import { UsageTrendsPanel } from '../../../../src/ui/workflows/UsageTrendsPanel'
import { renderWithProviders } from '../../utils'

const useUsageTrendsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useUsageTrends: useUsageTrendsMock,
  }
})

describe('UsageTrendsPanel integration', () => {
  const mockClient = {
    restoreSession: vi.fn().mockResolvedValue(null),
  } as unknown as Client

  beforeEach(() => {
    vi.clearAllMocks()
    useUsageTrendsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })
  })

  test('renders trend data', async () => {
    useUsageTrendsMock.mockReturnValue({
      data: {
        trends: [
          {
            period: '2024-01',
            totalActivations: 10,
            totalValidations: 5,
            totalUsageReports: 2,
          },
        ],
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<UsageTrendsPanel client={mockClient} />, { client: mockClient })

    expect(await screen.findByText(UI_USAGE_TRENDS_TITLE)).toBeInTheDocument()
    expect(screen.getByText('2024-01')).toBeInTheDocument()
  })

  test('shows loading, empty, and error states', async () => {
    useUsageTrendsMock
      .mockReturnValueOnce({ data: undefined, isLoading: true, isError: false })
      .mockReturnValueOnce({ data: { trends: [] }, isLoading: false, isError: false })
      .mockReturnValueOnce({ data: undefined, isLoading: false, isError: true })

    const { rerender } = renderWithProviders(<UsageTrendsPanel client={mockClient} />, { client: mockClient })

    expect(await screen.findByText(UI_USAGE_TRENDS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_USAGE_TRENDS_LOADING_BODY)).toBeInTheDocument()

    rerender(<UsageTrendsPanel client={mockClient} />)
    expect(await screen.findByText(UI_USAGE_TRENDS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_USAGE_TRENDS_EMPTY_BODY)).toBeInTheDocument()

    rerender(<UsageTrendsPanel client={mockClient} />)
    expect(await screen.findByText(UI_USAGE_TRENDS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_USAGE_TRENDS_ERROR_BODY)).toBeInTheDocument()
  })
})
