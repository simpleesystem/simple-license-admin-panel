import { faker } from '@faker-js/faker'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Client, TopLicensesResponse } from '@/simpleLicense'

import { ApiContext } from '../../../src/api/apiContext'
import { TopLicensesPanel } from '../../../src/ui/workflows/TopLicensesPanel'

const useTopLicensesMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useTopLicenses: useTopLicensesMock,
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

const buildTopLicense = (): TopLicensesResponse['licenses'][number] => ({
  licenseKey: faker.string.alphanumeric(10),
  customerEmail: faker.internet.email(),
  totalActivations: faker.number.int({ min: 1, max: 500 }),
  totalValidations: faker.number.int({ min: 1, max: 500 }),
  peakConcurrency: faker.number.int({ min: 1, max: 50 }),
  lastActivatedAt: faker.date.recent().toISOString(),
})

describe('TopLicensesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders top license data when available', () => {
    const client = createMockClient()
    const topLicense = buildTopLicense()
    useTopLicensesMock.mockReturnValue({
      data: {
        licenses: [topLicense],
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<TopLicensesPanel client={client} />, client)

    expect(screen.getByText('Top Licenses')).toBeInTheDocument()
    expect(screen.getByText(topLicense.licenseKey)).toBeInTheDocument()
    expect(screen.getByText(topLicense.totalActivations.toLocaleString())).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useTopLicensesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(<TopLicensesPanel client={client} />, client)

    expect(screen.getByText('Loading top licenses')).toBeInTheDocument()
    expect(screen.getByText('Gathering the busiest licenses…')).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useTopLicensesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(<TopLicensesPanel client={client} />, client)

    expect(screen.getByText('Unable to load top licenses')).toBeInTheDocument()
    expect(screen.getByText('Please retry after refreshing the dashboard.')).toBeInTheDocument()
  })
})
