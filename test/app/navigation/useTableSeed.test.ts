import { renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, test } from 'vitest'

import { ROUTE_PATH_LICENSES, ROUTE_PATH_PRODUCTS } from '@/app/constants'
import { useTableSeed } from '@/app/navigation/useTableSeed'
import { useAppStore } from '@/app/state/store'

afterEach(() => {
  useAppStore.getState().dispatch({ type: 'table/clearSeed' })
})

describe('useTableSeed', () => {
  test('returns the seeded term for a matching path and clears the seed', () => {
    useAppStore.getState().dispatch({ type: 'table/seed', payload: { path: ROUTE_PATH_LICENSES, term: 'acme' } })

    const { result } = renderHook(() => useTableSeed(ROUTE_PATH_LICENSES))

    expect(result.current).toBe('acme')
    expect(useAppStore.getState().tableSeed).toBeNull()
  })

  test('returns an empty string when no seed is present', () => {
    const { result } = renderHook(() => useTableSeed(ROUTE_PATH_LICENSES))

    expect(result.current).toBe('')
  })

  test('ignores and preserves a seed stored for a different path', () => {
    useAppStore.getState().dispatch({ type: 'table/seed', payload: { path: ROUTE_PATH_PRODUCTS, term: 'acme' } })

    const { result } = renderHook(() => useTableSeed(ROUTE_PATH_LICENSES))

    expect(result.current).toBe('')
    expect(useAppStore.getState().tableSeed).toEqual({ path: ROUTE_PATH_PRODUCTS, term: 'acme' })
  })

  test('consumes the seed exactly once under double-invoked effects', () => {
    useAppStore.getState().dispatch({ type: 'table/seed', payload: { path: ROUTE_PATH_LICENSES, term: 'acme' } })

    const { result } = renderHook(() => useTableSeed(ROUTE_PATH_LICENSES), { wrapper: StrictMode })

    expect(result.current).toBe('acme')
    expect(useAppStore.getState().tableSeed).toBeNull()
  })
})
