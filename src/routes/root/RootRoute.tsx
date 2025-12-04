import { Outlet } from '@tanstack/react-router'
import { Container } from 'react-bootstrap'

import { TEST_ID_APP_SHELL } from '../../app/constants'
import { AppShell } from '../../ui/layout/AppShell'
import { PersistentHeader } from '../../app/layout/PersistentHeader'

export function RootRouteComponent() {
  return (
    <AppShell testId={TEST_ID_APP_SHELL} topBar={<PersistentHeader />}>
      <Container fluid className="py-4">
        <Outlet />
      </Container>
    </AppShell>
  )
}

