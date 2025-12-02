import { render, screen } from '@testing-library/react'

import { I18nProvider } from '@/app/i18n/I18nProvider'
import { i18nResources } from '@/app/i18n/resources'
import { I18N_KEY_AUTH_HEADING } from '@/app/constants'
import { AuthRouteComponent } from '@/routes/auth/AuthRoute'

const AUTH_HEADING_TEXT = i18nResources.common[I18N_KEY_AUTH_HEADING]

describe('AuthRouteComponent', () => {
  it('renders the localized authentication heading', () => {
    render(
      <I18nProvider>
        <AuthRouteComponent />
      </I18nProvider>,
    )

    expect(screen.getByRole('heading', { name: AUTH_HEADING_TEXT })).toBeInTheDocument()
  })
})

