import Alert from 'react-bootstrap/Alert'

import {
  UI_CLASS_ALERT_ACTIONS,
  UI_CLASS_INLINE_ALERT,
  UI_TEST_ID_INLINE_ALERT,
} from '../constants'
import type { InlineAlertProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function InlineAlert({
  variant = 'info',
  title,
  children,
  actions,
  dismissible,
  onClose,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: InlineAlertProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Alert
        variant={variant}
        className={composeClassNames(UI_CLASS_INLINE_ALERT, className)}
        dismissible={dismissible}
        onClose={onClose}
        data-testid={testId ?? UI_TEST_ID_INLINE_ALERT}
      >
        {title ? <Alert.Heading>{title}</Alert.Heading> : null}
        {children}
        {actions ? <div className={UI_CLASS_ALERT_ACTIONS}>{actions}</div> : null}
      </Alert>
    </VisibilityGate>
  )
}
