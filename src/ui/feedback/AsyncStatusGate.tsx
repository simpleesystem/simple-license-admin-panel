import type { ReactNode } from 'react'

import { RouteStatus, type RouteStatusProps } from './RouteStatus'

export type AsyncStatusGateProps = RouteStatusProps & {
  children: ReactNode
}

export function AsyncStatusGate({ children, ...statusProps }: AsyncStatusGateProps) {
  const isBlocked = Boolean(statusProps.isLoading || statusProps.isError)

  return (
    <>
      <RouteStatus {...statusProps} />
      {isBlocked ? null : children}
    </>
  )
}
