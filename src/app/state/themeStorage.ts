/* c8 ignore file */

import { APP_THEME_DEFAULT } from '../constants'
import { THEME_BODY_DATA_ATTRIBUTE, THEME_CLASS_MAP, THEME_DEFAULT_CLASS, THEME_STORAGE_KEY } from '../theme/constants'
import type { ThemeName } from './types'

type BrowserThemeStorage = Pick<Storage, 'getItem' | 'setItem'>

const getBrowserThemeStorage = (): BrowserThemeStorage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storage = window.localStorage
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
      return null
    }
    return storage
  } catch {
    return null
  }
}

export const readStoredTheme = (): ThemeName => {
  const storage = getBrowserThemeStorage()
  if (!storage) {
    return APP_THEME_DEFAULT
  }

  try {
    const stored = storage.getItem(THEME_STORAGE_KEY)
    if (stored && stored in THEME_CLASS_MAP) {
      return stored as ThemeName
    }
  } catch {
    return APP_THEME_DEFAULT
  }

  return APP_THEME_DEFAULT
}

export const persistTheme = (theme: ThemeName): void => {
  const storage = getBrowserThemeStorage()
  if (!storage) {
    return
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    return
  }
}

export const applyThemeClass = (theme: ThemeName): void => {
  if (typeof window === 'undefined') {
    return
  }
  const body = window.document.body
  body.setAttribute(THEME_BODY_DATA_ATTRIBUTE, theme)

  body.classList.remove(...Object.values(THEME_CLASS_MAP))
  body.classList.add(THEME_CLASS_MAP[theme] ?? THEME_DEFAULT_CLASS)
}
