import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { faker } from '@faker-js/faker'
import type { Client, LicenseUsageDetailsResponse } from '@simple-license/react-sdk'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
import { LicenseUsageDetailsPanel } from '../../../src/ui/workflows/LicenseUsageDetailsPanel'

const useLicenseUsageDetailsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useLicenseUsageDetails: useLicenseUsageDetailsMock,
  }
})

const createMockClient = () => ({}) as Client

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

const buildSummary = (): LicenseUsageDetailsResponse['summaries'][number] => ({
  id: faker.number.int({ min: 1, max: 100 }),
  periodStart: '2023-01-01T00:00:00.000Z',
  periodEnd: '2023-01-02T00:00:00.000Z',
  totalActivations: faker.number.int({ min: 1, max: 500 }),
  totalValidations: faker.number.int({ min: 1, max: 500 }),
  totalUsageReports: faker.number.int({ min: 1, max: 500 }),
  uniqueDomains: faker.number.int({ min: 1, max: 50 }),
  uniqueIPs: faker.number.int({ min: 1, max: 50 }),
  peakConcurrency: faker.number.int({ min: 1, max: 25 }),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
})

describe('LicenseUsageDetailsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders license usage data when available', () => {
    const client = createMockClient()
    const summary = buildSummary()
    useLicenseUsageDetailsMock.mockReturnValue({
      data: {
        licenseKey: 'LIC-123',
        licenseId: 42,
        summaries: [summary],
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(
      <LicenseUsageDetailsPanel client={client} licenseKey="LIC-123" />,
      client,
    )

    expect(screen.getByText('License Usage Details')).toBeInTheDocument()
    expect(screen.getByText('Activations')).toBeInTheDocument()
    expect(screen.getByText(summary.totalActivations.toLocaleString())).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useLicenseUsageDetailsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(
      <LicenseUsageDetailsPanel client={client} licenseKey="LIC-123" />,
      client,
    )

    expect(screen.getByText('Loading license usage details')).toBeInTheDocument()
    expect(screen.getByText('Fetching the selected license history…')).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useLicenseUsageDetailsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(
      <LicenseUsageDetailsPanel client={client} licenseKey="LIC-123" />,
      client,
    )

    expect(screen.getByText('Unable to load license usage details')).toBeInTheDocument()
    expect(screen.getByText('Verify the license key and try refreshing the panel.')).toBeInTheDocument()
  })
})

