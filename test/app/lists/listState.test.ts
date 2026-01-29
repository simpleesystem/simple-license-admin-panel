import { describe, expect, it } from 'vitest'
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
} from '../../../src/app/constants'
import {
  buildListQueryOptions,
  createListState,
  parseListState,
  serializeListState,
} from '../../../src/app/lists/listState'

describe('list state helpers', () => {
  it('creates a list state with defaults', () => {
    const state = createListState()

    expect(state.pagination.page).toBe(LIST_DEFAULT_PAGE)
    expect(state.pagination.pageSize).toBe(LIST_DEFAULT_PAGE_SIZE)
    expect(state.sort).toBeNull()
    expect(state.search).toBeNull()
  })

  it('serializes and parses roundtrip', () => {
    const initialState = createListState({
      pagination: { page: 3, pageSize: 50 },
      sort: { field: 'name', direction: LIST_SORT_DIRECTION_DESC },
      search: 'alpha',
      filters: {
        status: ['ACTIVE', 'SUSPENDED'],
        tier: 'PRO',
      },
    })

    const params = serializeListState(initialState)
    expect(params.get(LIST_QUERY_PARAM_PAGE)).toBe('3')
    expect(params.get(LIST_QUERY_PARAM_PAGE_SIZE)).toBe('50')
    expect(params.get(LIST_QUERY_PARAM_SORT)).toBe('name')
    expect(params.get(LIST_QUERY_PARAM_DIRECTION)).toBe(LIST_SORT_DIRECTION_DESC)
    expect(params.get(LIST_QUERY_PARAM_SEARCH)).toBe('alpha')
    expect(params.get(`${LIST_FILTER_PARAM_PREFIX}status`)).toBe('ACTIVE,SUSPENDED')
    expect(params.get(`${LIST_FILTER_PARAM_PREFIX}tier`)).toBe('PRO')

    const parsed = parseListState(params)
    expect(parsed).toEqual(initialState)
  })

  it('builds query options for API consumption', () => {
    const state = createListState({
      pagination: { page: 2, pageSize: 40 },
      sort: { field: 'createdAt', direction: LIST_SORT_DIRECTION_ASC },
      search: 'beta',
      filters: { status: 'ACTIVE' },
    })

    const query = buildListQueryOptions(state)

    expect(query).toEqual({
      limit: 40,
      offset: 40,
      sortField: 'createdAt',
      sortDirection: LIST_SORT_DIRECTION_ASC,
      search: 'beta',
      filters: { status: 'ACTIVE' },
    })
  })

  it('parses search params with invalid values gracefully', () => {
    const params = new URLSearchParams({
      [LIST_QUERY_PARAM_PAGE]: '-5',
      [LIST_QUERY_PARAM_PAGE_SIZE]: '9999',
      [LIST_QUERY_PARAM_SORT]: 'tierCode',
      [LIST_QUERY_PARAM_DIRECTION]: 'invalid',
      [LIST_QUERY_PARAM_SEARCH]: '  echo  ',
    })
    params.set(`${LIST_FILTER_PARAM_PREFIX}status`, 'ACTIVE')

    const parsed = parseListState(params)

    expect(parsed.pagination.page).toBe(LIST_DEFAULT_PAGE)
    expect(parsed.pagination.pageSize).toBe(LIST_MAX_PAGE_SIZE)
    expect(parsed.sort?.direction).toBe(LIST_SORT_DIRECTION_ASC)
    expect(parsed.search).toBe('echo')
    expect(parsed.filters).toEqual({ status: 'ACTIVE' })
  })
  it('returns default filters when none provided', () => {
    const params = new URLSearchParams({})
    const parsed = parseListState(params, createListState({ filters: { status: 'ACTIVE' } }))
    expect(parsed.filters).toEqual({ status: 'ACTIVE' })
  })

  it('clamps invalid page values when building query options', () => {
    const state = createListState({
      pagination: { page: -10, pageSize: 10 },
    })
    const query = buildListQueryOptions(state)
    expect(query.offset).toBe(0)
  })

  it('clamps NaN pagination values when creating state', () => {
    const state = createListState({
      pagination: { page: Number.NaN, pageSize: Number.NaN },
    })
    expect(state.pagination.page).toBe(LIST_DEFAULT_PAGE)
    expect(state.pagination.pageSize).toBe(LIST_DEFAULT_PAGE_SIZE)
  })

  it('omits filters with empty keys or values during serialization', () => {
    const state = createListState({
      filters: {
        status: 'ACTIVE',
        emptyValue: undefined,
        '': 'ignored',
      },
    })

    const params = serializeListState(state)

    expect(params.get(`${LIST_FILTER_PARAM_PREFIX}status`)).toBe('ACTIVE')
    expect(params.get(`${LIST_FILTER_PARAM_PREFIX}emptyValue`)).toBeNull()
    expect(params.get(LIST_FILTER_PARAM_PREFIX)).toBeNull()
  })

  it('ignores filter params without keys when parsing', () => {
    const params = new URLSearchParams()
    params.set(LIST_QUERY_PARAM_PAGE, '2')
    params.set(LIST_FILTER_PARAM_PREFIX, 'value')

    const parsed = parseListState(params)
    expect(parsed.filters).toEqual({})
  })
})
