import type { MouseEvent } from 'react'

import {
  UI_ARIA_CURRENT_PAGE,
  UI_ARIA_LABEL_SIDEBAR_NAV,
  UI_CLASS_INLINE_GAP,
  UI_CLASS_SIDEBAR_NAV,
  UI_CLASS_SIDEBAR_NAV_ACTIVE,
  UI_CLASS_SIDEBAR_NAV_LINK,
  UI_TEST_ID_SIDEBAR_NAV,
} from '../constants'
import type { UiSidebarNavItem, SidebarNavProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function SidebarNav({
  items,
  onSelect,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: SidebarNavProps) {
  const handleSelect = (item: UiSidebarNavItem) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!item.href) {
      event.preventDefault()
    }
    item.onClick?.(event)
    onSelect?.(item)
  }

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <nav
        className={composeClassNames(UI_CLASS_SIDEBAR_NAV, className)}
        data-testid={testId ?? UI_TEST_ID_SIDEBAR_NAV}
        aria-label={UI_ARIA_LABEL_SIDEBAR_NAV}
      >
        {items.map((item) => (
          <VisibilityGate
            key={item.id}
            ability={item.ability}
            permissionKey={item.permissionKey}
            permissionFallback={item.permissionFallback}
          >
            <a
              href={item.href ?? '#'}
              className={composeClassNames(
                UI_CLASS_SIDEBAR_NAV_LINK,
                UI_CLASS_INLINE_GAP,
                item.active ? UI_CLASS_SIDEBAR_NAV_ACTIVE : undefined
              )}
              aria-current={item.active ? UI_ARIA_CURRENT_PAGE : undefined}
              onClick={handleSelect(item)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge}
            </a>
          </VisibilityGate>
        ))}
      </nav>
    </VisibilityGate>
  )
}



