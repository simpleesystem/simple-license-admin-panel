import 'bootstrap/dist/css/bootstrap.min.css'

import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import type { PropsWithChildren, ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import type { Client } from '@/simpleLicense'
import { ApiProvider } from '../api/ApiProvider'
import { AppErrorBoundary } from '../errors/AppErrorBoundary'
import { NotificationBusProvider } from '../notifications/bus'
import { DEFAULT_NOTIFICATION_EVENT } from '../notifications/constants'
import { ToastProvider } from '../notifications/ToastProvider'
import { useNotificationBus } from '../notifications/useNotificationBus'
import { AbilityProvider } from './abilities/AbilityProvider'
import { createTrackingClient } from './analytics/tracking'
import { TrackingContext } from './analytics/trackingContext'
import { AuthProvider } from './auth/AuthProvider'
import { derivePermissionsFromUser } from './auth/permissions'
import { useAuth } from './auth/useAuth'
import { AppConfigProvider, useAppConfig, useFeatureFlag } from './config'
import { I18nProvider } from './i18n/I18nProvider'
import { createAppLogger } from './logging/logger'
import { LoggerContext, useLogger } from './logging/loggerContext'
import { registerQueryErrorNotifier } from './query/errorNotifier'
import { enableQueryCachePersistence } from './query/persistence'
import { createAppQueryClient } from './queryClient'
import { computeFirstAllowedRoute, router } from './router'
import { AppStateProvider } from './state/appState'
import { SurfaceRenderer } from './state/SurfaceRenderer'
import { type AppStore, useAppStore } from './state/store'

type AppProvidersProps = PropsWithChildren<{
  queryClient?: QueryClient
  apiClient?: Client
}>

export function AppProviders({ children, queryClient, apiClient }: AppProvidersProps) {
  return (
    <AppConfigProvider>
      <AppProvidersInner queryClient={queryClient} apiClient={apiClient}>
        {children}
      </AppProvidersInner>
    </AppConfigProvider>
  )
}

function AppProvidersInner({ children, queryClient: externalQueryClient, apiClient }: AppProvidersProps) {
  const appConfig = useAppConfig()
  const logger = useMemo(() => createAppLogger(appConfig), [appConfig])
  const trackingClient = useMemo(() => createTrackingClient(), [])
  const queryClient = useMemo(() => externalQueryClient ?? createAppQueryClient(), [externalQueryClient])
  const enableCachePersistence = useFeatureFlag('enableQueryCachePersistence')

  useEffect(() => {
    if (!enableCachePersistence) {
      return
    }
    const cleanup = enableQueryCachePersistence(queryClient)
    return cleanup ?? undefined
  }, [enableCachePersistence, queryClient])

  return (
    <LoggerContext.Provider value={logger}>
      <TrackingContext.Provider value={trackingClient}>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <ApiProvider client={apiClient}>
              <AppStateProvider>
                <AuthProvider>
                  <AbilityProvider>
                    <NotificationBusProvider>
                      <QueryErrorNotifierBridge />
                      <ToastProvider />
                      <RouterContextBridge queryClient={queryClient}>
                        <SurfaceRenderer />
                        <AppErrorBoundary>{children ?? <RouterProvider router={router} />}</AppErrorBoundary>
                      </RouterContextBridge>
                    </NotificationBusProvider>
                  </AbilityProvider>
                </AuthProvider>
              </AppStateProvider>
            </ApiProvider>
          </QueryClientProvider>
        </I18nProvider>
      </TrackingContext.Provider>
    </LoggerContext.Provider>
  )
}

function RouterContextBridge({ queryClient, children }: { queryClient: QueryClient; children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const navigationIntent = useAppStore((state: AppStore) => state.navigationIntent)
  const dispatch = useAppStore((state: AppStore) => state.dispatch)
  const navigateRef = useRef(router.navigate)
  navigateRef.current = router.navigate
  const logger = useLogger()

  const permissions = useMemo(() => derivePermissionsFromUser(user), [user])

  const authState = useMemo(
    () => ({
      isAuthenticated,
      permissions,
      currentUserRole: user?.role,
      currentUserVendorId: user?.vendorId ?? null,
    }),
    [user?.role, user?.vendorId, isAuthenticated, permissions]
  )

  const firstAllowedRoute = useMemo(() => computeFirstAllowedRoute(authState), [authState])

  useEffect(() => {
    dispatch({ type: 'auth/setUser', payload: user })
  }, [user, dispatch])

  useEffect(() => {
    router.update({
      context: {
        queryClient,
        authState,
        firstAllowedRoute,
      },
    })
    if (import.meta.env.DEV) {
      logger.debug('router:context:update', {
        isAuthenticated: authState.isAuthenticated,
        firstAllowedRoute,
        role: authState.currentUserRole,
      })
    }
  }, [queryClient, authState, firstAllowedRoute, logger])

  // Process navigation intent AFTER router context is updated
  // Use a separate effect that runs after router context update completes
  // This ensures navigation happens with the correct auth state in router context
  // navigateRef used so we don't close over router.navigate; both exhaustive-deps and Biome agree on deps
  useEffect(() => {
    if (navigationIntent) {
      const timeoutId = setTimeout(() => {
        if (import.meta.env.DEV) {
          logger.info('router:navigation-intent', {
            to: navigationIntent.to,
            replace: navigationIntent.replace,
            isAuthenticated: authState.isAuthenticated,
          })
        }
        navigateRef.current({
          to: navigationIntent.to,
          replace: navigationIntent.replace,
        })
        dispatch({ type: 'nav/clearIntent' })
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [navigationIntent, authState, dispatch, logger])

  return <>{children}</>
}

function QueryErrorNotifierBridge() {
  const notificationBus = useNotificationBus()
  const { user } = useAuth()

  useEffect(() => {
    const unregister = registerQueryErrorNotifier((payload) => {
      // Don't show generic query errors if the user is in a password reset flow
      // or if the error is 403 (which often triggers the flow)
      // This prevents "Network Error" or "Forbidden" toasts from stacking up
      // behind the Change Password screen.
      if (user?.passwordResetRequired) {
        return
      }

      // Filter out errors that are likely related to auth/permissions
      // that the UI will handle by redirecting or showing a gate.
      // Note: ToastNotificationPayload doesn't have status property,
      // so we rely on the error handling logic in handleQueryError
      // to filter appropriately.

      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, payload)
    })
    return unregister
  }, [notificationBus, user])

  return null
}
