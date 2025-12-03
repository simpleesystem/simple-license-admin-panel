import type { PropsWithChildren } from 'react'

import { UI_CLASS_MUTED_TEXT, UI_TEST_ID_MUTED_TEXT } from '../constants'
import type { UiCommonProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

type MutedTextProps = PropsWithChildren<UiCommonProps>

export function MutedText({
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: MutedTextProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <span
        className={composeClassNames(UI_CLASS_MUTED_TEXT, className)}
        data-testid={testId ?? UI_TEST_ID_MUTED_TEXT}
      >
        {children}
      </span>
    </VisibilityGate>
  )
}



