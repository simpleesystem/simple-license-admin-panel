/* c8 ignore file */

import { APP_THEME_DEFAULT } from '../constants'
import {
  THEME_BODY_DATA_ATTRIBUTE,
  THEME_CLASS_MAP,
  THEME_DEFAULT_CLASS,
  THEME_STORAGE_KEY,
} from '../theme/constants'
import type { ThemeName } from './types'

const isBrowser = typeof window !== 'undefined'

export const readStoredTheme = (): ThemeName => {
  if (!isBrowser) {
    return APP_THEME_DEFAULT
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && stored in THEME_CLASS_MAP) {
    return stored as ThemeName
  }
  return APP_THEME_DEFAULT
}

export const persistTheme = (theme: ThemeName): void => {
  if (isBrowser) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}

export const applyThemeClass = (theme: ThemeName): void => {
  if (!isBrowser) {
    return
  }
  const body = window.document.body
  body.setAttribute(THEME_BODY_DATA_ATTRIBUTE, theme)

  body.classList.remove(...Object.values(THEME_CLASS_MAP))
  body.classList.add(THEME_CLASS_MAP[theme] ?? THEME_DEFAULT_CLASS)
}

