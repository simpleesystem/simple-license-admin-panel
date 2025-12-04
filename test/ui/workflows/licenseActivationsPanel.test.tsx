import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { faker } from '@faker-js/faker'
import type { Client, LicenseActivation } from '@simple-license/react-sdk'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
import {
  UI_LICENSE_ACTIVATIONS_EMPTY_STATE,
  UI_LICENSE_ACTIVATIONS_ERROR_BODY,
  UI_LICENSE_ACTIVATIONS_ERROR_TITLE,
  UI_LICENSE_ACTIVATIONS_LOADING_BODY,
  UI_LICENSE_ACTIVATIONS_LOADING_TITLE,
  UI_LICENSE_ACTIVATIONS_TITLE,
} from '../../../src/ui/constants'
import { LicenseActivationsPanel } from '../../../src/ui/workflows/LicenseActivationsPanel'

const useLicenseActivationsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useLicenseActivations: useLicenseActivationsMock,
  }
})

const createMockClient = () => {
  return {
    licenses: {
      getActivations: vi.fn(),
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

const buildActivation = (): LicenseActivation => ({
  id: faker.string.ulid(),
  licenseId: faker.string.uuid(),
  licenseKey: faker.string.alphanumeric({ length: 12 }),
  domain: faker.internet.domainName(),
  siteName: faker.company.name(),
  ipAddress: faker.internet.ipv4(),
  status: 'ACTIVE',
  activatedAt: faker.date.past().toISOString(),
  lastSeenAt: faker.date.recent().toISOString(),
  region: faker.location.countryCode('alpha-2'),
  clientVersion: `v${faker.number.float({ min: 1, max: 5, precision: 0.1 }).toFixed(1)}`,
})

describe('LicenseActivationsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders activation rows when data is available', async () => {
    const client = createMockClient()
    const activation = buildActivation()
    useLicenseActivationsMock.mockReturnValue({
      data: {
        activations: [activation],
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<LicenseActivationsPanel client={client} licenseId={activation.licenseId ?? 'test-id'} />, client)

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_ACTIVATIONS_TITLE)).toBeInTheDocument()
    })

    expect(screen.getByText(activation.domain)).toBeInTheDocument()
    expect(screen.getByText(activation.status)).toBeInTheDocument()
    expect(screen.getByText(activation.siteName ?? '')).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useLicenseActivationsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(<LicenseActivationsPanel client={client} licenseId="license-id" />, client)

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useLicenseActivationsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(<LicenseActivationsPanel client={client} licenseId="license-id" />, client)

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when no activations are available', () => {
    const client = createMockClient()
    useLicenseActivationsMock.mockReturnValue({
      data: { activations: [] },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<LicenseActivationsPanel client={client} licenseId="license-id" />, client)

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_EMPTY_STATE)).toBeInTheDocument()
  })

  test('renders warning when license id is missing', () => {
    const client = createMockClient()
    useLicenseActivationsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<LicenseActivationsPanel client={client} licenseId="" />, client)

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders placeholders for missing optional values', async () => {
    const client = createMockClient()
    const activation: LicenseActivation = {
      id: faker.string.ulid(),
      licenseId: faker.string.uuid(),
      licenseKey: faker.string.alphanumeric({ length: 12 }),
      domain: faker.internet.domainName(),
      status: 'SUSPENDED',
      activatedAt: faker.date.past().toISOString(),
    }
    useLicenseActivationsMock.mockReturnValue({
      data: { activations: [activation] },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<LicenseActivationsPanel client={client} licenseId={activation.licenseId ?? 'test-id'} />, client)

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_ACTIVATIONS_TITLE)).toBeInTheDocument()
    })

    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})

