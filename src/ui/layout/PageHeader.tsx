import {
  UI_CLASS_HEADING_EYEBROW,
  UI_CLASS_HEADING_TITLE,
  UI_CLASS_MARGIN_RESET,
  UI_CLASS_MUTED_TEXT,
  UI_CLASS_PAGE_HEADER,
  UI_CLASS_PAGE_HEADER_ACTIONS,
  UI_CLASS_PAGE_HEADER_CONTENT,
  UI_TEST_ID_PAGE_HEADER,
} from '../constants'
import type { PageHeaderProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  breadcrumbs,
  actions,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: PageHeaderProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <header
        className={composeClassNames(UI_CLASS_PAGE_HEADER, className)}
        data-testid={testId ?? UI_TEST_ID_PAGE_HEADER}
      >
        <div className={UI_CLASS_PAGE_HEADER_CONTENT}>
          {breadcrumbs}
          {eyebrow ? <span className={UI_CLASS_HEADING_EYEBROW}>{eyebrow}</span> : null}
          <div className="d-flex flex-column gap-1">
            <h2 className={composeClassNames(UI_CLASS_HEADING_TITLE, UI_CLASS_MARGIN_RESET)}>{title}</h2>
            {subtitle ? (
              <p className={composeClassNames(UI_CLASS_MUTED_TEXT, UI_CLASS_MARGIN_RESET)}>{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className={UI_CLASS_PAGE_HEADER_ACTIONS}>{actions}</div> : null}
      </header>
    </VisibilityGate>
  )
}
