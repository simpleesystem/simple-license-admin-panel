import { faker } from '@faker-js/faker'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { ActivationDistributionResponse, Client } from '@/simpleLicense'

import { ApiContext } from '../../../src/api/apiContext'
import { ActivationDistributionPanel } from '../../../src/ui/workflows/ActivationDistributionPanel'

const useActivationDistributionMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useActivationDistribution: useActivationDistributionMock,
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

const buildDistributionRow = (): ActivationDistributionResponse['distribution'][number] => ({
  licenseKey: faker.string.uuid(),
  activations: faker.number.int({ min: 1, max: 500 }),
  validations: faker.number.int({ min: 1, max: 500 }),
})

describe('ActivationDistributionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders distribution data when available', () => {
    const client = createMockClient()
    const row = buildDistributionRow()
    useActivationDistributionMock.mockReturnValue({
      data: {
        distribution: [row],
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<ActivationDistributionPanel client={client} />, client)

    expect(screen.getByText('Activation Distribution')).toBeInTheDocument()
    expect(screen.getByText(row.licenseKey)).toBeInTheDocument()
    expect(screen.getByText(row.activations.toLocaleString())).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useActivationDistributionMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(<ActivationDistributionPanel client={client} />, client)

    expect(screen.getByText('Loading activation distribution')).toBeInTheDocument()
    expect(screen.getByText('Analyzing the latest activation spread…')).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useActivationDistributionMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(<ActivationDistributionPanel client={client} />, client)

    expect(screen.getByText('Unable to load activation distribution')).toBeInTheDocument()
    expect(screen.getByText('Please verify your analytics access and refresh the page.')).toBeInTheDocument()
  })
})
