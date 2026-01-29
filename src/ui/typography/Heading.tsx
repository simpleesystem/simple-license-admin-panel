import type { JSX } from 'react'

import {
  UI_CLASS_HEADING,
  UI_CLASS_HEADING_BADGE,
  UI_CLASS_HEADING_EYEBROW,
  UI_CLASS_HEADING_TITLE,
  UI_CLASS_INLINE_GAP,
  UI_CLASS_MARGIN_RESET,
  UI_CLASS_TEXT_ALIGN_MAP,
  UI_TEST_ID_HEADING,
} from '../constants'
import type { HeadingProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function Heading({
  level = 1,
  align,
  eyebrow,
  badge,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: HeadingProps) {
  const clampedLevel = Math.min(Math.max(level, 1), 6)
  const HeadingTag = `h${clampedLevel}` as keyof JSX.IntrinsicElements

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <div
        className={composeClassNames(UI_CLASS_HEADING, align ? UI_CLASS_TEXT_ALIGN_MAP[align] : undefined, className)}
        data-testid={testId ?? UI_TEST_ID_HEADING}
      >
        {eyebrow ? <span className={UI_CLASS_HEADING_EYEBROW}>{eyebrow}</span> : null}
        <div className={UI_CLASS_INLINE_GAP}>
          <HeadingTag className={composeClassNames(UI_CLASS_HEADING_TITLE, UI_CLASS_MARGIN_RESET)}>
            {children}
          </HeadingTag>
          {badge ? <span className={UI_CLASS_HEADING_BADGE}>{badge}</span> : null}
        </div>
      </div>
    </VisibilityGate>
  )
}
