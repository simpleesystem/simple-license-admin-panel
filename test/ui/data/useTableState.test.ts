import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UI_SORT_DESC } from '@/ui/constants'
import { useTableState } from '@/ui/data/useTableState'

describe('useTableState', () => {
  it('stores table state and resets to page one when controls change', () => {
    const { result } = renderHook(() =>
      useTableState({
        initialPage: 3,
        initialFilters: {
          role: '',
        },
      })
    )

    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setSearchTerm('admin')
    })

    expect(result.current.searchTerm).toBe('admin')
    expect(result.current.page).toBe(1)

    act(() => {
      result.current.setPage(4)
      result.current.setFilter('role', 'SUPERUSER')
    })

    expect(result.current.filters.role).toBe('SUPERUSER')
    expect(result.current.page).toBe(1)

    act(() => {
      result.current.setPage(2)
      result.current.setSortState('email', UI_SORT_DESC)
    })

    expect(result.current.sortState).toEqual({ columnId: 'email', direction: UI_SORT_DESC })
    expect(result.current.page).toBe(1)
  })
})
