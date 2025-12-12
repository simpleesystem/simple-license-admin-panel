import 'bootstrap/dist/css/bootstrap.min.css'

import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'
import { useEffect, useMemo } from 'react'

import { ApiProvider } from '../api/ApiProvider'
import { AppErrorBoundary } from '../errors/AppErrorBoundary'
import { NotificationBusProvider } from '../notifications/bus'
import { useNotificationBus } from '../notifications/busContext'
import { DEFAULT_NOTIFICATION_EVENT } from '../notifications/constants'
import { ToastProvider } from '../notifications/ToastProvider'
import { createTrackingClient } from './analytics/tracking'
import { TrackingContext } from './analytics/trackingContext'
import { AuthorizationProvider } from './auth/AuthorizationProvider'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/authContext'
import { PasswordResetGate } from './auth/PasswordResetGate'
import { SessionManager } from './auth/SessionManager'
import { usePermissions } from './auth/useAuthorization'
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
import { useAppStore } from './state/store'

type AppProvidersProps = PropsWithChildren

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppConfigProvider>
      <AppProvidersInner>{children}</AppProvidersInner>
    </AppConfigProvider>
  )
}

function AppProvidersInner({ children }: AppProvidersProps) {
  const appConfig = useAppConfig()
  const logger = useMemo(() => createAppLogger(appConfig), [appConfig])
  const trackingClient = useMemo(() => createTrackingClient(), [])
  const queryClient = useMemo(() => createAppQueryClient(), [])
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
            <ApiProvider>
              <AppStateProvider>
                <AuthProvider>
                  <AuthorizationProvider>
                    <NotificationBusProvider>
                      <QueryErrorNotifierBridge />
                      <ToastProvider />
                      <RouterContextBridge queryClient={queryClient} />
                      <SessionManager />
                      <SurfaceRenderer />
                      <AppErrorBoundary>
                        <PasswordResetGate>{children ?? <RouterProvider router={router} />}</PasswordResetGate>
                      </AppErrorBoundary>
                    </NotificationBusProvider>
                  </AuthorizationProvider>
                </AuthProvider>
              </AppStateProvider>
            </ApiProvider>
          </QueryClientProvider>
        </I18nProvider>
      </TrackingContext.Provider>
    </LoggerContext.Provider>
  )
}

function RouterContextBridge({ queryClient }: { queryClient: QueryClient }) {
  const { isAuthenticated, currentUser } = useAuth()
  const permissions = usePermissions()
  const navigationIntent = useAppStore((state) => state.navigationIntent)
  const dispatch = useAppStore((state) => state.dispatch)
  const navigate = router.navigate
  const logger = useLogger()

  const authState = useMemo(
    () => ({
      isAuthenticated,
      permissions,
      currentUserRole: currentUser?.role,
      currentUserVendorId: currentUser?.vendorId ?? null,
    }),
    [currentUser?.role, currentUser?.vendorId, isAuthenticated, permissions]
  )

  const firstAllowedRoute = useMemo(() => computeFirstAllowedRoute(authState), [authState])

  useEffect(() => {
    router.update({
      context: {
        queryClient,
        authState,
        firstAllowedRoute,
      },
    })
    logger.debug('router:context:update', {
      isAuthenticated: authState.isAuthenticated,
      firstAllowedRoute,
      role: authState.currentUserRole,
    })
  }, [queryClient, authState, firstAllowedRoute, logger])

  useEffect(() => {
    if (navigationIntent) {
      navigate({
        to: navigationIntent.to,
        replace: navigationIntent.replace,
      })
      dispatch({ type: 'nav/clearIntent' })
      logger.info('router:navigation-intent', { to: navigationIntent.to, replace: navigationIntent.replace })
    }
  }, [navigationIntent, navigate, dispatch, logger])

  return null
}

function QueryErrorNotifierBridge() {
  const notificationBus = useNotificationBus()

  useEffect(() => {
    const unregister = registerQueryErrorNotifier((payload) => {
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, payload)
    })
    return unregister
  }, [notificationBus])

  return null
}
