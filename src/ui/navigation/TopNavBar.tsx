import {
  UI_CLASS_INLINE_GAP,
  UI_CLASS_TOP_NAV,
  UI_CLASS_TOP_NAV_CONTENT,
  UI_TEST_ID_TOP_NAV,
} from '../constants'
import type { TopNavBarProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function TopNavBar({
  brand,
  navigation,
  actions,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: TopNavBarProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <header className={composeClassNames(UI_CLASS_TOP_NAV, className)} data-testid={testId ?? UI_TEST_ID_TOP_NAV}>
        <div className={UI_CLASS_TOP_NAV_CONTENT}>
          <div className={UI_CLASS_INLINE_GAP}>
            {brand ? (
              <h1 className="h6 m-0 fw-normal" style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                {brand}
              </h1>
            ) : null}
            {navigation}
          </div>
          <div className={UI_CLASS_INLINE_GAP}>{actions}</div>
        </div>
      </header>
    </VisibilityGate>
  )
}



