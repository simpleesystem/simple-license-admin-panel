import { faker } from '@faker-js/faker'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import {
  UI_ARIA_LABEL_CARD_LIST,
  UI_ARIA_LABEL_REMOVE_CHIP,
  UI_ARIA_LABEL_SUMMARY_LIST,
  UI_ARIA_LABEL_TABLE_TOOLBAR,
  UI_ARIA_LABEL_TAG_LIST,
  UI_CLASS_CARD_LIST_GRID,
  UI_CLASS_SUMMARY_LIST,
  UI_CLASS_TABLE,
  UI_CLASS_TABLE_TOOLBAR,
  UI_CLASS_TAG_LIST,
  UI_ICON_SORT_ASCENDING,
  UI_ICON_SORT_DEFAULT,
  UI_SORT_BUTTON_LABEL_PREFIX,
  UI_TAG_VARIANT_NEUTRAL,
  UI_TEST_ID_CARD_LIST,
  UI_TEST_ID_CHIP,
  UI_TEST_ID_DATA_TABLE,
} from '../../../src/ui/constants'
import { CardList } from '../../../src/ui/data/CardList'
import { Chip } from '../../../src/ui/data/Chip'
import { DataTable } from '../../../src/ui/data/DataTable'
import { SummaryList } from '../../../src/ui/data/SummaryList'
import { TableToolbar } from '../../../src/ui/data/TableToolbar'
import { TagList } from '../../../src/ui/data/TagList'
import { buildCardListItem, buildSummaryCardItem, buildTag, buildText } from '../../ui/factories/uiFactories'

type SampleRow = {
  id: string
  name: string
}

const buildRows = (): SampleRow[] => [
  { id: faker.string.uuid(), name: buildText() },
  { id: faker.string.uuid(), name: buildText() },
]

