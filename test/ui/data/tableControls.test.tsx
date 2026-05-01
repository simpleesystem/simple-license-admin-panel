import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UI_TABLE_PAGINATION_NEXT, UI_TABLE_PAGINATION_PREVIOUS, UI_TABLE_SEARCH_PLACEHOLDER } from '@/ui/constants'
import { TableControls } from '@/ui/data/TableControls'
import { TablePaginationFooter } from '@/ui/data/TablePaginationFooter'
import { TableSearchInput } from '@/ui/data/TableSearchInput'

describe('TableSearchInput', () => {
  it('renders a search input and reports changes', () => {
    const onChange = vi.fn()

    render(<TableSearchInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText(UI_TABLE_SEARCH_PLACEHOLDER), { target: { value: 'customer' } })

    expect(onChange).toHaveBeenCalledWith('customer')
  })
})

describe('TablePaginationFooter', () => {
  it('clamps displayed page and disables edge navigation', () => {
    const onPageChange = vi.fn()

    render(<TablePaginationFooter page={12} totalPages={3} onPageChange={onPageChange} />)

    expect(screen.getByText('3 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: UI_TABLE_PAGINATION_NEXT })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: UI_TABLE_PAGINATION_PREVIOUS }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('renders the optional page-size selector and summary slot', () => {
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()

    render(
      <TablePaginationFooter
        page={2}
        totalPages={5}
        onPageChange={onPageChange}
        pageSize={25}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={onPageSizeChange}
        pageSizeLabel="Rows per page"
        summary={<span data-testid="summary">Showing 26 to 50 / 100</span>}
      />
    )

    const pageSizeSelect = screen.getByLabelText(/rows per page/i)
    expect(pageSizeSelect).toHaveValue('25')
    fireEvent.change(pageSizeSelect, { target: { value: '50' } })
    expect(onPageSizeChange).toHaveBeenCalledWith(50)

    expect(screen.getByTestId('summary')).toHaveTextContent('Showing 26 to 50 / 100')
  })
})

describe('TableControls', () => {
  it('composes search, filters, and actions in one toolbar', () => {
    render(
      <TableControls
        search={{ value: 'active', onChange: vi.fn() }}
        filters={<select aria-label="Status filter" />}
        actions={<button type="button">Create</button>}
      />
    )

    expect(screen.getByRole('toolbar')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(UI_TABLE_SEARCH_PLACEHOLDER)).toHaveValue('active')
    expect(screen.getByLabelText('Status filter')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })
})
