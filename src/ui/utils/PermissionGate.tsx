import type { PropsWithChildren } from 'react'

import { IfCan } from '../../app/abilities/IfCan'
import { IfPermission } from '../../app/abilities/IfPermission'
import type { UiVisibilityProps } from '../types'

type VisibilityGateProps = PropsWithChildren<UiVisibilityProps>

export function VisibilityGate({
  ability,
  permissionKey,
  permissionFallback,
  children,
}: VisibilityGateProps) {
  if (permissionKey) {
    return (
      <IfPermission permission={permissionKey} fallback={permissionFallback}>
        {children}
      </IfPermission>
    )
  }

  if (ability) {
    return (
      <IfCan action={ability.action} subject={ability.subject} fallback={ability.fallback} mode={ability.mode}>
        {children}
      </IfCan>
    )
  }

  return <>{children}</>
}


