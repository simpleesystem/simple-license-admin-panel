import type { JSX } from 'react'

import {
  UI_CLASS_STACK_ALIGN_MAP,
  UI_CLASS_STACK_BASE,
  UI_CLASS_STACK_DIRECTION_MAP,
  UI_CLASS_STACK_GAP_MAP,
  UI_CLASS_STACK_JUSTIFY_MAP,
  UI_CLASS_STACK_WRAP,
  UI_STACK_DIRECTION_COLUMN,
  UI_STACK_GAP_MEDIUM,
  UI_TEST_ID_STACK,
} from '../constants'
import type { StackProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function Stack({
  gap = UI_STACK_GAP_MEDIUM,
  direction = UI_STACK_DIRECTION_COLUMN,
  align,
  justify,
  wrap,
  as,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: StackProps) {
  const Element = (as ?? 'div') as keyof JSX.IntrinsicElements

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Element
        className={composeClassNames(
          UI_CLASS_STACK_BASE,
          UI_CLASS_STACK_DIRECTION_MAP[direction],
          UI_CLASS_STACK_GAP_MAP[gap],
          align ? UI_CLASS_STACK_ALIGN_MAP[align] : undefined,
          justify ? UI_CLASS_STACK_JUSTIFY_MAP[justify] : undefined,
          wrap ? UI_CLASS_STACK_WRAP : undefined,
          className
        )}
        data-testid={testId ?? UI_TEST_ID_STACK}
      >
        {children}
      </Element>
    </VisibilityGate>
  )
}



