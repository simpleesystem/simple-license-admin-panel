import {
  UI_ARIA_LABEL_TABLE_TOOLBAR,
  UI_CLASS_INLINE_GAP,
  UI_CLASS_TABLE_TOOLBAR,
  UI_TEST_ID_TABLE_TOOLBAR,
} from '../constants'
import type { TableToolbarProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function TableToolbar({
  start,
  end,
  children,
  ariaLabel = UI_ARIA_LABEL_TABLE_TOOLBAR,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: TableToolbarProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <div
        className={composeClassNames(UI_CLASS_TABLE_TOOLBAR, className)}
        data-testid={testId ?? UI_TEST_ID_TABLE_TOOLBAR}
        role="toolbar"
        aria-label={ariaLabel}
      >
        <div className={UI_CLASS_INLINE_GAP}>{start ?? children}</div>
        <div className={UI_CLASS_INLINE_GAP}>{end}</div>
      </div>
    </VisibilityGate>
  )
}
