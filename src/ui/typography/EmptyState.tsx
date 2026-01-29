import {
  UI_CLASS_EMPTY_STATE,
  UI_CLASS_EMPTY_STATE_ACTIONS,
  UI_CLASS_EMPTY_STATE_ICON,
  UI_CLASS_MARGIN_RESET,
  UI_CLASS_TEXT_MUTED,
  UI_TEST_ID_EMPTY_STATE,
} from '../constants'
import type { EmptyStateProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function EmptyState({
  icon,
  title,
  body,
  actions,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: EmptyStateProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <div
        className={composeClassNames(UI_CLASS_EMPTY_STATE, className)}
        data-testid={testId ?? UI_TEST_ID_EMPTY_STATE}
      >
        {icon ? <div className={UI_CLASS_EMPTY_STATE_ICON}>{icon}</div> : null}
        <h3 className={UI_CLASS_MARGIN_RESET}>{title}</h3>
        {body ? <p className={UI_CLASS_TEXT_MUTED}>{body}</p> : null}
        {actions ? <div className={UI_CLASS_EMPTY_STATE_ACTIONS}>{actions}</div> : null}
      </div>
    </VisibilityGate>
  )
}
