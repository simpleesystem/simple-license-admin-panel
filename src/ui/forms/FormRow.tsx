import {
  UI_CLASS_FORM_ROW,
  UI_CLASS_FORM_ROW_COLUMNS_MAP,
  UI_TEST_ID_FORM_ROW,
  UI_FORM_ROW_COLUMNS_TWO,
} from '../constants'
import type { FormRowProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function FormRow({
  columns = UI_FORM_ROW_COLUMNS_TWO,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: FormRowProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <div
        className={composeClassNames(UI_CLASS_FORM_ROW, UI_CLASS_FORM_ROW_COLUMNS_MAP[columns], className)}
        data-testid={testId ?? UI_TEST_ID_FORM_ROW}
      >
        {children}
      </div>
    </VisibilityGate>
  )
}



