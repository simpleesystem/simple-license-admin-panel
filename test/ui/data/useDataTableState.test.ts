import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UI_SORT_ASC, UI_SORT_DESC } from '@/ui/constants'
import { useDataTableState } from '@/ui/data/useDataTableState'

type TestData = {
  id: number
  name: string
  category: string
}

const testData: TestData[] = [
  { id: 1, name: 'Apple', category: 'Fruit' },
  { id: 2, name: 'Banana', category: 'Fruit' },
  { id: 3, name: 'Carrot', category: 'Vegetable' },
  { id: 4, name: 'Date', category: 'Fruit' },
  { id: 5, name: 'Eggplant', category: 'Vegetable' },
]

describe('useDataTableState', () => {
  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useDataTableState({ data: testData }))

    expect(result.current.rows).toEqual(testData)
    expect(result.current.page).toBe(1)
    expect(result.current.searchTerm).toBe('')
    expect(result.current.sortState).toBeUndefined()
  })

  it('paginates data', () => {
    const { result } = renderHook(() => useDataTableState({ data: testData, pageSize: 2 }))

    expect(result.current.rows).toHaveLength(2)
    expect(result.current.rows[0].name).toBe('Apple')
    expect(result.current.rows[1].name).toBe('Banana')
    expect(result.current.totalPages).toBe(3) // 5 items / 2 per page = 2.5 -> 3
  })

  it('navigates pages', () => {
    const { result } = renderHook(() => useDataTableState({ data: testData, pageSize: 2 }))

    act(() => {
      result.current.goToPage(2)
    })

    expect(result.current.page).toBe(2)
    expect(result.current.rows).toHaveLength(2)
    expect(result.current.rows[0].name).toBe('Carrot')
    expect(result.current.rows[1].name).toBe('Date')

    act(() => {
      result.current.goToPage(3)
    })

    expect(result.current.page).toBe(3)
    expect(result.current.rows).toHaveLength(1)
    expect(result.current.rows[0].name).toBe('Eggplant')
  })

  it('clamps page navigation', () => {
    const { result } = renderHook(() => useDataTableState({ data: testData, pageSize: 2 }))

    act(() => {
      result.current.goToPage(0)
    })
    expect(result.current.page).toBe(1)

    act(() => {
      result.current.goToPage(100)
    })
    expect(result.current.page).toBe(3)
  })

  it('filters data by search term (default search)', () => {
    const { result } = renderHook(() => useDataTableState({ data: testData }))

    act(() => {
      result.current.setSearchTerm('egg')
    })

    expect(result.current.rows).toHaveLength(1)
    expect(result.current.rows[0].name).toBe('Eggplant')
    expect(result.current.page).toBe(1) // Resets page on search
  })

  it('filters data using custom search', () => {
    const search = (row: TestData, term: string) => row.category.toLowerCase().includes(term.toLowerCase())
    const { result } = renderHook(() => useDataTableState({ data: testData, search }))

    act(() => {
      result.current.setSearchTerm('veg')
    })

    expect(result.current.rows).toHaveLength(2)
    expect(result.current.rows[0].name).toBe('Carrot')
    expect(result.current.rows[1].name).toBe('Eggplant')
  })

  it('filters data using custom filter', () => {
    const filter = (row: TestData) => row.id % 2 === 0
    const { result } = renderHook(() => useDataTableState({ data: testData, filter }))

    expect(result.current.rows).toHaveLength(2)
    expect(result.current.rows[0].name).toBe('Banana') // id 2
    expect(result.current.rows[1].name).toBe('Date') // id 4
  })

  it('sorts data', () => {
    const sortComparators = {
      name: (a: TestData, b: TestData) => a.name.localeCompare(b.name),
    }
    const { result } = renderHook(() =>
      useDataTableState({
        data: testData,
        pageSize: 10,
        sortComparators,
      })
    )

    act(() => {
      result.current.onSort('name', UI_SORT_DESC)
    })

    expect(result.current.rows[0].name).toBe('Eggplant')
    expect(result.current.sortState).toEqual({ columnId: 'name', direction: UI_SORT_DESC })

    act(() => {
      result.current.onSort('name', UI_SORT_ASC)
    })

    expect(result.current.rows[0].name).toBe('Apple')
  })

  it('handles sorting without comparator (no-op)', () => {
    const { result } = renderHook(() =>
      useDataTableState({
        data: testData,
        pageSize: 10,
      })
    )

    act(() => {
      result.current.onSort('unknown', UI_SORT_DESC)
    })

    // Order should remain original
    expect(result.current.rows[0].name).toBe('Apple')
  })

  it('resets page on sort', () => {
    const sortComparators = {
      name: (a: TestData, b: TestData) => a.name.localeCompare(b.name),
    }
    const { result } = renderHook(() =>
      useDataTableState({
        data: testData,
        pageSize: 2,
        sortComparators,
      })
    )

    act(() => {
      result.current.goToPage(2)
    })
    expect(result.current.page).toBe(2)

    act(() => {
      result.current.onSort('name', UI_SORT_DESC)
    })
    expect(result.current.page).toBe(1)
  })

  it('handles empty search term', () => {
    const { result } = renderHook(() => useDataTableState({ data: testData }))

    act(() => {
      result.current.setSearchTerm('  ') // Only whitespace
    })

    expect(result.current.rows).toHaveLength(5)
  })
})
