import type { PropsWithChildren } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { ChangePasswordFlow } from '../../ui/auth/ChangePasswordFlow'
import { useAuth } from './authContext'

type PasswordResetGateProps = PropsWithChildren

export function PasswordResetGate({ children }: PasswordResetGateProps) {
  const { currentUser, refreshCurrentUser } = useAuth()

  if (currentUser?.passwordResetRequired) {
    return (
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
    )
  }

  return <>{children}</>
}


