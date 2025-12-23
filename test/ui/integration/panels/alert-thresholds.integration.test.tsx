import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_ALERT_THRESHOLD_FORM_SUBMIT_LABEL,
  UI_ANALYTICS_ALERT_THRESHOLDS_EMPTY_STATE,
  UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_BODY,
  UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_TITLE,
  UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_BODY,
  UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_TITLE,
} from '../../../../src/ui/constants'
import { AlertThresholdsPanel } from '../../../../src/ui/workflows/AlertThresholdsPanel'
import { renderWithProviders } from '../../utils'

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

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('AlertThresholdsPanel integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUpdateAlertThresholdsMock.mockReturnValue(mockMutation())
  })

  test('renders thresholds and updates on submit', async () => {
    const refetch = vi.fn()
    const onUpdated = vi.fn()
    useAlertThresholdsMock.mockReturnValue({
      data: {
        high: { activations: 10, validations: 20, concurrency: 30 },
        medium: { activations: 5, validations: 10, concurrency: 15 },
      },
      isLoading: false,
      isError: false,
      refetch,
    })
    useUpdateAlertThresholdsMock.mockReturnValue(mockMutation())

    renderWithProviders(<AlertThresholdsPanel client={{} as never} onUpdated={onUpdated} />)

    expect(screen.getAllByText('10').length).toBeGreaterThan(0)
    expect(screen.getAllByText('5').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByText(/Edit Alert Thresholds/i))
    fireEvent.click(screen.getByRole('button', { name: UI_ALERT_THRESHOLD_FORM_SUBMIT_LABEL }))

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled()
      expect(onUpdated).toHaveBeenCalled()
    })
  })

  test('shows loading, empty, then error states', () => {
    useAlertThresholdsMock
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      })

    const { rerender } = renderWithProviders(<AlertThresholdsPanel client={{} as never} />)

    expect(screen.getByText(UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_BODY)).toBeInTheDocument()

    rerender(<AlertThresholdsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_ALERT_THRESHOLDS_EMPTY_STATE)).toBeInTheDocument()

    rerender(<AlertThresholdsPanel client={{} as never} />)
    expect(screen.getByText(UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_BODY)).toBeInTheDocument()
  })
})

