import { faker } from '@faker-js/faker'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY,
  UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE,
  UI_ANALYTICS_LICENSE_DETAILS_LOADING_BODY,
  UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE,
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

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useLicenseActivations: useLicenseActivationsMock,
    useLicenseUsageDetails: useLicenseUsageDetailsMock,
    useHealthWebSocket: useHealthWebSocketMock,
  }
})

describe('Panel states: loading, error, empty', () => {
  test('LicenseActivationsPanel loading and error states', () => {
    const client = {} as never
    const licenseId = faker.string.uuid()

    useLicenseActivationsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    const { rerender } = renderWithProviders(<LicenseActivationsPanel client={client} licenseId={licenseId} />)

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_LOADING_BODY)).toBeInTheDocument()

    useLicenseActivationsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    rerender(<LicenseActivationsPanel client={client} licenseId={licenseId} />)
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_ERROR_BODY)).toBeInTheDocument()
  })

  test('LicenseActivationsPanel empty state', () => {
    const client = {} as never
    const licenseId = faker.string.uuid()
    useLicenseActivationsMock.mockReturnValue({
      data: { activations: [] },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<LicenseActivationsPanel client={client} licenseId={licenseId} />)

    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_LICENSE_ACTIVATIONS_EMPTY_STATE)).toBeInTheDocument()
  })

  test('LicenseUsageDetailsPanel loading and error states', () => {
    const client = {} as never
    const licenseKey = faker.string.alphanumeric({ length: 12 })

    useLicenseUsageDetailsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    const { rerender } = renderWithProviders(
      <LicenseUsageDetailsPanel client={client} licenseKey={licenseKey} licenseVendorId={faker.string.uuid()} />,
    )

    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_LOADING_BODY)).toBeInTheDocument()

    useLicenseUsageDetailsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    rerender(
      <LicenseUsageDetailsPanel client={client} licenseKey={licenseKey} licenseVendorId={faker.string.uuid()} />,
    )
    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY)).toBeInTheDocument()
  })

  test('SystemStatusPanel handles websocket error state', async () => {
    const client = {} as never
    useHealthWebSocketMock.mockReturnValue({
      status: 'error',
      lastMessage: null,
      error: new Error('ws-failure'),
    })

    render(
      <SystemStatusPanel
        client={client}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() }}
        onRefresh={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
    })
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})

