import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTableSelection } from '../../../src/ui/data/useTableSelection'

type Row = { id: string; locked: boolean }

describe('useTableSelection', () => {
  it('toggles individual rows and respects isRowSelectable', () => {
    const { result } = renderHook(() =>
      useTableSelection<Row>({
        rowKey: (row) => row.id,
        isRowSelectable: (row) => !row.locked,
      })
    )

    act(() => {
      result.current.selection.onToggleRow({ id: '1', locked: false })
    })
    expect(result.current.selectedIds).toEqual(['1'])

    act(() => {
      result.current.selection.onToggleRow({ id: '2', locked: true })
    })
    expect(result.current.selectedIds).toEqual(['1'])
  })

  it('toggleAll selects only selectable rows on the current page', () => {
    const rows: Row[] = [
      { id: '1', locked: false },
      { id: '2', locked: true },
      { id: '3', locked: false },
    ]
    const { result } = renderHook(() =>
      useTableSelection<Row>({
        rowKey: (row) => row.id,
        isRowSelectable: (row) => !row.locked,
      })
    )

    act(() => {
      result.current.selection.onToggleAll?.(rows)
    })
    expect(result.current.selectedIds).toEqual(['1', '3'])

    act(() => {
      result.current.selection.onToggleAll?.(rows)
    })
    expect(result.current.selectedIds).toEqual([])
  })
})
