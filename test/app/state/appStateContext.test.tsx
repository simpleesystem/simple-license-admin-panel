import { render } from '@testing-library/react'
import { useEffect } from 'react'
import { vi } from 'vitest'

import {
  ERROR_MESSAGE_APP_STATE_CONTEXT_UNAVAILABLE,
  APP_THEME_LIGHT,
} from '../../../src/app/constants'
import { AppStateProvider } from '../../../src/app/state/appState'
import { useAppDispatch, useAppState, useTheme } from '../../../src/app/state/appStateContext'

const StateHookConsumer = () => {
  useAppState()
  return null
}

const DispatchHookConsumer = () => {
  useAppDispatch()
  return null
}

const ThemeHookConsumer = ({ onTheme }: { onTheme: (theme: string) => void }) => {
  const theme = useTheme()
  useEffect(() => {
    onTheme(theme)
  }, [theme, onTheme])
  return null
}

describe('appStateContext hooks', () => {
  it('throws when useAppState is invoked outside the provider', () => {
    expect(() => render(<StateHookConsumer />)).toThrow(ERROR_MESSAGE_APP_STATE_CONTEXT_UNAVAILABLE)
  })

  it('throws when useAppDispatch is invoked outside the provider', () => {
    expect(() => render(<DispatchHookConsumer />)).toThrow(ERROR_MESSAGE_APP_STATE_CONTEXT_UNAVAILABLE)
  })

  it('returns the default theme when wrapped in the provider', () => {
    const handleTheme = vi.fn()
    render(
      <AppStateProvider>
        <ThemeHookConsumer onTheme={handleTheme} />
      </AppStateProvider>,
    )

    expect(handleTheme).toHaveBeenCalledWith(APP_THEME_LIGHT)
  })
})
