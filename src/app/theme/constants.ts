import { APP_THEME_DEFAULT, APP_THEME_DARK, APP_THEME_LIGHT } from '../constants'

export const THEME_STORAGE_KEY = 'simple-license-admin-theme' as const
export const THEME_BODY_DATA_ATTRIBUTE = 'data-app-theme' as const
export const THEME_CLASS_LIGHT = 'theme-light' as const
export const THEME_CLASS_DARK = 'theme-dark' as const

export const THEME_CLASS_MAP: Record<string, string> = {
  [APP_THEME_LIGHT]: THEME_CLASS_LIGHT,
  [APP_THEME_DARK]: THEME_CLASS_DARK,
}

export const THEME_DEFAULT_CLASS = THEME_CLASS_MAP[APP_THEME_DEFAULT]

