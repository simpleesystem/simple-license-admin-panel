import { useCallback } from 'react'

import { type AppStore, useAppStore } from '../state/store'
import { buildEntityLinkTarget, type EntityLinkKind, type EntityLinkTarget } from './entityLinks'

type UseEntityNavigationResult = {
  resolve: (kind: EntityLinkKind, value: string) => EntityLinkTarget
  hrefFor: (kind: EntityLinkKind, value: string) => string
  navigateTo: (kind: EntityLinkKind, value: string) => void
}

const selectDispatch = (state: AppStore) => state.dispatch

export function useEntityNavigation(): UseEntityNavigationResult {
  const dispatch = useAppStore(selectDispatch)

  const resolve = useCallback((kind: EntityLinkKind, value: string) => buildEntityLinkTarget(kind, value), [])

  const hrefFor = useCallback((kind: EntityLinkKind, value: string) => resolve(kind, value).to, [resolve])

  const navigateTo = useCallback(
    (kind: EntityLinkKind, value: string) => {
      const target = resolve(kind, value)
      if (target.searchTerm.length > 0) {
        dispatch({ type: 'table/seed', payload: { path: target.to, term: target.searchTerm } })
      } else {
        dispatch({ type: 'table/clearSeed' })
      }
      dispatch({ type: 'nav/intent', payload: { to: target.to } })
    },
    [dispatch, resolve]
  )

  return { resolve, hrefFor, navigateTo }
}
