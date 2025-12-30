import {
  UI_CLASS_FORM_ACTIONS,
  UI_TEST_ID_FORM_ACTIONS,
} from '../constants'
import type { FormActionsProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

const ALIGN_CLASS_MAP: Record<NonNullable<FormActionsProps['align']>, string> = {
  start: 'justify-content-start',
  center: 'justify-content-center',
  end: 'justify-content-end',
  between: 'justify-content-between',
}

export function FormActions({
  align = 'end',
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: FormActionsProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <div
        className={composeClassNames(UI_CLASS_FORM_ACTIONS, ALIGN_CLASS_MAP[align], className)}
        data-testid={testId ?? UI_TEST_ID_FORM_ACTIONS}
      >
        {children}
      </div>
    </VisibilityGate>
  )
}
