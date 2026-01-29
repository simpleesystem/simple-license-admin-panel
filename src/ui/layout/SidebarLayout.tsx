import {
  UI_CLASS_SIDEBAR_LAYOUT,
  UI_CLASS_SIDEBAR_LAYOUT_CONTENT,
  UI_CLASS_SIDEBAR_LAYOUT_SIDEBAR,
  UI_CLASS_SIDEBAR_STICKY,
  UI_TEST_ID_SIDEBAR_LAYOUT,
} from '../constants'
import type { SidebarLayoutProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function SidebarLayout({
  sidebar,
  stickySidebar,
  sidebarWidthClass,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: SidebarLayoutProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <section
        className={composeClassNames(UI_CLASS_SIDEBAR_LAYOUT, className)}
        data-testid={testId ?? UI_TEST_ID_SIDEBAR_LAYOUT}
      >
        <aside
          className={composeClassNames(
            UI_CLASS_SIDEBAR_LAYOUT_SIDEBAR,
            sidebarWidthClass,
            stickySidebar ? UI_CLASS_SIDEBAR_STICKY : undefined
          )}
        >
          {sidebar}
        </aside>
        <div className={UI_CLASS_SIDEBAR_LAYOUT_CONTENT}>{children}</div>
      </section>
    </VisibilityGate>
  )
}
