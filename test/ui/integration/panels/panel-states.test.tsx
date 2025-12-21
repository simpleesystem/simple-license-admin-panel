import { faker } from '@faker-js/faker'
import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_ACTIVATIONS_EMPTY_STATE,
  UI_LICENSE_ACTIVATIONS_ERROR_BODY,
  UI_LICENSE_ACTIVATIONS_ERROR_TITLE,
  UI_LICENSE_ACTIVATIONS_LOADING_BODY,
  UI_LICENSE_ACTIVATIONS_LOADING_TITLE,
  UI_LICENSE_ACTIVATIONS_TITLE,
  UI_SYSTEM_STATUS_TITLE,
} from '../../../../src/ui/constants'
import { LicenseActivationsPanel } from '../../../../src/ui/workflows/LicenseActivationsPanel'
import { LicenseUsageDetailsPanel } from '../../../../src/ui/workflows/LicenseUsageDetailsPanel'
import { SystemStatusPanel } from '../../../../src/ui/workflows/SystemStatusPanel'
import { renderWithProviders } from '../../utils'

const useLicenseActivationsMock = vi.hoisted(() => vi.fn())
const useLicenseUsageDetailsMock = vi.hoisted(() => vi.fn())
const useHealthWebSocketMock = vi.hoisted(() => vi.fn())
const useServerStatusMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useLicenseActivations: useLicenseActivationsMock,
    useLicenseUsageDetails: useLicenseUsageDetailsMock,
    useHealthWebSocket: useHealthWebSocketMock,
    useServerStatus: useServerStatusMock,
  }
})

vi.mock('../../../../src/app/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../../../../src/app/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { role: 'SUPERUSER', email: 'test@example.com' },
  }),
}))

describe('Panel states: loading, error, empty', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLicenseActivationsMock.mockReset()
    useLicenseUsageDetailsMock.mockReset()
    useHealthWebSocketMock.mockReset()
    useServerStatusMock.mockReset()
    useServerStatusMock.mockReturnValue({
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {},
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  test('LicenseActivationsPanel loading and error states', () => {
    const client = {} as never
    const licenseKey = faker.string.uuid()
    const currentUser = { role: 'SUPERUSER', vendorId: faker.string.uuid() }

    useLicenseActivationsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    const { rerender } = renderWithProviders(
      <LicenseActivationsPanel client={client} licenseKey={licenseKey} currentUser={currentUser} />
    )

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_LOADING_BODY)).toBeInTheDocument()

    useLicenseActivationsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    rerender(<LicenseActivationsPanel client={client} licenseKey={licenseKey} currentUser={currentUser} />)
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_BODY)).toBeInTheDocument()
  })

  test('LicenseActivationsPanel empty state', async () => {
    const client = {} as never
    const licenseKey = faker.string.uuid()
    const currentUser = { role: 'SUPERUSER', vendorId: faker.string.uuid() }
    useLicenseActivationsMock.mockReturnValue({
      data: { activations: [] },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<LicenseActivationsPanel client={client} licenseKey={licenseKey} currentUser={currentUser} />)

    expect(await screen.findByText(UI_LICENSE_ACTIVATIONS_TITLE)).toBeInTheDocument()
    expect(await screen.findByText(UI_LICENSE_ACTIVATIONS_EMPTY_STATE)).toBeInTheDocument()
  })

  test('LicenseUsageDetailsPanel loading and error states', () => {
    const client = {} as never
    const licenseKey = faker.string.alphanumeric({ length: 12 })

    useLicenseUsageDetailsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    const { rerender } = renderWithProviders(
      <LicenseUsageDetailsPanel client={client} licenseKey={licenseKey} licenseVendorId={faker.string.uuid()} />
    )

    expect(screen.getByText(/license usage/i)).toBeInTheDocument()

    useLicenseUsageDetailsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    rerender(<LicenseUsageDetailsPanel client={client} licenseKey={licenseKey} licenseVendorId={faker.string.uuid()} />)
    expect(screen.getByText(/unable to load/i)).toBeInTheDocument()
  })

  test('SystemStatusPanel handles websocket error state', async () => {
    const client = {} as never
    const currentUser = { role: 'SUPERUSER', vendorId: faker.string.uuid() }
    useHealthWebSocketMock.mockReturnValue({
      connected: false,
      connectionInfo: { state: 'error' as const },
      lastMessage: null,
      error: new Error('ws-failure'),
      requestHealth: vi.fn(),
      send: vi.fn(),
      sendPing: vi.fn(),
      disconnect: vi.fn(),
      reconnect: vi.fn(),
      healthMessage: undefined,
      healthData: undefined,
    })
    useServerStatusMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderWithProviders(<SystemStatusPanel client={client} currentUser={currentUser} onRefresh={vi.fn()} />)

    expect(await screen.findByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
    expect(await screen.findByText(/Unable to load system status/i)).toBeInTheDocument()
  })
})
