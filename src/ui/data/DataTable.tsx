import type { ReactNode } from 'react'

import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'

import {
  UI_ARIA_LABEL_SELECT_ALL,
  UI_ARIA_SORT_ASCENDING,
  UI_ARIA_SORT_DESCENDING,
  UI_ARIA_SORT_NONE,
  UI_CLASS_TABLE,
  UI_CLASS_TABLE_DENSITY_MAP,
  UI_CLASS_TABLE_EMPTY_STATE,
  UI_CLASS_TABLE_HEADER_CELL,
  UI_CLASS_TABLE_SELECTION_CELL,
  UI_CLASS_TABLE_SORT_BUTTON,
  UI_CLASS_TABLE_SPINNER,
  UI_CLASS_TABLE_WRAPPER,
  UI_ICON_SORT_ASCENDING,
  UI_ICON_SORT_DEFAULT,
  UI_ICON_SORT_DESCENDING,
  UI_SORT_ASC,
  UI_SORT_BUTTON_LABEL_PREFIX,
  UI_SORT_DESC,
  UI_TABLE_DENSITY_COMFORTABLE,
  UI_TEST_ID_DATA_TABLE,
} from '../constants'
import type { DataTableProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function DataTable<TData>({
  data,
  columns,
  rowKey,
  toolbar,
  emptyState,
  isLoading,
  density = UI_TABLE_DENSITY_COMFORTABLE,
  sortState,
  onSort,
  selection,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: DataTableProps<TData>) {
  const showSelection = Boolean(selection)
  const selectedIds = selection?.selectedIds ?? []

  const isRowSelected = (row: TData): boolean => {
    const key = rowKey(row)
    return selectedIds.includes(key)
  }

  const handleToggleRow = (row: TData) => {
    selection?.onToggleRow(row)
  }

  const handleToggleAll = () => {
    if (!selection) {
      return
    }
    if (selection.onToggleAll) {
      selection.onToggleAll(data)
      return
    }
    data.forEach((row) => selection.onToggleRow(row))
  }

  const resolveHeaderLabel = (header: ReactNode, fallback: string): string => {
    if (typeof header === 'string') {
      return header
    }
    return fallback
  }

  const resolveNextSortDirection = (columnId: string) => {
    if (sortState?.columnId === columnId && sortState.direction === UI_SORT_ASC) {
      return UI_SORT_DESC
    }
    return UI_SORT_ASC
  }

  const resolveSortIcon = (columnId: string) => {
    if (sortState?.columnId !== columnId) {
      return UI_ICON_SORT_DEFAULT
    }
    return sortState.direction === UI_SORT_ASC ? UI_ICON_SORT_ASCENDING : UI_ICON_SORT_DESCENDING
  }

  type UiAriaSortValue = typeof UI_ARIA_SORT_NONE | typeof UI_ARIA_SORT_ASCENDING | typeof UI_ARIA_SORT_DESCENDING

  const resolveAriaSort = (columnId: string): UiAriaSortValue => {
    if (sortState?.columnId !== columnId) {
      return UI_ARIA_SORT_NONE
    }
    return sortState.direction === UI_SORT_ASC ? UI_ARIA_SORT_ASCENDING : UI_ARIA_SORT_DESCENDING
  }

  const handleSort = (columnId: string) => {
    if (!onSort) {
      return
    }
    const nextDirection = resolveNextSortDirection(columnId)
    onSort(columnId, nextDirection)
  }

  const allSelected = showSelection && data.length > 0 && data.every((row) => isRowSelected(row))
  const showEmptyState = !isLoading && data.length === 0

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      {toolbar}
      <div className={composeClassNames(UI_CLASS_TABLE_WRAPPER, className)}>
        <table
          className={composeClassNames(UI_CLASS_TABLE, UI_CLASS_TABLE_DENSITY_MAP[density])}
          data-testid={testId ?? UI_TEST_ID_DATA_TABLE}
        >
          <thead>
            <tr>
              {showSelection ? (
                <th className={UI_CLASS_TABLE_SELECTION_CELL}>
                  <Form.Check
                    type="checkbox"
                    aria-label={UI_ARIA_LABEL_SELECT_ALL}
                    checked={allSelected}
                    onChange={handleToggleAll}
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const headerLabel = resolveHeaderLabel(column.header, column.id)
                return (
                  <th
                    key={column.id}
                    className={UI_CLASS_TABLE_HEADER_CELL}
                    scope="col"
                    aria-sort={column.sortable ? resolveAriaSort(column.id) : undefined}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && onSort ? (
                        <button
                          type="button"
                          className={UI_CLASS_TABLE_SORT_BUTTON}
                          onClick={() => handleSort(column.id)}
                          aria-label={`${UI_SORT_BUTTON_LABEL_PREFIX} ${headerLabel}`}
                          title={`${UI_SORT_BUTTON_LABEL_PREFIX} ${headerLabel}`}
                          aria-pressed={sortState?.columnId === column.id}
                        >
                          {resolveSortIcon(column.id)}
                        </button>
                      ) : null}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const key = rowKey(row)
              return (
                <tr key={key}>
                  {showSelection ? (
                    <td className={UI_CLASS_TABLE_SELECTION_CELL}>
                      <Form.Check
                        type="checkbox"
                        aria-label={`Select row ${key}`}
                        checked={isRowSelected(row)}
                        onChange={() => handleToggleRow(row)}
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={column.id}>{column.cell(row)}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        {showEmptyState ? <div className={UI_CLASS_TABLE_EMPTY_STATE}>{emptyState}</div> : null}
        {isLoading ? (
          <div className={UI_CLASS_TABLE_SPINNER}>
            <Spinner animation="border" />
          </div>
        ) : null}
      </div>
    </VisibilityGate>
  )
}



