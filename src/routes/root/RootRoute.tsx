import { Outlet } from '@tanstack/react-router'
import { Container } from 'react-bootstrap'
import { PasswordResetGate } from '../../app/auth/PasswordResetGate'
import { TEST_ID_APP_SHELL } from '../../app/constants'
import { PersistentHeader } from '../../app/layout/PersistentHeader'
import { AppShell } from '../../ui/layout/AppShell'

export function RootRouteComponent() {
  return (
    <PasswordResetGate>
      <AppShell testId={TEST_ID_APP_SHELL} topBar={<PersistentHeader />}>
        <Container fluid={true} className="py-4 d-flex flex-column flex-grow-1">
          <Outlet />
        </Container>
      </AppShell>
    </PasswordResetGate>
  )
}
