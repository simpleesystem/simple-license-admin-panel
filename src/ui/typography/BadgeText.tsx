import Badge from 'react-bootstrap/Badge'

import {
  UI_BADGE_VARIANT_SECONDARY,
  UI_CLASS_BADGE_TEXT,
  UI_CLASS_INLINE_GAP,
  UI_TEST_ID_BADGE_TEXT,
} from '../constants'
import type { BadgeTextProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function BadgeText({
  text,
  variant = UI_BADGE_VARIANT_SECONDARY,
  pill,
  icon,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: BadgeTextProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Badge
        bg={variant}
        pill={pill}
        className={composeClassNames(UI_CLASS_BADGE_TEXT, UI_CLASS_INLINE_GAP, className)}
        data-testid={testId ?? UI_TEST_ID_BADGE_TEXT}
      >
        {icon}
        <span>{text}</span>
      </Badge>
    </VisibilityGate>
  )
}
