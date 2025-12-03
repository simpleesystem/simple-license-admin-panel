import {
  UI_ARIA_CURRENT_PAGE,
  UI_ARIA_LABEL_BREADCRUMBS,
  UI_CLASS_BREADCRUMBS,
  UI_TEST_ID_BREADCRUMBS,
} from '../constants'
import type { BreadcrumbsProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function Breadcrumbs({
  items,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: BreadcrumbsProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <nav aria-label={UI_ARIA_LABEL_BREADCRUMBS}>
        <ol className={composeClassNames(UI_CLASS_BREADCRUMBS, className)} data-testid={testId ?? UI_TEST_ID_BREADCRUMBS}>
          {items.map((item) => (
            <li key={item.id} className={composeClassNames('breadcrumb-item', item.active ? 'active' : undefined)}>
              {item.active || !item.href ? (
                <span>{item.label}</span>
              ) : (
                <a
                  href={item.href}
                  onClick={(event) => {
                    if (item.onClick) {
                      event.preventDefault()
                      item.onClick()
                    }
                  }}
                  aria-current={item.active ? UI_ARIA_CURRENT_PAGE : undefined}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </VisibilityGate>
  )
}



