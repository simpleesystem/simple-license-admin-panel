import { faker } from '@faker-js/faker'
import type { Client, LicenseUsageDetailsResponse } from '@simple-license/react-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
import {
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY,
  UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE,
  UI_ANALYTICS_LICENSE_DETAILS_LOADING_BODY,
  UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE,
  UI_ANALYTICS_LICENSE_DETAILS_TITLE,
} from '../../../src/ui/constants'
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
    </QueryClientProvider>
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

  test('renders license usage data when available', async () => {
    const client = createMockClient()
    const summary = buildSummary()
    const licenseKey = faker.string.alphanumeric({ length: 12 })
    useLicenseUsageDetailsMock.mockReturnValue({
      data: {
        licenseKey,
        licenseId: 42,
        summaries: [summary],
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(
      <LicenseUsageDetailsPanel
        client={client}
        licenseKey={licenseKey}
        licenseVendorId={faker.string.uuid()}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() }}
      />,
      client
    )

    expect(await screen.findByText(UI_ANALYTICS_LICENSE_DETAILS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_COLUMN_ACTIVATIONS)).toBeInTheDocument()
    expect(await screen.findByText(summary.totalActivations.toLocaleString())).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useLicenseUsageDetailsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(
      <LicenseUsageDetailsPanel
        client={client}
        licenseKey={faker.string.alphanumeric({ length: 12 })}
        licenseVendorId={faker.string.uuid()}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() }}
      />,
      client
    )

    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useLicenseUsageDetailsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(
      <LicenseUsageDetailsPanel
        client={client}
        licenseKey={faker.string.alphanumeric({ length: 12 })}
        licenseVendorId={faker.string.uuid()}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() }}
      />,
      client
    )

    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY)).toBeInTheDocument()
  })

  test('blocks vendor scoped users from viewing another vendor license usage', () => {
    const client = createMockClient()
    useLicenseUsageDetailsMock.mockReturnValue({
      data: {
        licenseKey: faker.string.alphanumeric({ length: 12 }),
        licenseId: 100,
        summaries: [],
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(
      <LicenseUsageDetailsPanel
        client={client}
        licenseKey={faker.string.alphanumeric({ length: 12 })}
        licenseVendorId={faker.string.uuid()}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: faker.string.uuid() }}
      />,
      client
    )

    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE)).toBeInTheDocument()
  })
})
