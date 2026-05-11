import type { ReactNode } from 'react'

import { UI_ROUTE_STATUS_ACCESS_DENIED_BODY, UI_ROUTE_STATUS_ACCESS_DENIED_TITLE } from '../../ui/constants'
import type { RouteStatusProps } from '../../ui/feedback/RouteStatus'

type BuildRouteStatusParams = {
  isLoading: boolean
  isError: boolean
  canView: boolean
  loadingTitle?: ReactNode
  loadingMessage?: ReactNode
  errorTitle?: ReactNode
  errorMessage?: ReactNode
  retryLabel?: ReactNode
  onRetry?: () => void
}

type BuildRouteStatusResult = {
  canRenderContent: boolean
  routeStatusProps: RouteStatusProps
}

export function buildRouteStatusState({
  isLoading,
  isError,
  canView,
  loadingTitle,
  loadingMessage,
  errorTitle,
  errorMessage,
  retryLabel,
  onRetry,
}: BuildRouteStatusParams): BuildRouteStatusResult {
  const showAccessDenied = !isLoading && !isError && !canView

  return {
    canRenderContent: !isLoading && !isError && canView,
    routeStatusProps: {
      isLoading,
      isError: isError || showAccessDenied,
      loadingTitle,
      loadingMessage,
      errorTitle: showAccessDenied ? UI_ROUTE_STATUS_ACCESS_DENIED_TITLE : errorTitle,
      errorMessage: showAccessDenied ? UI_ROUTE_STATUS_ACCESS_DENIED_BODY : errorMessage,
      retryLabel,
      onRetry: showAccessDenied ? undefined : onRetry,
    },
  }
}
