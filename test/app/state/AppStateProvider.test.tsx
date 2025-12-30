import { fireEvent, render, screen } from '@testing-library/react'

import {
  APP_STATE_ACTION_SET_SIDEBAR,
  APP_STATE_ACTION_SET_TENANT,
  APP_STATE_ACTION_SET_THEME,
  APP_THEME_DARK,
  APP_THEME_LIGHT,
} from '../../../src/app/constants'
import type { AppStateAction, ThemeName } from '../../../src/app/state/types'
import { AppStateProvider } from '../../../src/app/state/appState'
import { useAppDispatch, useAppState, useTheme } from '../../../src/app/state/appStateContext'
import { THEME_BODY_DATA_ATTRIBUTE, THEME_STORAGE_KEY } from '../../../src/app/theme/constants'

const TENANT_BUTTON_ID = 'set-tenant'
const THEME_BUTTON_ID = 'set-theme'
const SIDEBAR_BUTTON_ID = 'set-sidebar'
const UNKNOWN_ACTION_BUTTON_ID = 'dispatch-unknown'
const INVALID_THEME_BUTTON_ID = 'invalid-theme'

const StateConsumer = () => {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const theme = useTheme()

  return (
    <div>
      <span data-testid="tenant-display">{state.activeTenantId ?? 'none'}</span>
      <span data-testid="theme-display">{theme}</span>
      <span data-testid="sidebar-display">{state.isSidebarCollapsed ? 'collapsed' : 'expanded'}</span>
      <button
        type="button"
        data-testid={TENANT_BUTTON_ID}
        onClick={() => dispatch({ type: APP_STATE_ACTION_SET_TENANT, payload: 'tenant-123' })}
      >
        set-tenant
      </button>
      <button
        type="button"
        data-testid={THEME_BUTTON_ID}
        onClick={() => dispatch({ type: APP_STATE_ACTION_SET_THEME, payload: APP_THEME_DARK })}
      >
        set-theme
      </button>
      <button
        type="button"
        data-testid={SIDEBAR_BUTTON_ID}
        onClick={() => dispatch({ type: APP_STATE_ACTION_SET_SIDEBAR, payload: true })}
      >
        set-sidebar
      </button>
      <button
        type="button"
        data-testid={UNKNOWN_ACTION_BUTTON_ID}
        onClick={() => dispatch({ type: '@unknown' } as AppStateAction)}
      >
        unknown-action
      </button>
      <button
        type="button"
        data-testid={INVALID_THEME_BUTTON_ID}
        onClick={() => dispatch({ type: APP_STATE_ACTION_SET_THEME, payload: 'invalid-theme' as ThemeName })}
      >
        invalid-theme
      </button>
    </div>
  )
}

describe('AppStateProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.body.setAttribute(THEME_BODY_DATA_ATTRIBUTE, APP_THEME_LIGHT)
    document.body.className = ''
  })

  it('provides default state values and updates tenant selection', () => {
    render(
      <AppStateProvider>
        <StateConsumer />
      </AppStateProvider>,
    )

    expect(screen.getByTestId('tenant-display')).toHaveTextContent('none')
    fireEvent.click(screen.getByTestId(TENANT_BUTTON_ID))
    expect(screen.getByTestId('tenant-display')).toHaveTextContent('tenant-123')
  })

  it('persists theme changes and updates the DOM attribute', () => {
    render(
      <AppStateProvider>
        <StateConsumer />
      </AppStateProvider>,
    )

    fireEvent.click(screen.getByTestId(THEME_BUTTON_ID))

    expect(screen.getByTestId('theme-display')).toHaveTextContent(APP_THEME_DARK)
    expect(document.body.getAttribute(THEME_BODY_DATA_ATTRIBUTE)).toBe(APP_THEME_DARK)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(APP_THEME_DARK)
  })

  it('hydrates the stored theme preference on mount', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, APP_THEME_DARK)

    render(
      <AppStateProvider>
        <StateConsumer />
      </AppStateProvider>,
    )

    expect(screen.getByTestId('theme-display')).toHaveTextContent(APP_THEME_DARK)
  })

  it('falls back to the default theme when storage contains an invalid value', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'invalid-theme')

    render(
      <AppStateProvider>
        <StateConsumer />
      </AppStateProvider>,
    )

    expect(screen.getByTestId('theme-display')).toHaveTextContent(APP_THEME_LIGHT)
  })

  it('safely ignores unknown reducer actions', () => {
    render(
      <AppStateProvider>
        <StateConsumer />
      </AppStateProvider>,
    )

    fireEvent.click(screen.getByTestId(UNKNOWN_ACTION_BUTTON_ID))

    expect(screen.getByTestId('tenant-display')).toHaveTextContent('none')
  })

  it('applies the default class when an invalid theme is dispatched', () => {
    render(
      <AppStateProvider>
        <StateConsumer />
      </AppStateProvider>,
    )

    fireEvent.click(screen.getByTestId(INVALID_THEME_BUTTON_ID))

    expect(document.body.className).toContain('theme-light')
  })

  it('updates sidebar collapsed state through context dispatch', () => {
    render(
      <AppStateProvider>
        <StateConsumer />
      </AppStateProvider>,
    )

    expect(screen.getByTestId('sidebar-display')).toHaveTextContent('expanded')
    fireEvent.click(screen.getByTestId(SIDEBAR_BUTTON_ID))
    expect(screen.getByTestId('sidebar-display')).toHaveTextContent('collapsed')
  })
})
