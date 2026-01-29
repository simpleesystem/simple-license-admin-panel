import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationBusProvider } from '@/notifications/busContext'
import type { Client, User } from '@/simpleLicense'
import {
  UI_PRODUCT_TIER_BUTTON_CREATE,
  UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE,
  UI_USER_ROLE_SUPERUSER,
} from '@/ui/constants'
import { type ProductTierListItem, ProductTierManagementPanel } from '@/ui/workflows/ProductTierManagementPanel'

// Mock client
const createMockClient = (): Client =>
  ({
    products: {
      listTiers: vi.fn(),
      createTier: vi.fn(),
      updateTier: vi.fn(),
      deleteTier: vi.fn(),
      getTier: vi.fn(),
    },
  }) as unknown as Client

// Mock child components
vi.mock('@/ui/data/DataTable', () => ({
  DataTable: ({
    data,
    emptyState,
    toolbar,
    footer,
  }: {
    data: unknown[]
    emptyState: unknown
    toolbar: unknown
    footer: unknown
  }) => (
    <div data-testid="data-table">
      <div>{toolbar as React.ReactNode}</div>
      {data.length === 0 ? (
        <div>{emptyState as React.ReactNode}</div>
      ) : (
        <ul>
          {data.map((item) => {
            const row = item as { id: string; tierCode: string }
            return <li key={row.id}>{row.tierCode}</li>
          })}
        </ul>
      )}
      <div>{footer as React.ReactNode}</div>
    </div>
  ),
}))

vi.mock('@/ui/workflows/ProductTierFormFlow', () => ({
  ProductTierFormFlow: ({ show, onClose }: { show: boolean; onClose: () => void }) =>
    show ? (
      <div data-testid="product-tier-form-flow">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}))

vi.mock('@/ui/workflows/ProductTierRowActions', () => ({
  ProductTierRowActions: ({ onEdit }: { onEdit: (t: { id: string; tierCode: string; tierName: string }) => void }) => (
    <button type="button" onClick={() => onEdit({ id: 'tier-1', tierCode: 'tier-1', tierName: 'Tier 1' })}>
      Edit
    </button>
  ),
}))

describe('ProductTierManagementPanel', () => {
  const mockClient = createMockClient()
  const mockTiers: ProductTierListItem[] = [
    { id: '1', tierCode: 'tier-1', tierName: 'Tier 1', vendorId: 'vendor-1' },
    { id: '2', tierCode: 'tier-2', tierName: 'Tier 2', vendorId: 'vendor-1' },
  ]
  const mockOnRefresh = vi.fn()
  const mockOnPageChange = vi.fn()
  const mockOnSortChange = vi.fn()

  const defaultProps = {
    client: mockClient,
    productId: 'product-1',
    tiers: mockTiers,
    page: 1,
    totalPages: 5,
    onPageChange: mockOnPageChange,
    onRefresh: mockOnRefresh,
    currentUser: { role: UI_USER_ROLE_SUPERUSER } as unknown as User,
    onSortChange: mockOnSortChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table with tiers', () => {
    render(
      <NotificationBusProvider>
        <ProductTierManagementPanel {...defaultProps} />
      </NotificationBusProvider>
    )

    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByText('tier-1')).toBeInTheDocument()
    expect(screen.getByText('tier-2')).toBeInTheDocument()
  })

  it('renders empty state when no tiers', () => {
    render(
      <NotificationBusProvider>
        <ProductTierManagementPanel {...defaultProps} tiers={[]} />
      </NotificationBusProvider>
    )

    expect(screen.getByText(UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
  })

  it('renders search input and handles change', () => {
    render(
      <NotificationBusProvider>
        <ProductTierManagementPanel {...defaultProps} />
      </NotificationBusProvider>
    )

    const searchInput = screen.getByPlaceholderText('Search tiers...')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    // Search is handled internally by sorting/filtering in useMemo, not via prop callback in this component
    // But we verify input exists and accepts value
    expect(searchInput).toHaveValue('test')
  })

  it('renders create button and opens form flow', () => {
    render(
      <NotificationBusProvider>
        <ProductTierManagementPanel {...defaultProps} />
      </NotificationBusProvider>
    )

    const createButton = screen.getByText(UI_PRODUCT_TIER_BUTTON_CREATE)
    fireEvent.click(createButton)

    expect(screen.getByTestId('product-tier-form-flow')).toBeInTheDocument()

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(screen.queryByTestId('product-tier-form-flow')).not.toBeInTheDocument()
  })
})
