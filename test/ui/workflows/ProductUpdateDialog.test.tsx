import type { Client, Entitlement, Product, ProductTier } from '@/simpleLicense'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UI_PRODUCT_FORM_TITLE_UPDATE } from '@/ui/constants'
import { ProductUpdateDialog } from '@/ui/workflows/ProductUpdateDialog'

// Mock client
const createMockClient = (): Client =>
  ({
    getProduct: vi.fn(),
    listProductTiers: vi.fn(),
    listEntitlements: vi.fn(),
    products: {
      update: vi.fn(),
    },
  }) as unknown as Client

// Mock child components
vi.mock('../../../../src/ui/formBuilder/DynamicForm', () => ({
  DynamicForm: ({ defaultValues, onSubmit }: { defaultValues: unknown; onSubmit: (val: unknown) => void }) => (
    <div data-testid="dynamic-form">
      <button onClick={() => onSubmit({ ...(defaultValues as object), name: 'Updated Product' })}>Submit</button>
    </div>
  ),
}))

vi.mock('../../../../src/ui/workflows/ProductTierManagementPanel', () => ({
  ProductTierManagementPanel: () => <div data-testid="tier-panel">Tier Panel</div>,
}))

vi.mock('../../../../src/ui/workflows/ProductEntitlementManagementPanel', () => ({
  ProductEntitlementManagementPanel: () => <div data-testid="entitlement-panel">Entitlement Panel</div>,
}))


const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('ProductUpdateDialog', () => {
  const mockClient = createMockClient()
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  const defaultProps = {
    client: mockClient,
    productId: 'product-1',
    show: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    initialValues: { name: 'Test Product' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(mockClient.getProduct).mockResolvedValue({
      product: { id: 'product-1', metadata: { key: 'val' } } as unknown as Product,
    })
    vi.mocked(mockClient.listProductTiers).mockResolvedValue({ data: [] as unknown as ProductTier[] })
    vi.mocked(mockClient.listEntitlements).mockResolvedValue({ data: [] as unknown as Entitlement[] })
  })

  it('renders dialog when show is true', () => {
    renderWithQueryClient(<ProductUpdateDialog {...defaultProps} />)
    expect(screen.getByText(UI_PRODUCT_FORM_TITLE_UPDATE)).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('fetches details on mount', async () => {
    renderWithQueryClient(<ProductUpdateDialog {...defaultProps} />)

    await waitFor(() => {
      expect(mockClient.getProduct).toHaveBeenCalledWith('product-1')
      expect(mockClient.listProductTiers).toHaveBeenCalledWith('product-1')
      expect(mockClient.listEntitlements).toHaveBeenCalledWith('product-1')
    })
  })

  it('renders tabs and switches content', async () => {
    renderWithQueryClient(<ProductUpdateDialog {...defaultProps} />)

    // Default tab is details
    expect(screen.getByTestId('dynamic-form')).toBeInTheDocument()

    // Switch to Tiers
    fireEvent.click(screen.getByText('Tiers'))
    expect(screen.getByTestId('tier-panel')).toBeInTheDocument()

    // Switch to Entitlements
    fireEvent.click(screen.getByText('Entitlements'))
    expect(screen.getByTestId('entitlement-panel')).toBeInTheDocument()
  })

  it('closes dialog', () => {
    renderWithQueryClient(<ProductUpdateDialog {...defaultProps} />)
    fireEvent.click(screen.getByText('Close'))
    expect(mockOnClose).toHaveBeenCalled()
  })
})
