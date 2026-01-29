import { useCallback, useMemo, useState } from 'react'

import { UI_SORT_ASC, UI_TABLE_PAGE_SIZE_DEFAULT } from '../constants'
import type { UiDataTableSortState, UiSortDirection } from '../types'

type Comparator<TData> = (a: TData, b: TData) => number

type UseDataTableStateOptions<TData> = {
  data: readonly TData[]
  pageSize?: number
  initialSort?: UiDataTableSortState
  sortComparators?: Record<string, Comparator<TData>>
  search?: (row: TData, term: string) => boolean
  filter?: (row: TData) => boolean
}

type UseDataTableStateResult<TData> = {
  rows: readonly TData[]
  sortState?: UiDataTableSortState
  onSort: (columnId: string, direction: UiSortDirection) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  page: number
  pageSize: number
  totalPages: number
  goToPage: (nextPage: number) => void
}

const defaultSearch = <TData>(row: TData, term: string): boolean => {
  const haystack = JSON.stringify(row).toLowerCase()
  return haystack.includes(term.toLowerCase())
}

export function useDataTableState<TData>({
  data,
  pageSize = UI_TABLE_PAGE_SIZE_DEFAULT,
  initialSort,
  sortComparators = {},
  search = defaultSearch,
  filter,
}: UseDataTableStateOptions<TData>): UseDataTableStateResult<TData> {
  const [sortState, setSortState] = useState<UiDataTableSortState | undefined>(initialSort)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const trimmedTerm = searchTerm.trim()
    return data.filter((row) => {
      if (filter && !filter(row)) {
        return false
      }
      if (trimmedTerm.length === 0) {
        return true
      }
      return search(row, trimmedTerm)
    })
  }, [data, filter, search, searchTerm])

  const sorted = useMemo(() => {
    if (!sortState) {
      return filtered
    }
    const comparator = sortComparators[sortState.columnId]
    if (!comparator) {
      return filtered
    }
    const directionMultiplier = sortState.direction === UI_SORT_ASC ? 1 : -1
    return [...filtered].sort((left, right) => comparator(left, right) * directionMultiplier)
  }, [filtered, sortComparators, sortState])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const rows = sorted.slice(start, start + pageSize)

  const onSort = useCallback((columnId: string, direction: UiSortDirection) => {
    setSortState({ columnId, direction })
    setPage(1)
  }, [])

  const goToPage = useCallback(
    (nextPage: number) => {
      const clamped = Math.max(1, Math.min(totalPages, nextPage))
      setPage(clamped)
    },
    [totalPages]
  )

  const setSearchTermClamped = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  return {
    rows,
    sortState,
    onSort,
    searchTerm,
    setSearchTerm: setSearchTermClamped,
    page: currentPage,
    pageSize,
    totalPages,
    goToPage,
  }
}
