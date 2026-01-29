import type { PropsWithChildren } from 'react'
import { useEffect, useReducer } from 'react'

import { APP_STATE_ACTION_SET_SIDEBAR, APP_STATE_ACTION_SET_TENANT, APP_STATE_ACTION_SET_THEME } from '../constants'
import { AppDispatchContext, AppStateContext } from './appStateContext'
import { applyThemeClass, persistTheme, readStoredTheme } from './themeStorage'
import type { AppState, AppStateAction } from './types'

const initialState = (): AppState => ({
  activeTenantId: null,
  theme: readStoredTheme(),
  isSidebarCollapsed: false,
})

const appStateReducer = (state: AppState, action: AppStateAction): AppState => {
  switch (action.type) {
    case APP_STATE_ACTION_SET_TENANT:
      return { ...state, activeTenantId: action.payload }
    case APP_STATE_ACTION_SET_THEME:
      return { ...state, theme: action.payload }
    case APP_STATE_ACTION_SET_SIDEBAR:
      return { ...state, isSidebarCollapsed: action.payload }
    default:
      return state
  }
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appStateReducer, undefined, initialState)

  useEffect(() => {
    applyThemeClass(state.theme)
    persistTheme(state.theme)
  }, [state.theme])

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}
