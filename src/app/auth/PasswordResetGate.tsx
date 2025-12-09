import type { PropsWithChildren } from 'react'
import { Button } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { ChangePasswordFlow } from '../../ui/auth/ChangePasswordFlow'
import { UI_HEADER_ACTION_SIGN_OUT, UI_TEST_ID_HEADER } from '../../ui/constants'
import { AppShell } from '../../ui/layout/AppShell'
import { TopNavBar } from '../../ui/navigation/TopNavBar'
import { APP_BRAND_NAME, APP_BRAND_TAGLINE } from '../constants'
import { useAuth } from './authContext'

type PasswordResetGateProps = PropsWithChildren

export function PasswordResetGate({ children }: PasswordResetGateProps) {
  const { currentUser, refreshCurrentUser } = useAuth()

  if (currentUser?.passwordResetRequired) {
    return (
      <AppShell
        topBar={
          <TopNavBar
            testId={UI_TEST_ID_HEADER}
            brand={
              <div className="d-flex flex-column">
                <strong>{APP_BRAND_NAME}</strong>
                <small className="text-muted">{APP_BRAND_TAGLINE}</small>
              </div>
            }
            navigation={null}
            actions={<PasswordResetHeaderActions />}
          />
        }
      >
        <div className="min-vh-100 bg-body-tertiary d-flex align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col md={6} lg={5}>
                <ChangePasswordFlow
                  onSuccess={async () => {
                    await refreshCurrentUser()
                  }}
                />
              </Col>
            </Row>
          </Container>
        </div>
      </AppShell>
    )
  }

  return <>{children}</>
}

const PasswordResetHeaderActions = () => {
  const { logout } = useAuth()
  return (
    <div className="d-flex gap-2">
      <Button variant="secondary" size="sm" onClick={logout}>
        {UI_HEADER_ACTION_SIGN_OUT}
      </Button>
    </div>
  )
}
