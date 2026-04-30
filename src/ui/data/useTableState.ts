import { useState } from 'react'

import { UI_TABLE_PAGE_INITIAL } from '../constants'
import type { UiDataTableSortState, UiSortDirection } from '../types'

export type TableFilterState = Record<string, string>

export type UseTableStateOptions<TFilters extends TableFilterState> = {
  initialPage?: number
  initialSearchTerm?: string
  initialFilters?: TFilters
  initialSortState?: UiDataTableSortState
}

export function useTableState<TFilters extends TableFilterState = TableFilterState>({
  initialPage = UI_TABLE_PAGE_INITIAL,
  initialSearchTerm = '',
  initialFilters,
  initialSortState,
}: UseTableStateOptions<TFilters> = {}) {
  const [page, setPage] = useState(initialPage)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [filters, setFilters] = useState<TFilters>((initialFilters ?? {}) as TFilters)
  const [sortState, setSortState] = useState<UiDataTableSortState | undefined>(initialSortState)

  const resetPage = () => {
    setPage(UI_TABLE_PAGE_INITIAL)
  }

  const updateSearchTerm = (term: string) => {
    setSearchTerm(term)
    resetPage()
  }

  const updateFilter = <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
    setFilters((current) => ({ ...current, [key]: value }))
    resetPage()
  }

  const updateSort = (columnId: string, direction: UiSortDirection) => {
    setSortState({ columnId, direction })
    resetPage()
  }

  return {
    page,
    setPage,
    searchTerm,
    setSearchTerm: updateSearchTerm,
    filters,
    setFilter: updateFilter,
    sortState,
    setSortState: updateSort,
    resetPage,
  }
}
