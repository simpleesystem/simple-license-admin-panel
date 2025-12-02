import { act, render, screen } from '@testing-library/react'

import {
  I18N_KEY_NOT_FOUND_BODY,
  I18N_KEY_NOT_FOUND_TITLE,
  STORAGE_KEY_AUTH_EXPIRY,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
} from '../../../src/app/constants'
import { AppProviders } from '../../../src/app/AppProviders'
import { router } from '../../../src/app/router'
import { i18nResources } from '../../../src/app/i18n/resources'

const NOT_FOUND_TITLE = i18nResources.common[I18N_KEY_NOT_FOUND_TITLE]
const NOT_FOUND_BODY = i18nResources.common[I18N_KEY_NOT_FOUND_BODY]
const TOKEN_EXPIRY_BUFFER_MS = 60_000
const STORED_USER = JSON.stringify({
  id: 'router-test-user',
  username: 'router-test',
  email: 'router@example.com',
  role: 'SUPERUSER',
})

const simulateLogin = () => {
  window.localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'test-token')
  window.localStorage.setItem(STORAGE_KEY_AUTH_EXPIRY, `${Date.now() + TOKEN_EXPIRY_BUFFER_MS}`)
  window.localStorage.setItem(STORAGE_KEY_AUTH_USER, STORED_USER)
}

describe('router configuration', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the not found route for unknown paths', async () => {
    simulateLogin()
    render(<AppProviders />)

    await act(async () => {
      await router.navigate({ to: '/unknown-route' })
    })

    expect(await screen.findByText(NOT_FOUND_TITLE)).toBeInTheDocument()
    expect(screen.getByText(NOT_FOUND_BODY)).toBeInTheDocument()
  })
})

