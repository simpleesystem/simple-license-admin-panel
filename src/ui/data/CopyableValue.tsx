import { CopyButton } from '../actions/CopyButton'
import {
  UI_CLASS_COPYABLE_VALUE,
  UI_CLASS_COPYABLE_VALUE_MONOSPACE,
  UI_CLASS_COPYABLE_VALUE_TEXT,
  UI_COPYABLE_VALUE_MAX_WIDTH_DEFAULT,
  UI_TEST_ID_COPYABLE_VALUE,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import type { CopyableValueProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function CopyableValue({
  value,
  display,
  label,
  monospace = false,
  truncate = false,
  maxWidth = UI_COPYABLE_VALUE_MAX_WIDTH_DEFAULT,
  placeholder = UI_VALUE_PLACEHOLDER,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: CopyableValueProps) {
  const hasValue = typeof value === 'string' && value.length > 0
  const shownValue = display ?? (hasValue ? value : placeholder)

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <span
        className={composeClassNames(UI_CLASS_COPYABLE_VALUE, className)}
        data-testid={testId ?? UI_TEST_ID_COPYABLE_VALUE}
      >
        <span
          className={composeClassNames(
            truncate ? UI_CLASS_COPYABLE_VALUE_TEXT : undefined,
            monospace ? UI_CLASS_COPYABLE_VALUE_MONOSPACE : undefined
          )}
          style={truncate ? { maxWidth } : undefined}
          title={hasValue ? value : undefined}
        >
          {shownValue}
        </span>
        {hasValue ? <CopyButton value={value} label={label} /> : null}
      </span>
    </VisibilityGate>
  )
}
