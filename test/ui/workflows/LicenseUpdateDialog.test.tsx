import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createNoopLogger } from '@/app/logging/logger'
import { LoggerContext } from '@/app/logging/loggerContext'
import type { Client } from '@/simpleLicense'
import { UI_LICENSE_FORM_TITLE_UPDATE } from '@/ui/constants'
import { LicenseUpdateDialog } from '@/ui/workflows/LicenseUpdateDialog'

const createMockClient = (): Client =>
  ({
    getLicense: vi.fn(),
    updateLicense: vi.fn(),
  }) as unknown as Client

vi.mock('../../../src/ui/formBuilder/DynamicForm', () => ({
  DynamicForm: ({ defaultValues, onSubmit }: { defaultValues: unknown; onSubmit: (val: unknown) => void }) => (
    <div data-testid="dynamic-form">
      <button
        type="button"
        onClick={() => onSubmit({ ...(defaultValues as object), customer_email: 'updated@example.com' })}
      >
        Submit
      </button>
    </div>
  ),
}))

vi.mock('../../../src/ui/workflows/LicenseActivationsPanel', () => ({
  LicenseActivationsPanel: () => <div data-testid="activations-panel">Activations Panel</div>,
}))

vi.mock('../../../src/ui/workflows/LicenseUsageDetailsPanel', () => ({
  LicenseUsageDetailsPanel: () => <div data-testid="usage-panel">Usage Panel</div>,
}))

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const logger = createNoopLogger()

  return render(
    <LoggerContext.Provider value={logger}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </LoggerContext.Provider>
  )
}

describe('LicenseUpdateDialog', () => {
  const mockClient = createMockClient()
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  const defaultProps = {
    client: mockClient,
    licenseKey: 'license-1',
    show: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    tierOptions: [],
    initialValues: { customer_email: 'customer@example.com' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(mockClient.getLicense).mockResolvedValue({
      license: {
        id: 'license-1',
        licenseKey: 'license-1',
        domain: 'example.com',
        metadata: { key: 'value' },
      },
    } as never)
    vi.mocked(mockClient.updateLicense).mockResolvedValue({
      id: 'license-1',
    } as never)
  })

  it('renders dialog when show is true', async () => {
    await act(async () => {
      renderWithQueryClient(<LicenseUpdateDialog {...defaultProps} />)
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(UI_LICENSE_FORM_TITLE_UPDATE)).toBeInTheDocument()
    })
  })

  it('fetches license details on mount', async () => {
    await act(async () => {
      renderWithQueryClient(<LicenseUpdateDialog {...defaultProps} />)
    })

    await waitFor(() => {
      expect(mockClient.getLicense).toHaveBeenCalledWith('license-1')
    })
  })

  it('renders tabs and switches content', async () => {
    await act(async () => {
      renderWithQueryClient(<LicenseUpdateDialog {...defaultProps} />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('dynamic-form')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: 'Activations' }))
    })

    await waitFor(() => {
      expect(screen.getByTestId('activations-panel')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: 'Usage' }))
    })

    await waitFor(() => {
      expect(screen.getByTestId('usage-panel')).toBeInTheDocument()
    })
  })

  it('invokes success callback once for details submit', async () => {
    await act(async () => {
      renderWithQueryClient(<LicenseUpdateDialog {...defaultProps} />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('dynamic-form')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  it('keeps dialog usable when getLicense payload is missing nested license object', async () => {
    vi.mocked(mockClient.getLicense).mockResolvedValue({} as never)

    await act(async () => {
      renderWithQueryClient(<LicenseUpdateDialog {...defaultProps} />)
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dynamic-form')).toBeInTheDocument()
    })
  })
})
