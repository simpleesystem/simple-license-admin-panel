import { useCallback } from 'react'

import { UI_TABLE_PAGE_INITIAL } from '../../ui/constants'
import type { TableFilterState } from '../../ui/data/useTableState'

type FilterSetter<TFilters extends TableFilterState> = <TKey extends keyof TFilters>(
  key: TKey,
  value: TFilters[TKey]
) => void

type FilterPatch<TFilters extends TableFilterState> = Partial<TFilters>

export function usePagedFilters<TFilters extends TableFilterState>(
  setFilter: FilterSetter<TFilters>,
  goToPage: (page: number) => void
) {
  const setFilterAndReset = useCallback(
    <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
      setFilter(key, value)
      goToPage(UI_TABLE_PAGE_INITIAL)
    },
    [goToPage, setFilter]
  )

  const setFiltersAndReset = useCallback(
    (updates: FilterPatch<TFilters>) => {
      const entries = Object.entries(updates) as Array<[keyof TFilters, TFilters[keyof TFilters]]>
      for (const [key, value] of entries) {
        setFilter(key, value)
      }
      goToPage(UI_TABLE_PAGE_INITIAL)
    },
    [goToPage, setFilter]
  )

  return {
    setFilterAndReset,
    setFiltersAndReset,
  }
}
