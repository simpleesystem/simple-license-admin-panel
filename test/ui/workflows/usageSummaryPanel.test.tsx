import { screen, waitFor } from '@testing-library/react'
import { faker } from '@faker-js/faker'
import type { Client, UsageSummaryResponse } from '@/simpleLicense'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_ANALYTICS_SUMMARY_ERROR_BODY,
  UI_ANALYTICS_SUMMARY_ERROR_TITLE,
  UI_ANALYTICS_SUMMARY_LOADING_BODY,
  UI_ANALYTICS_SUMMARY_LOADING_TITLE,
  UI_ANALYTICS_SUMMARY_TITLE,
} from '../../../src/ui/constants'
import { UsageSummaryPanel } from '../../../src/ui/workflows/UsageSummaryPanel'
import { renderWithProviders } from '../utils'

const useUsageSummariesMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useUsageSummaries: useUsageSummariesMock,
  }
})

const createMockClient = () => {
  return {
    analytics: {
      getUsageSummaries: vi.fn(async () => ({
        summaries: [],
      })),
    },
    restoreSession: vi.fn().mockResolvedValue(null),
    getToken: vi.fn().mockReturnValue(null),
    setToken: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  } as unknown as Client
}

const buildSummary = (): UsageSummaryResponse['summaries'][number] => ({
  id: faker.number.int({ min: 1, max: 10_000 }),
  tenantId: faker.number.int({ min: 1, max: 500 }),
  licenseId: faker.number.int({ min: 1, max: 5_000 }),
  periodStart: '2023-01-01T00:00:00.000Z',
  periodEnd: '2023-01-31T23:59:59.000Z',
  totalActivations: faker.number.int({ min: 10, max: 500 }),
  totalValidations: faker.number.int({ min: 10, max: 500 }),
  totalUsageReports: faker.number.int({ min: 5, max: 200 }),
  uniqueDomains: faker.number.int({ min: 1, max: 50 }),
  uniqueIPs: faker.number.int({ min: 1, max: 100 }),
  peakConcurrency: faker.number.int({ min: 1, max: 25 }),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
})

describe('UsageSummaryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders usage summaries when data is available', async () => {
    const client = createMockClient()
    const summary = buildSummary()
    useUsageSummariesMock.mockReturnValue({
      data: {
        summaries: [summary],
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsageSummaryPanel client={client} />, { client })

    const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    const expectedPeriod = `${dateFormatter.format(new Date(summary.periodStart))} – ${dateFormatter.format(
      new Date(summary.periodEnd),
    )}`

    await waitFor(() => {
      expect(screen.getByText(UI_ANALYTICS_SUMMARY_TITLE)).toBeInTheDocument()
    })
    expect(screen.getByText(expectedPeriod)).toBeInTheDocument()
    expect(screen.getByText(summary.totalActivations.toLocaleString())).toBeInTheDocument()
  })

  test('renders loading state', async () => {
    const client = createMockClient()
    useUsageSummariesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsageSummaryPanel client={client} />, { client })

    await waitFor(() => {
      expect(screen.getByText(UI_ANALYTICS_SUMMARY_LOADING_TITLE)).toBeInTheDocument()
    })
    expect(screen.getByText(UI_ANALYTICS_SUMMARY_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', async () => {
    const client = createMockClient()
    useUsageSummariesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<UsageSummaryPanel client={client} />, { client })

    await waitFor(() => {
      expect(screen.getByText(UI_ANALYTICS_SUMMARY_ERROR_TITLE)).toBeInTheDocument()
    })
    expect(screen.getByText(UI_ANALYTICS_SUMMARY_ERROR_BODY)).toBeInTheDocument()
  })
})

