import type { PropsWithChildren, ReactNode } from 'react'

import type { PermissionKey } from '../auth/permissions'
import { useCan } from '../auth/useAuthorization'

type FallbackRenderer = ReactNode | (() => ReactNode)

type IfPermissionProps = PropsWithChildren<{
  permission: PermissionKey
  fallback?: FallbackRenderer
}>

const renderFallback = (fallback: FallbackRenderer | undefined): ReactNode => {
  if (!fallback) {
    return null
  }
  if (typeof fallback === 'function') {
    return fallback()
  }
  return fallback
}

export function IfPermission({ permission, children, fallback }: IfPermissionProps) {
  const allowed = useCan(permission)

  if (allowed) {
    return <>{children}</>
  }

  return <>{renderFallback(fallback)}</>
}


