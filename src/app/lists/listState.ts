import {
  LIST_DEFAULT_PAGE,
  LIST_DEFAULT_PAGE_SIZE,
  LIST_FILTER_PARAM_PREFIX,
  LIST_MAX_PAGE_SIZE,
  LIST_QUERY_PARAM_DIRECTION,
  LIST_QUERY_PARAM_PAGE,
  LIST_QUERY_PARAM_PAGE_SIZE,
  LIST_QUERY_PARAM_SEARCH,
  LIST_QUERY_PARAM_SORT,
  LIST_SORT_DIRECTION_ASC,
  LIST_SORT_DIRECTION_DESC,
} from '../constants'
import type { ListFilterState, ListPaginationState, ListSortDirection, ListState } from './listTypes'
import { DEFAULT_LIST_STATE } from './listTypes'

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min
  }
  return Math.min(Math.max(value, min), max)
}

const normalizePage = (page?: number): number => {
  if (typeof page !== 'number' || Number.isNaN(page)) {
    return LIST_DEFAULT_PAGE
  }
  return clamp(Math.floor(page), LIST_DEFAULT_PAGE, Number.MAX_SAFE_INTEGER)
}

const normalizePageSize = (pageSize?: number): number => {
  if (typeof pageSize !== 'number' || Number.isNaN(pageSize)) {
    return LIST_DEFAULT_PAGE_SIZE
  }
  return clamp(Math.floor(pageSize), 1, LIST_MAX_PAGE_SIZE)
}

const isValidDirection = (direction?: string): direction is ListSortDirection =>
  direction === LIST_SORT_DIRECTION_ASC || direction === LIST_SORT_DIRECTION_DESC

export const createListState = (partial: Partial<ListState> = {}): ListState => {
  const paginationOverride: Partial<ListPaginationState> = partial.pagination ?? {}
  const page = normalizePage(paginationOverride.page)
  const pageSize = normalizePageSize(paginationOverride.pageSize)
  const sort = partial.sort ?? null
  const search = partial.search?.trim() ? partial.search.trim() : null

  return {
    pagination: {
      page,
      pageSize,
    },
    sort,
    search,
    filters: partial.filters ?? {},
  }
}

export const serializeListState = (state: ListState): URLSearchParams => {
  const params = new URLSearchParams()
  params.set(LIST_QUERY_PARAM_PAGE, `${state.pagination.page}`)
  params.set(LIST_QUERY_PARAM_PAGE_SIZE, `${state.pagination.pageSize}`)

  if (state.sort?.field) {
    params.set(LIST_QUERY_PARAM_SORT, state.sort.field)
    params.set(
      LIST_QUERY_PARAM_DIRECTION,
      state.sort.direction ?? LIST_SORT_DIRECTION_ASC,
    )
  }

  if (state.search) {
    params.set(LIST_QUERY_PARAM_SEARCH, state.search)
  }

  const filters = state.filters ?? {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || key.length === 0) {
      return
    }
    const paramKey = `${LIST_FILTER_PARAM_PREFIX}${key}`
    if (Array.isArray(value)) {
      params.set(paramKey, value.join(','))
      return
    }
    params.set(paramKey, `${value}`)
  })

  return params
}

const parseFilters = (params: URLSearchParams): ListFilterState => {
  const result: ListFilterState = {}
  params.forEach((value, key) => {
    if (!key.startsWith(LIST_FILTER_PARAM_PREFIX)) {
      return
    }
    const filterKey = key.slice(LIST_FILTER_PARAM_PREFIX.length)
    if (!filterKey) {
      return
    }
    if (value.includes(',')) {
      result[filterKey] = value.split(',').map((entry) => entry.trim()).filter(Boolean)
      return
    }
    result[filterKey] = value
  })
  return result
}

export const parseListState = (
  params: URLSearchParams,
  defaults: ListState = DEFAULT_LIST_STATE,
): ListState => {
  const page = normalizePage(Number.parseInt(params.get(LIST_QUERY_PARAM_PAGE) ?? '', 10))
  const pageSize = normalizePageSize(
    Number.parseInt(params.get(LIST_QUERY_PARAM_PAGE_SIZE) ?? '', 10),
  )
  const sortField = params.get(LIST_QUERY_PARAM_SORT)
  const directionParam = params.get(LIST_QUERY_PARAM_DIRECTION) ?? LIST_SORT_DIRECTION_ASC
  const direction = isValidDirection(directionParam)
    ? directionParam
    : LIST_SORT_DIRECTION_ASC
  const search = params.get(LIST_QUERY_PARAM_SEARCH)
  const filters = parseFilters(params)

  return {
    pagination: {
      page: page || defaults.pagination.page,
      pageSize: pageSize || defaults.pagination.pageSize,
    },
    sort: sortField ? { field: sortField, direction } : defaults.sort ?? null,
    search: search ? search.trim() : defaults.search ?? null,
    filters: Object.keys(filters).length > 0 ? filters : defaults.filters ?? {},
  }
}

export const buildListQueryOptions = (state: ListState) => {
  const page = normalizePage(state.pagination.page)
  const pageSize = normalizePageSize(state.pagination.pageSize)
  const offset = (page - 1) * pageSize

  return {
    limit: pageSize,
    offset,
    sortField: state.sort?.field ?? null,
    sortDirection: state.sort?.direction ?? null,
    search: state.search ?? null,
    filters: state.filters ?? {},
  }
}


