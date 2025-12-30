import {
  LIST_DEFAULT_PAGE,
  LIST_DEFAULT_PAGE_SIZE,
  LIST_SORT_DIRECTION_ASC,
  LIST_SORT_DIRECTION_DESC,
} from '../constants'

export type ListSortDirection = typeof LIST_SORT_DIRECTION_ASC | typeof LIST_SORT_DIRECTION_DESC

export type ListSort = {
  field: string
  direction: ListSortDirection
}

export type ListPaginationState = {
  page: number
  pageSize: number
}

export type ListFilterPrimitive = string | number | boolean
export type ListFilterValue = ListFilterPrimitive | ListFilterPrimitive[]
export type ListFilterState = Record<string, ListFilterValue>

export type ListState = {
  pagination: ListPaginationState
  sort?: ListSort | null
  search?: string | null
  filters?: ListFilterState
}

export const LIST_SORT_DIRECTIONS: readonly ListSortDirection[] = [
  LIST_SORT_DIRECTION_ASC,
  LIST_SORT_DIRECTION_DESC,
] as const

export const DEFAULT_LIST_STATE: ListState = {
  pagination: {
    page: LIST_DEFAULT_PAGE,
    pageSize: LIST_DEFAULT_PAGE_SIZE,
  },
  sort: null,
  search: null,
  filters: {},
}
