import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { ROUTE_PATH_PRODUCTS } from '@/app/constants'
import { ENTITY_LINK_KIND_PRODUCT } from '@/app/navigation/entityLinks'
import { useEntityNavigation } from '@/app/navigation/useEntityNavigation'
import { useAppStore } from '@/app/state/store'

afterEach(() => {
  const { dispatch } = useAppStore.getState()
  dispatch({ type: 'nav/intent', payload: null })
  dispatch({ type: 'table/clearSeed' })
})

describe('useEntityNavigation', () => {
  test('hrefFor returns the destination route path', () => {
    const { result } = renderHook(() => useEntityNavigation())

    expect(result.current.hrefFor(ENTITY_LINK_KIND_PRODUCT, 'acme')).toBe(ROUTE_PATH_PRODUCTS)
  })

  test('navigateTo seeds the destination search term and raises a navigation intent', () => {
    const { result } = renderHook(() => useEntityNavigation())

    act(() => {
      result.current.navigateTo(ENTITY_LINK_KIND_PRODUCT, 'acme')
    })

    const state = useAppStore.getState()
    expect(state.tableSeed).toEqual({ path: ROUTE_PATH_PRODUCTS, term: 'acme' })
    expect(state.navigationIntent).toEqual({ to: ROUTE_PATH_PRODUCTS })
  })

  test('navigateTo clears a stale seed when the target has no search term', () => {
    useAppStore.getState().dispatch({ type: 'table/seed', payload: { path: '/stale', term: 'old' } })
    const { result } = renderHook(() => useEntityNavigation())

    act(() => {
      result.current.navigateTo(ENTITY_LINK_KIND_PRODUCT, '   ')
    })

    expect(useAppStore.getState().tableSeed).toBeNull()
  })
})
