import type { PropsWithChildren } from 'react'
import { Container } from 'react-bootstrap'
import { ChangePasswordFlow } from '@/ui/auth/ChangePasswordFlow'
import { AppShell } from '@/ui/layout/AppShell'
import { TEST_ID_APP_SHELL } from '../constants'
import { PersistentHeader } from '../layout/PersistentHeader'
import { useAuth } from './useAuth'

export function PasswordResetGate({ children }: PropsWithChildren) {
  const { currentUser } = useAuth()

  // If password reset is required, show the change password flow
  // Wrap it in AppShell to preserve the header (and logout functionality)
  if (currentUser?.passwordResetRequired) {
    return (
      <AppShell testId={TEST_ID_APP_SHELL} topBar={<PersistentHeader />}>
        <Container fluid={true} className="py-4">
          <ChangePasswordFlow />
        </Container>
      </AppShell>
    )
  }

  return <>{children}</>
}
