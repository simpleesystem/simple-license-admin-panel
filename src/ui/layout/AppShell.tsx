import {
  UI_CLASS_APP_SHELL,
  UI_CLASS_APP_SHELL_BODY,
  UI_CLASS_APP_SHELL_CONTENT,
  UI_CLASS_APP_SHELL_FOOTER,
  UI_CLASS_APP_SHELL_HEADER,
  UI_CLASS_APP_SHELL_SIDEBAR,
  UI_TEST_ID_APP_SHELL,
} from '../constants'
import type { AppShellProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function AppShell({
  sidebar,
  topBar,
  bottomBar,
  sidebarWidthClass,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: AppShellProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <div className={composeClassNames(UI_CLASS_APP_SHELL, className)} data-testid={testId ?? UI_TEST_ID_APP_SHELL}>
        {topBar ? <header className={UI_CLASS_APP_SHELL_HEADER}>{topBar}</header> : null}
        <div className={UI_CLASS_APP_SHELL_BODY}>
          {sidebar ? (
            <aside className={composeClassNames(UI_CLASS_APP_SHELL_SIDEBAR, sidebarWidthClass)}>{sidebar}</aside>
          ) : null}
          <main className={UI_CLASS_APP_SHELL_CONTENT}>{children}</main>
        </div>
        {bottomBar ? <footer className={UI_CLASS_APP_SHELL_FOOTER}>{bottomBar}</footer> : null}
      </div>
    </VisibilityGate>
  )
}
