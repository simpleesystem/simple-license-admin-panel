import type { MouseEvent } from 'react'

import {
  UI_CLASS_ENTITY_LINK,
  UI_CLASS_ENTITY_LINK_ICON,
  UI_CLASS_ENTITY_LINK_LABEL,
  UI_ENTITY_LINK_ICON,
  UI_TEST_ID_ENTITY_LINK,
} from '../constants'
import type { EntityLinkProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function EntityLink({
  label,
  href,
  onActivate,
  icon = UI_ENTITY_LINK_ICON,
  showIcon = true,
  title,
  truncate = true,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: EntityLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onActivate) {
      return
    }
    // Preserve native open-in-new-tab / new-window behaviour.
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    onActivate()
  }

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <a
        href={href ?? undefined}
        onClick={handleClick}
        className={composeClassNames(UI_CLASS_ENTITY_LINK, className)}
        title={title}
        data-testid={testId ?? UI_TEST_ID_ENTITY_LINK}
      >
        <span className={truncate ? UI_CLASS_ENTITY_LINK_LABEL : undefined}>{label}</span>
        {showIcon ? (
          <span aria-hidden="true" className={UI_CLASS_ENTITY_LINK_ICON}>
            {icon}
          </span>
        ) : null}
      </a>
    </VisibilityGate>
  )
}
