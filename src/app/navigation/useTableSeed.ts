import { useEffect, useRef, useState } from 'react'

import { type AppStore, selectTableSeed, useAppStore } from '../state/store'

const selectDispatch = (state: AppStore) => state.dispatch

/**
 * Reads a one-shot cross-navigation search seed for the given route path.
 *
 * A cross-link (see {@link useEntityNavigation}) stashes a search term for the
 * destination route before navigating. The destination route calls this hook to
 * pick up the term as its initial table search, then immediately clears the seed
 * so it cannot leak into later navigations.
 */
export function useTableSeed(path: string): string {
  const seed = useAppStore(selectTableSeed)
  const dispatch = useAppStore(selectDispatch)
  const consumedRef = useRef(false)
  const [initialTerm] = useState(() => (seed && seed.path === path ? seed.term : ''))

  useEffect(() => {
    if (consumedRef.current) {
      return
    }
    consumedRef.current = true
    if (initialTerm.length > 0) {
      dispatch({ type: 'table/clearSeed' })
    }
  }, [dispatch, initialTerm])

  return initialTerm
}
