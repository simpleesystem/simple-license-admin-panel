import { useCallback, useMemo, useState } from 'react'

import type { UiDataTableSelection } from '../types'

type UseTableSelectionOptions<TData> = {
  rowKey: (row: TData) => string
  isRowSelectable?: (row: TData) => boolean
}

type UseTableSelectionResult<TData> = {
  selectedIds: readonly string[]
  selection: UiDataTableSelection<TData>
  clearSelection: () => void
  selectedRows: (rows: readonly TData[]) => TData[]
}

export function useTableSelection<TData>({
  rowKey,
  isRowSelectable,
}: UseTableSelectionOptions<TData>): UseTableSelectionResult<TData> {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const canSelect = useCallback((row: TData) => (isRowSelectable ? isRowSelectable(row) : true), [isRowSelectable])

  const onToggleRow = useCallback(
    (row: TData) => {
      if (!canSelect(row)) {
        return
      }
      const id = rowKey(row)
      setSelectedIds((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]))
    },
    [canSelect, rowKey]
  )

  const onToggleAll = useCallback(
    (rows: readonly TData[]) => {
      const selectableRows = rows.filter(canSelect)
      const selectableIds = selectableRows.map(rowKey)
      if (selectableIds.length === 0) {
        return
      }
      const allSelected = selectableIds.every((id) => selectedIds.includes(id))
      if (allSelected) {
        setSelectedIds((current) => current.filter((id) => !selectableIds.includes(id)))
        return
      }
      setSelectedIds((current) => {
        const merged = new Set([...current, ...selectableIds])
        return [...merged]
      })
    },
    [canSelect, rowKey, selectedIds]
  )

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const selection = useMemo<UiDataTableSelection<TData>>(
    () => ({
      selectedIds,
      onToggleRow,
      onToggleAll,
      isRowSelectable,
    }),
    [isRowSelectable, onToggleAll, onToggleRow, selectedIds]
  )

  const selectedRows = useCallback(
    (rows: readonly TData[]) => rows.filter((row) => selectedIds.includes(rowKey(row))),
    [rowKey, selectedIds]
  )

  return {
    selectedIds,
    selection,
    clearSelection,
    selectedRows,
  }
}
