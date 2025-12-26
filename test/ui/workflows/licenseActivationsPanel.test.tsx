import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { faker } from '@faker-js/faker'
import type { Client, LicenseActivation } from '@/simpleLicense'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
import {
  UI_LICENSE_ACTIVATIONS_EMPTY_STATE,
  UI_LICENSE_ACTIVATIONS_ERROR_BODY,
  UI_LICENSE_ACTIVATIONS_ERROR_TITLE,
  UI_LICENSE_ACTIVATIONS_LOADING_BODY,
  UI_LICENSE_ACTIVATIONS_LOADING_TITLE,
  UI_LICENSE_ACTIVATIONS_TITLE,
  UI_VALUE_PLACEHOLDER,
} from '../../../src/ui/constants'
import { LicenseActivationsPanel } from '../../../src/ui/workflows/LicenseActivationsPanel'
import { buildActivation } from '../../factories/activationFactory'

const useLicenseActivationsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
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

    renderWithProviders(
      <LicenseActivationsPanel
        client={client}
        licenseKey={activation.licenseId ?? 'test-id'}
        licenseVendorId={activation.vendorId ?? undefined}
        currentUser={{ role: 'SUPERUSER', vendorId: activation.vendorId ?? undefined } as never}
      />,
      client,
    )

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

    const licenseId = faker.string.uuid()
    renderWithProviders(
      <LicenseActivationsPanel
        client={client}
        licenseKey={licenseId}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() } as never}
      />,
      client,
    )

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

    const licenseId = faker.string.uuid()
    renderWithProviders(
      <LicenseActivationsPanel
        client={client}
        licenseKey={licenseId}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() } as never}
      />,
      client,
    )

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

    const licenseId = faker.string.uuid()
    renderWithProviders(
      <LicenseActivationsPanel
        client={client}
        licenseKey={licenseId}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() } as never}
      />,
      client,
    )

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_EMPTY_STATE)).toBeInTheDocument()
  })

  test('renders warning when license id is missing', () => {
    const client = createMockClient()
    useLicenseActivationsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(
      <LicenseActivationsPanel
        client={client}
        licenseKey=""
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() } as never}
      />,
      client,
    )

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_BODY)).toBeInTheDocument()
  })

  test('blocks vendor-scoped users from viewing another vendor license', () => {
    const client = createMockClient()
    useLicenseActivationsMock.mockReturnValue({
      data: { activations: [buildActivation()] },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(
      <LicenseActivationsPanel
        client={client}
        licenseKey={faker.string.uuid()}
        licenseVendorId={faker.string.uuid()}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: faker.string.uuid() } as never}
      />,
      client,
    )

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_TITLE)).toBeInTheDocument()
  })

  test('renders placeholders for missing optional values', async () => {
    const client = createMockClient()
    const activation: LicenseActivation = buildActivation({
      status: 'SUSPENDED',
      lastSeenAt: undefined,
      lastCheckedAt: undefined,
      siteName: undefined,
      ipAddress: undefined,
      region: undefined,
      clientVersion: undefined,
    })
    useLicenseActivationsMock.mockReturnValue({
      data: { activations: [activation] },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(
      <LicenseActivationsPanel
        client={client}
        licenseKey={activation.licenseId ?? 'test-id'}
        licenseVendorId={activation.vendorId ?? undefined}
        currentUser={{ role: 'SUPERUSER', vendorId: activation.vendorId ?? undefined } as never}
      />,
      client,
    )

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_ACTIVATIONS_TITLE)).toBeInTheDocument()
    })

    expect(screen.getAllByText(UI_VALUE_PLACEHOLDER).length).toBeGreaterThan(0)
  })
})

