import type { JSX } from 'react'

import {
  UI_CLASS_BODY_TEXT,
  UI_CLASS_BODY_TEXT_LEAD,
  UI_TEST_ID_BODY_TEXT,
} from '../constants'
import type { BodyTextProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function BodyText({
  lead,
  as,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: BodyTextProps) {
  const Element = (as ?? 'p') as keyof JSX.IntrinsicElements

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Element
        className={composeClassNames(UI_CLASS_BODY_TEXT, lead ? UI_CLASS_BODY_TEXT_LEAD : undefined, className)}
        data-testid={testId ?? UI_TEST_ID_BODY_TEXT}
      >
        {children}
      </Element>
    </VisibilityGate>
  )
}
