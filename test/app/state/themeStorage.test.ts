import { afterEach, describe, expect, it } from 'vitest'

import { APP_THEME_DARK, APP_THEME_DEFAULT } from '../../../src/app/constants'
import { persistTheme, readStoredTheme } from '../../../src/app/state/themeStorage'
import { THEME_STORAGE_KEY } from '../../../src/app/theme/constants'

const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')
const STORAGE_UNAVAILABLE_ERROR = new Error('storage unavailable')

const restoreLocalStorage = () => {
  if (originalLocalStorageDescriptor) {
    Object.defineProperty(window, 'localStorage', originalLocalStorageDescriptor)
  }
}

describe('themeStorage', () => {
  afterEach(() => {
    restoreLocalStorage()
    window.localStorage.clear()
  })

  it('reads a valid stored theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, APP_THEME_DARK)

    expect(readStoredTheme()).toBe(APP_THEME_DARK)
  })

  it('falls back to the default theme when storage methods are unavailable', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {},
    })

    expect(readStoredTheme()).toBe(APP_THEME_DEFAULT)
  })

  it('falls back to the default theme when storage access throws', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw STORAGE_UNAVAILABLE_ERROR
      },
    })

    expect(readStoredTheme()).toBe(APP_THEME_DEFAULT)
  })

  it('ignores persist requests when storage access throws', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw STORAGE_UNAVAILABLE_ERROR
      },
    })

    expect(() => persistTheme(APP_THEME_DARK)).not.toThrow()
  })
})
