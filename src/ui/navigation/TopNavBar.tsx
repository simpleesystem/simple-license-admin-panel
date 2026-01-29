import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { UI_CLASS_TOP_NAV, UI_TEST_ID_TOP_NAV } from '../constants'
import type { TopNavBarProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function TopNavBar({
  brand,
  navigation,
  actions,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: TopNavBarProps) {
  const hasContent = Boolean(navigation || actions)

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Navbar
        expand="lg"
        collapseOnSelect={true}
        className={composeClassNames(UI_CLASS_TOP_NAV, className)}
        data-testid={testId ?? UI_TEST_ID_TOP_NAV}
      >
        <Container fluid={true}>
          {brand ? <Navbar.Brand>{brand}</Navbar.Brand> : null}
          {hasContent ? <Navbar.Toggle aria-controls="top-navbar-nav" /> : null}
          {hasContent ? (
            <Navbar.Collapse id="top-navbar-nav">
              {navigation ? (
                <Nav className="me-auto d-flex align-items-center gap-2">{navigation}</Nav>
              ) : (
                <Nav className="me-auto d-flex align-items-center gap-2" />
              )}
              {actions ? <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">{actions}</div> : null}
            </Navbar.Collapse>
          ) : null}
        </Container>
      </Navbar>
    </VisibilityGate>
  )
}
