import type { PropsWithChildren } from 'react'
import { useAuth } from './useAuth'
import { ChangePasswordFlow } from '@/ui/auth/ChangePasswordFlow'
import { PersistentHeader } from '../layout/PersistentHeader'
import { AppShell } from '@/ui/layout/AppShell'
import { TEST_ID_APP_SHELL } from '../constants'
import { Container } from 'react-bootstrap'

export function PasswordResetGate({ children }: PropsWithChildren) {
  const { currentUser, isAuthenticated } = useAuth()

  // If user is authenticated and password reset is required, show the change password flow
  // Wrap it in AppShell to preserve the header (and logout functionality)
  if (isAuthenticated && currentUser?.passwordResetRequired) {
    return (
      <AppShell testId={TEST_ID_APP_SHELL} topBar={<PersistentHeader />}>
        <Container fluid className="py-4">
          <ChangePasswordFlow />
        </Container>
      </AppShell>
    )
  }

  return <>{children}</>
}
