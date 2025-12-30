import { createContext, useContext } from 'react'

import { APP_THEME_LIGHT, ERROR_MESSAGE_APP_STATE_CONTEXT_UNAVAILABLE } from '../../app/constants'
import type { AppDispatch, AppState, ThemeName } from './types'

export const AppStateContext = createContext<AppState | null>(null)
export const AppDispatchContext = createContext<AppDispatch | null>(null)

export const useAppState = (): AppState => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_APP_STATE_CONTEXT_UNAVAILABLE)
  }
  return context
}

export const useAppDispatch = (): AppDispatch => {
  const context = useContext(AppDispatchContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_APP_STATE_CONTEXT_UNAVAILABLE)
  }
  return context
}

export const useTheme = (): ThemeName => {
  const { theme } = useAppState()
  return theme ?? APP_THEME_LIGHT
}
