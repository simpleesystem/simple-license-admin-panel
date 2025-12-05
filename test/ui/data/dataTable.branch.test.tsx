import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { UI_ARIA_SORT_ASCENDING, UI_ARIA_SORT_NONE, UI_SORT_ASC, UI_SORT_DESC } from '../../../src/ui/constants'
import { DataTable } from '../../../src/ui/data/DataTable'

type Row = { id: string; name: string }

const columns = [
  {
    id: 'name',
    header: 'Name',
    sortable: true,
    cell: (row: Row) => row.name,
  },
]

describe('DataTable branch coverage', () => {
  test('toggles sort direction and aria-sort values', () => {
    const onSort = vi.fn()
    const sortState = { columnId: 'name', direction: UI_SORT_ASC }

    render(
      <DataTable<Row>
        data={[{ id: '1', name: 'Alpha' }]}
        columns={columns}
        rowKey={(row) => row.id}
        onSort={onSort}
        sortState={sortState}
      />
    )

    const sortButton = screen.getByRole('button', { name: /Sort Name/i })
    expect(screen.getByRole('columnheader', { name: /Name/i })).toHaveAttribute('aria-sort', UI_ARIA_SORT_ASCENDING)

    fireEvent.click(sortButton)
    expect(onSort).toHaveBeenCalledWith('name', UI_SORT_DESC)
  })

  test('select all uses custom toggle when provided', () => {
    const onToggleAll = vi.fn()
    const onToggleRow = vi.fn()

    render(
      <DataTable<Row>
        data={[
          { id: '1', name: 'Alpha' },
          { id: '2', name: 'Beta' },
        ]}
        columns={columns}
        rowKey={(row) => row.id}
        selection={{ selectedIds: [], onToggleAll, onToggleRow }}
      />
    )

    fireEvent.click(screen.getByLabelText('Select all rows'))
    expect(onToggleAll).toHaveBeenCalledTimes(1)
    expect(onToggleRow).not.toHaveBeenCalled()
  })

  test('falls back to per-row toggle when no toggleAll provided', () => {
    const onToggleRow = vi.fn()

    render(
      <DataTable<Row>
        data={[
          { id: '1', name: 'Alpha' },
          { id: '2', name: 'Beta' },
        ]}
        columns={columns}
        rowKey={(row) => row.id}
        selection={{ selectedIds: [], onToggleRow }}
      />
    )

    fireEvent.click(screen.getByLabelText('Select all rows'))
    expect(onToggleRow).toHaveBeenCalledTimes(2)
  })

  test('renders empty state when not loading', () => {
    render(<DataTable<Row> data={[]} columns={columns} rowKey={(row) => row.id} emptyState="No data" />)

    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Name/i })).toHaveAttribute('aria-sort', UI_ARIA_SORT_NONE)
  })

  test('renders spinner when loading', () => {
    render(
      <DataTable<Row> data={[{ id: '1', name: 'Alpha' }]} columns={columns} rowKey={(row) => row.id} isLoading={true} />
    )

    const spinner = document.querySelector('.spinner-border')
    expect(spinner).not.toBeNull()
  })

  test('renders sortable aria-sort without sort button when handler missing', () => {
    render(
      <DataTable<Row>
        data={[{ id: '1', name: 'Alpha' }]}
        columns={[{ id: 'name', header: 'Name', sortable: true, cell: (row) => row.name }]}
        rowKey={(row) => row.id}
        sortState={{ columnId: 'name', direction: UI_SORT_ASC }}
      />
    )

    expect(screen.getByRole('columnheader', { name: /Name/i })).toHaveAttribute('aria-sort', UI_ARIA_SORT_ASCENDING)
    expect(screen.queryByRole('button', { name: /Sort Name/i })).toBeNull()
  })

  test('uses fallback header label for sort button title', () => {
    const onSort = vi.fn()
    render(
      <DataTable<Row>
        data={[{ id: '1', name: 'Alpha' }]}
        columns={[
          {
            id: 'name',
            header: <span>Custom</span>,
            sortable: true,
            cell: (row) => row.name,
          },
        ]}
        rowKey={(row) => row.id}
        onSort={onSort}
      />
    )

    const sortButton = screen.getByRole('button', { name: /Sort name/i })
    fireEvent.click(sortButton)
    expect(onSort).toHaveBeenCalledWith('name', UI_SORT_ASC)
  })

  test('select all checkbox reflects fully selected state', () => {
    const onToggleAll = vi.fn()
    const rows: Row[] = [
      { id: '1', name: 'Alpha' },
      { id: '2', name: 'Beta' },
    ]

    render(
      <DataTable<Row>
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        selection={{ selectedIds: ['1', '2'], onToggleAll, onToggleRow: vi.fn() }}
      />
    )

    const selectAll = screen.getByLabelText('Select all rows')
    expect(selectAll).toBeChecked()
  })
})
