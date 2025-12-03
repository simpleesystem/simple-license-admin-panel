import Badge from 'react-bootstrap/Badge'

import {
  UI_ARIA_LABEL_REMOVE_CHIP,
  UI_CLASS_CHIP,
  UI_CLASS_CHIP_REMOVE_BUTTON,
  UI_TEST_ID_CHIP,
  UI_TAG_VARIANT_NEUTRAL,
} from '../constants'
import type { ChipProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function Chip({
  label,
  variant = UI_TAG_VARIANT_NEUTRAL,
  icon,
  onRemove,
  removeLabel = UI_ARIA_LABEL_REMOVE_CHIP,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: ChipProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Badge
        bg={variant}
        className={composeClassNames(UI_CLASS_CHIP, className)}
        data-testid={testId ?? UI_TEST_ID_CHIP}
      >
        {icon}
        <span>{label}</span>
        {onRemove ? (
          <button
            type="button"
            className={UI_CLASS_CHIP_REMOVE_BUTTON}
            onClick={onRemove}
            aria-label={removeLabel}
          />
        ) : null}
      </Badge>
    </VisibilityGate>
  )
}



