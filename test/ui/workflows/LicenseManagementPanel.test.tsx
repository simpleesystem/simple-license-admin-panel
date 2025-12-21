import type { Client, User } from '@simple-license/react-sdk'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationBusProvider } from '@/notifications/busContext'
import { UI_LICENSE_BUTTON_CREATE, UI_LICENSE_EMPTY_STATE_MESSAGE, UI_TABLE_SEARCH_PLACEHOLDER, UI_USER_ROLE_SUPERUSER } from '@/ui/constants'
import { type LicenseListItem, LicenseManagementPanel } from '@/ui/workflows/LicenseManagementPanel'

// Mock client
const createMockClient = (): Client =>
  ({
    licenses: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
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
            const row = item as { id: string; licenseKey: string }
            return <li key={row.id}>{row.licenseKey}</li>
          })}
        </ul>
      )}
      <div>{footer as React.ReactNode}</div>
    </div>
  ),
}))

vi.mock('@/ui/workflows/LicenseFormFlow', () => ({
  LicenseFormFlow: ({ show, onClose }: { show: boolean; onClose: () => void }) =>
    show ? (
      <div data-testid="license-form-flow">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

vi.mock('@/ui/workflows/LicenseUpdateDialog', () => ({
  LicenseUpdateDialog: ({ show, onClose }: { show: boolean; onClose: () => void }) =>
    show ? (
      <div data-testid="license-update-dialog">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

vi.mock('@/ui/workflows/LicenseRowActions', () => ({
  LicenseRowActions: ({ onEdit }: { onEdit: (id: string) => void }) => (
    <button onClick={() => onEdit('license-key-1')}>Edit</button>
  ),
}))

describe('LicenseManagementPanel', () => {
  const mockClient = createMockClient()
  const mockLicenses: LicenseListItem[] = [
    {
      id: '1',
      licenseKey: 'license-key-1',
      productSlug: 'product-1',
      tierCode: 'tier-1',
      customerEmail: 'customer@example.com',
      status: 'ACTIVE',
      vendorId: 'vendor-1',
    },
    {
      id: '2',
      licenseKey: 'license-key-2',
      productSlug: 'product-1',
      tierCode: 'tier-1',
      customerEmail: 'customer2@example.com',
      status: 'INACTIVE',
      vendorId: 'vendor-1',
    },
  ]
  const mockOnRefresh = vi.fn()
  const mockOnPageChange = vi.fn()
  const mockOnSearchChange = vi.fn()
  const mockOnStatusFilterChange = vi.fn()

  const defaultProps = {
    client: mockClient,
    licenses: mockLicenses,
    page: 1,
    totalPages: 5,
    onPageChange: mockOnPageChange,
    onRefresh: mockOnRefresh,
    currentUser: { role: UI_USER_ROLE_SUPERUSER } as unknown as User,
    searchTerm: '',
    onSearchChange: mockOnSearchChange,
    onStatusFilterChange: mockOnStatusFilterChange,
    tierOptions: [],
    productOptions: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table with licenses', () => {
    render(
      <NotificationBusProvider>
        <LicenseManagementPanel {...defaultProps} />
      </NotificationBusProvider>
    )

    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByText('license-key-1')).toBeInTheDocument()
    expect(screen.getByText('license-key-2')).toBeInTheDocument()
  })

  it('renders empty state when no licenses', () => {
    render(
      <NotificationBusProvider>
        <LicenseManagementPanel {...defaultProps} licenses={[]} />
      </NotificationBusProvider>
    )

    expect(screen.getByText(UI_LICENSE_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
  })

  it('renders search input and handles change', () => {
    render(
      <NotificationBusProvider>
        <LicenseManagementPanel {...defaultProps} />
      </NotificationBusProvider>
    )

    const searchInput = screen.getByPlaceholderText(UI_TABLE_SEARCH_PLACEHOLDER)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    expect(mockOnSearchChange).toHaveBeenCalledWith('test')
  })

  it('renders status filter and handles change', () => {
    render(
      <NotificationBusProvider>
        <LicenseManagementPanel {...defaultProps} />
      </NotificationBusProvider>
    )

    const filterSelect = screen.getByRole('combobox')
    fireEvent.change(filterSelect, { target: { value: 'ACTIVE' } })

    expect(mockOnStatusFilterChange).toHaveBeenCalledWith('ACTIVE')
  })

  it('renders create button and opens form flow', () => {
    render(
      <NotificationBusProvider>
        <LicenseManagementPanel {...defaultProps} />
      </NotificationBusProvider>
    )

    const createButton = screen.getByText(UI_LICENSE_BUTTON_CREATE)
    fireEvent.click(createButton)

    expect(screen.getByTestId('license-form-flow')).toBeInTheDocument()

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(screen.queryByTestId('license-form-flow')).not.toBeInTheDocument()
  })
})
