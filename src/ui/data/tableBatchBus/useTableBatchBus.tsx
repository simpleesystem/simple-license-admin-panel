import { useMemo } from 'react'
import { TableBatchActions } from '../TableBatchActions'
import { useTableSelection } from '../useTableSelection'
import { resolveTableBatchRowSelectable, useBuildTableBatchActions } from './buildTableBatchActions'
import type { TableBatchBusContextMap, TableBatchTableId } from './types'

export type UseTableBatchBusOptions<TData, TTableId extends TableBatchTableId> = {
  tableId: TTableId
  enabled: boolean
  visibleRows: readonly TData[]
  rowKey: (row: TData) => string
  context: TableBatchBusContextMap[TTableId]
  isRowSelectable?: (row: TData) => boolean
}

export function useTableBatchBus<TData, TTableId extends TableBatchTableId>({
  tableId,
  enabled,
  visibleRows,
  rowKey,
  context,
  isRowSelectable,
}: UseTableBatchBusOptions<TData, TTableId>) {
  const batchActions = useBuildTableBatchActions<TData, TTableId>(tableId, context)
  const defaultSelectable = resolveTableBatchRowSelectable<TData, TTableId>(tableId, context)
  const effectiveSelectable = isRowSelectable ?? defaultSelectable

  const { selectedIds, selection, clearSelection, selectedRows } = useTableSelection<TData>({
    rowKey,
    isRowSelectable: effectiveSelectable,
  })

  const batchEnabled = enabled && batchActions.length > 0

  const batchBar = useMemo(() => {
    if (!batchEnabled) {
      return null
    }
    return (
      <TableBatchActions
        selectedCount={selectedIds.length}
        selectedRows={selectedRows(visibleRows)}
        actions={batchActions}
        onClearSelection={clearSelection}
      />
    )
  }, [batchActions, batchEnabled, clearSelection, selectedIds.length, selectedRows, visibleRows])

  return {
    selection: batchEnabled ? selection : undefined,
    batchBar,
    clearSelection,
    selectedIds,
  }
}
