import { Outlet } from '@tanstack/react-router'
import { Container, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { I18N_KEY_APP_BRAND, I18N_KEY_APP_TAGLINE, TEST_ID_APP_SHELL } from '../../app/constants'

export function RootRouteComponent() {
  const { t } = useTranslation()

  return (
    <>
      <Navbar bg="dark" data-testid={TEST_ID_APP_SHELL} variant="dark" className="mb-4">
        <Container fluid className="justify-content-between">
          <div>
            <Navbar.Brand>{t(I18N_KEY_APP_BRAND)}</Navbar.Brand>
            <small className="text-light-emphasis">{t(I18N_KEY_APP_TAGLINE)}</small>
          </div>
        </Container>
      </Navbar>
      <Container fluid>
        <Outlet />
      </Container>
    </>
  )
}

