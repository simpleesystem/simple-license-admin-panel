export type ErrorScope = 'global' | 'auth' | 'data' | 'navigation' | string

import type { Dispatch } from 'react'

import type {
  APP_STATE_ACTION_SET_SIDEBAR,
  APP_STATE_ACTION_SET_TENANT,
  APP_STATE_ACTION_SET_THEME,
} from '../../app/constants'
import type { THEME_CLASS_MAP } from '../theme/constants'

export type ThemeName = keyof typeof THEME_CLASS_MAP

export type AppState = {
  activeTenantId: string | null
  theme: ThemeName
  isSidebarCollapsed: boolean
}

export type AppStateAction =
  | { type: typeof APP_STATE_ACTION_SET_TENANT; payload: string | null }
  | { type: typeof APP_STATE_ACTION_SET_THEME; payload: ThemeName }
  | { type: typeof APP_STATE_ACTION_SET_SIDEBAR; payload: boolean }

export type AppDispatch = Dispatch<AppStateAction>
