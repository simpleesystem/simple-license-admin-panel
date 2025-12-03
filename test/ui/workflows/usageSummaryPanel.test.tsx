import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { faker } from '@faker-js/faker'
import type { Client, UsageSummaryResponse } from '@simple-license/react-sdk'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
import { UsageSummaryPanel } from '../../../src/ui/workflows/UsageSummaryPanel'

const useUsageSummariesMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
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
  } as unknown as Client
}

const renderWithProviders = (ui: React.ReactElement, client: Client) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ client }}>{ui}</ApiContext.Provider>
    </QueryClientProvider>,
  )
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

  test('renders usage summaries when data is available', () => {
    const client = createMockClient()
    const summary = buildSummary()
    useUsageSummariesMock.mockReturnValue({
      data: {
        summaries: [summary],
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<UsageSummaryPanel client={client} />, client)

    const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    const expectedPeriod = `${dateFormatter.format(new Date(summary.periodStart))} – ${dateFormatter.format(
      new Date(summary.periodEnd),
    )}`

    expect(screen.getByText('Usage Summaries')).toBeInTheDocument()
    expect(screen.getByText(expectedPeriod)).toBeInTheDocument()
    expect(screen.getByText(summary.totalActivations.toLocaleString())).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useUsageSummariesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(<UsageSummaryPanel client={client} />, client)

    expect(screen.getByText('Loading usage summaries')).toBeInTheDocument()
    expect(screen.getByText('Fetching the latest usage metrics…')).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useUsageSummariesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(<UsageSummaryPanel client={client} />, client)

    expect(screen.getByText('Unable to load usage summaries')).toBeInTheDocument()
    expect(screen.getByText('Please try again after refreshing the page.')).toBeInTheDocument()
  })
})