describe('Data primitives', () => {
  test('DataTable renders provided rows', () => {
    const rows = buildRows()
    const columns = [
      {
        id: 'name',
        header: 'Name',
        cell: (row: SampleRow) => row.name,
      },
    ]
    const { getByTestId } = render(<DataTable data={rows} columns={columns} rowKey={(row) => row.id} />)

    expect(getByTestId(UI_TEST_ID_DATA_TABLE)).toHaveClass(UI_CLASS_TABLE, { exact: false })
  })

  test('DataTable exposes accessible sort indicators', () => {
    const rows = buildRows()
    const columns = [
      {
        id: 'name',
        header: 'Name',
        cell: (row: SampleRow) => row.name,
        sortable: true,
      },
    ]
    const onSort = vi.fn()
    const { getByRole, rerender } = render(
      <DataTable data={rows} columns={columns} rowKey={(row) => row.id} onSort={onSort} />
    )

    const defaultButton = getByRole('button', { name: `${UI_SORT_BUTTON_LABEL_PREFIX} Name` })
    expect(defaultButton).toHaveAttribute('aria-pressed', 'false')
    expect(defaultButton).toHaveTextContent(UI_ICON_SORT_DEFAULT)

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        onSort={onSort}
        sortState={{ columnId: 'name', direction: 'asc' }}
      />
    )

    const activeButton = getByRole('button', { name: `${UI_SORT_BUTTON_LABEL_PREFIX} Name` })
    expect(activeButton).toHaveAttribute('aria-pressed', 'true')
    expect(activeButton).toHaveTextContent(UI_ICON_SORT_ASCENDING)
    const columnHeader = activeButton.closest('th')
    expect(columnHeader).toHaveAttribute('aria-sort', 'ascending')
  })

  test('DataTable invokes sort handler when sortable column clicked', () => {
    const rows = buildRows()
    const onSort = vi.fn()
    const columns = [
      {
        id: 'name',
        header: 'Name',
        cell: (row: SampleRow) => row.name,
        sortable: true,
      },
    ]
    const { getByRole } = render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        onSort={onSort}
        sortState={{ columnId: 'name', direction: 'asc' }}
      />
    )

    fireEvent.click(getByRole('button', { name: /sort/i }))

    expect(onSort).toHaveBeenCalled()
  })

  test('DataTable toggles selection via checkbox', () => {
    const rows = buildRows()
    const toggle = vi.fn()
    const columns = [
      {
        id: 'name',
        header: 'Name',
        cell: (row: SampleRow) => row.name,
      },
    ]
    const { getAllByRole } = render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        selection={{ selectedIds: [], onToggleRow: toggle }}
      />
    )

    fireEvent.click(getAllByRole('checkbox')[1])

    expect(toggle).toHaveBeenCalled()
  })

  test('DataTable renders empty state when no data available', () => {
    const columns = [
      {
        id: 'name',
        header: 'Name',
        cell: (row: SampleRow) => row.name,
      },
    ]
    const { getByText } = render(
      <DataTable data={[]} columns={columns} rowKey={(row) => row.id} emptyState={<p>No rows</p>} />
    )

    expect(getByText('No rows')).toBeInTheDocument()
  })

  test('DataTable renders loading spinner when pending', () => {
    const rows = buildRows()
    const columns = [
      {
        id: 'name',
        header: 'Name',
        cell: (row: SampleRow) => row.name,
      },
    ]
    const { container } = render(<DataTable data={rows} columns={columns} rowKey={(row) => row.id} isLoading={true} />)

    expect(container.querySelector('.spinner-border')).toBeInTheDocument()
  })

  test('DataTable toggles all rows when selection handler provided', () => {
    const rows = buildRows()
    const toggleAll = vi.fn()
    const columns = [
      {
        id: 'name',
        header: 'Name',
        cell: (row: SampleRow) => row.name,
      },
    ]
    const { getAllByRole } = render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        selection={{
          selectedIds: rows.map((row) => row.id),
          onToggleRow: vi.fn(),
          onToggleAll: toggleAll,
        }}
      />
    )

    fireEvent.click(getAllByRole('checkbox')[0])

    expect(toggleAll).toHaveBeenCalledWith(rows)
  })

  test('TableToolbar renders start and end slots', () => {
    const { getByTestId, getByRole } = render(
      <TableToolbar start={<span>start</span>} end={<span>end</span>} testId="toolbar" />
    )

    expect(getByTestId('toolbar')).toHaveClass(UI_CLASS_TABLE_TOOLBAR, { exact: false })
    expect(getByRole('toolbar')).toHaveAttribute('aria-label', UI_ARIA_LABEL_TABLE_TOOLBAR)
  })

  test('TableToolbar renders children fallback when start slot omitted', () => {
    const childLabel = faker.lorem.word()
    const { getByText } = render(<TableToolbar end={<span>actions</span>}>{childLabel}</TableToolbar>)

    expect(getByText(childLabel)).toBeInTheDocument()
  })

  test('SummaryList displays card values', () => {
    const items = [buildSummaryCardItem(), buildSummaryCardItem()]
    const { getByRole } = render(<SummaryList items={items} />)

    const list = getByRole('list', { name: UI_ARIA_LABEL_SUMMARY_LIST })
    expect(list).toHaveClass(UI_CLASS_SUMMARY_LIST, { exact: false })
  })

  test('SummaryList renders icons and trend details when provided', () => {
    const items = [
      buildSummaryCardItem({
        icon: <span data-testid="trend-icon">icon</span>,
        trend: 'Up 10%',
      }),
    ]
    const { getByTestId, getByText } = render(<SummaryList items={items} />)

    expect(getByTestId('trend-icon')).toBeInTheDocument()
    expect(getByText('Up 10%')).toBeInTheDocument()
  })

  test('CardList renders cards for each item', () => {
    const items = [buildCardListItem(), buildCardListItem()]
    const { getByTestId, getByRole } = render(<CardList items={items} columns={2} />)

    expect(getByTestId(UI_TEST_ID_CARD_LIST)).toHaveClass(UI_CLASS_CARD_LIST_GRID, { exact: false })
    expect(getByRole('list', { name: UI_ARIA_LABEL_CARD_LIST })).toBeInTheDocument()
  })

  test('CardList invokes item onClick handlers', () => {
    const onClick = vi.fn()
    const items = [buildCardListItem({ id: 'clickable', title: 'clickable', onClick })]
    const { getByRole } = render(<CardList items={items} columns={1} />)

    const buttonCard = getByRole('button')
    fireEvent.click(buttonCard)
    fireEvent.keyDown(buttonCard, { key: 'Enter' })

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  test('CardList renders static cards without interactive roles when onClick is absent', () => {
    const items = [buildCardListItem({ onClick: undefined })]
    const { getByRole } = render(<CardList items={items} columns={1} />)

    const listItem = getByRole('listitem')
    expect(listItem.querySelector('[role="button"]')).toBeNull()
  })

  test('TagList renders provided tags', () => {
    const tags = [buildTag(), buildTag()]
    const { getByRole } = render(<TagList tags={tags} />)

    expect(getByRole('list', { name: UI_ARIA_LABEL_TAG_LIST })).toHaveClass(UI_CLASS_TAG_LIST, { exact: false })
  })

  test('TagList falls back to neutral variant when tag variant is undefined', () => {
    const tags = [buildTag({ variant: undefined })]
    const { getAllByRole } = render(<TagList tags={tags} />)
    const badge = getAllByRole('listitem')[0].querySelector('.badge')
    expect(badge?.className).toContain(`bg-${UI_TAG_VARIANT_NEUTRAL}`)
  })

  test('Chip renders label text and supports removal action', () => {
    const label = buildText()
    const handleRemove = vi.fn()
    const { getByTestId, getByRole } = render(<Chip label={label} onRemove={handleRemove} />)

    fireEvent.click(getByRole('button', { name: UI_ARIA_LABEL_REMOVE_CHIP }))

    expect(getByTestId(UI_TEST_ID_CHIP)).toBeInTheDocument()
    expect(handleRemove).toHaveBeenCalled()
  })
})
