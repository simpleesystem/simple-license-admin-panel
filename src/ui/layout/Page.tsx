import {
  UI_CLASS_PAGE_BASE,
  UI_CLASS_PAGE_CONSTRAINED,
  UI_CLASS_PAGE_FULL_HEIGHT,
  UI_CLASS_PAGE_FULL_WIDTH,
  UI_PAGE_VARIANT_CONSTRAINED,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_TEST_ID_PAGE,
} from '../constants'
import type { PageProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function Page({
  variant = UI_PAGE_VARIANT_CONSTRAINED,
  fullHeight,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: PageProps) {
  const variantClass = variant === UI_PAGE_VARIANT_FULL_WIDTH ? UI_CLASS_PAGE_FULL_WIDTH : UI_CLASS_PAGE_CONSTRAINED
  const heightClass = fullHeight ? UI_CLASS_PAGE_FULL_HEIGHT : undefined

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <section
        className={composeClassNames(UI_CLASS_PAGE_BASE, variantClass, heightClass, className)}
        data-testid={testId ?? UI_TEST_ID_PAGE}
      >
        {children}
      </section>
    </VisibilityGate>
  )
}
