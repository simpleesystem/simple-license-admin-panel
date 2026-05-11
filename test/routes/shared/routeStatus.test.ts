import { describe, expect, it, vi } from 'vitest'

import { buildRouteStatusState } from '@/routes/shared/routeStatus'
import {
  UI_ROUTE_STATUS_ACCESS_DENIED_BODY,
  UI_ROUTE_STATUS_ACCESS_DENIED_TITLE,
  UI_USER_STATUS_ERROR_BODY,
  UI_USER_STATUS_ERROR_TITLE,
  UI_USER_STATUS_LOADING_BODY,
  UI_USER_STATUS_LOADING_TITLE,
} from '@/ui/constants'

describe('buildRouteStatusState', () => {
  it('returns loading state while data is pending', () => {
    const onRetry = vi.fn()

    const result = buildRouteStatusState({
      isLoading: true,
      isError: false,
      canView: false,
      loadingTitle: UI_USER_STATUS_LOADING_TITLE,
      loadingMessage: UI_USER_STATUS_LOADING_BODY,
      errorTitle: UI_USER_STATUS_ERROR_TITLE,
      errorMessage: UI_USER_STATUS_ERROR_BODY,
      onRetry,
    })

    expect(result.canRenderContent).toBe(false)
    expect(result.routeStatusProps.isLoading).toBe(true)
    expect(result.routeStatusProps.isError).toBe(false)
    expect(result.routeStatusProps.onRetry).toBe(onRetry)
  })

  it('preserves API error state for retryable failures', () => {
    const onRetry = vi.fn()

    const result = buildRouteStatusState({
      isLoading: false,
      isError: true,
      canView: true,
      loadingTitle: UI_USER_STATUS_LOADING_TITLE,
      loadingMessage: UI_USER_STATUS_LOADING_BODY,
      errorTitle: UI_USER_STATUS_ERROR_TITLE,
      errorMessage: UI_USER_STATUS_ERROR_BODY,
      onRetry,
    })

    expect(result.canRenderContent).toBe(false)
    expect(result.routeStatusProps.isError).toBe(true)
    expect(result.routeStatusProps.errorTitle).toBe(UI_USER_STATUS_ERROR_TITLE)
    expect(result.routeStatusProps.errorMessage).toBe(UI_USER_STATUS_ERROR_BODY)
    expect(result.routeStatusProps.onRetry).toBe(onRetry)
  })

  it('maps unauthorized view access to access denied status', () => {
    const onRetry = vi.fn()

    const result = buildRouteStatusState({
      isLoading: false,
      isError: false,
      canView: false,
      loadingTitle: UI_USER_STATUS_LOADING_TITLE,
      loadingMessage: UI_USER_STATUS_LOADING_BODY,
      errorTitle: UI_USER_STATUS_ERROR_TITLE,
      errorMessage: UI_USER_STATUS_ERROR_BODY,
      onRetry,
    })

    expect(result.canRenderContent).toBe(false)
    expect(result.routeStatusProps.isError).toBe(true)
    expect(result.routeStatusProps.errorTitle).toBe(UI_ROUTE_STATUS_ACCESS_DENIED_TITLE)
    expect(result.routeStatusProps.errorMessage).toBe(UI_ROUTE_STATUS_ACCESS_DENIED_BODY)
    expect(result.routeStatusProps.onRetry).toBeUndefined()
  })

  it('allows content render when loaded without errors and permission is granted', () => {
    const result = buildRouteStatusState({
      isLoading: false,
      isError: false,
      canView: true,
      loadingTitle: UI_USER_STATUS_LOADING_TITLE,
      loadingMessage: UI_USER_STATUS_LOADING_BODY,
      errorTitle: UI_USER_STATUS_ERROR_TITLE,
      errorMessage: UI_USER_STATUS_ERROR_BODY,
    })

    expect(result.canRenderContent).toBe(true)
    expect(result.routeStatusProps.isLoading).toBe(false)
    expect(result.routeStatusProps.isError).toBe(false)
  })
})
