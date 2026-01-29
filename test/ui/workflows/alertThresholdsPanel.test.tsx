import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Client } from '@/simpleLicense'

import { ApiContext } from '../../../src/api/apiContext'
import {
  UI_ALERT_THRESHOLD_FORM_SUBMIT_LABEL,
  UI_ALERT_THRESHOLD_LABEL_HIGH_ACTIVATIONS,
  UI_BUTTON_LABEL_EDIT_ALERT_THRESHOLDS,
} from '../../../src/ui/constants'
import { AlertThresholdsPanel } from '../../../src/ui/workflows/AlertThresholdsPanel'

const useAlertThresholdsMock = vi.hoisted(() => vi.fn())
const useUpdateAlertThresholdsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useAlertThresholds: useAlertThresholdsMock,
    useUpdateAlertThresholds: useUpdateAlertThresholdsMock,
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

const createThresholds = () => ({
  high: {
    activations: 100,
    validations: 90,
    concurrency: 80,
  },
  medium: {
    activations: 50,
    validations: 40,
    concurrency: 30,
  },
})

describe('AlertThresholdsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders alert thresholds summary and handles edit flow', async () => {
    const client = createMockClient()
    const thresholds = createThresholds()
    const refetch = vi.fn()
    useAlertThresholdsMock.mockReturnValue({
      data: thresholds,
      isLoading: false,
      isError: false,
      refetch,
    })
    const mutateAsync = vi.fn(async () => thresholds)
    useUpdateAlertThresholdsMock.mockReturnValue({ mutateAsync, isPending: false })

    renderWithProviders(<AlertThresholdsPanel client={client} />, client)

    expect(screen.getByText(UI_ALERT_THRESHOLD_LABEL_HIGH_ACTIVATIONS)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: UI_BUTTON_LABEL_EDIT_ALERT_THRESHOLDS }))
    })

    const modal = await screen.findByRole('dialog')
    const highInput = within(modal).getByLabelText(new RegExp(UI_ALERT_THRESHOLD_LABEL_HIGH_ACTIVATIONS, 'i'))
    fireEvent.change(highInput, { target: { value: '120' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: UI_ALERT_THRESHOLD_FORM_SUBMIT_LABEL }))
    })

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          high_activations: 120,
        })
      )
    )
    expect(refetch).toHaveBeenCalled()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useAlertThresholdsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })
    useUpdateAlertThresholdsMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })

    renderWithProviders(<AlertThresholdsPanel client={client} />, client)

    expect(screen.getByText('Loading alert thresholds')).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useAlertThresholdsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    useUpdateAlertThresholdsMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })

    renderWithProviders(<AlertThresholdsPanel client={client} />, client)

    expect(screen.getByText('Unable to load alert thresholds')).toBeInTheDocument()
  })
})
