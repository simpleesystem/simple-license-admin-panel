import 'bootstrap/dist/css/bootstrap.min.css'

import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useMemo as useRenderMemo } from 'react'

import { ApiProvider } from '../api/ApiProvider'
import { AppErrorBoundary } from '../errors/AppErrorBoundary'
import { NotificationBusProvider } from '../notifications/bus'
import { useNotificationBus } from '../notifications/busContext'
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
import { NOTIFICATION_EVENT_TOAST } from './constants'
import { I18nProvider } from './i18n/I18nProvider'
import { createAppLogger } from './logging/logger'
import { LoggerContext } from './logging/loggerContext'
import { registerQueryErrorNotifier } from './query/errorNotifier'
import { createQueryEventBus } from './query/events'
import { enableQueryCachePersistence } from './query/persistence'
import { QueryErrorObserver } from './query/QueryErrorObserver'
import { createAppQueryClient } from './queryClient'
import { router } from './router'
import { AppStateProvider } from './state/appState'

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
  const queryEvents = useMemo(() => createQueryEventBus(), [])
  const queryClient = useMemo(() => createAppQueryClient(logger, queryEvents), [logger, queryEvents])
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
                    <RouterContextBridge queryClient={queryClient} />
                    <NotificationBusProvider>
                      <SessionManager />
                      <QueryErrorNotifierBridge />
                      <QueryErrorObserver queryEvents={queryEvents} />
                      <ToastProvider />
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

  const authState = useMemo(
    () => ({
      isAuthenticated,
      permissions,
      currentUserRole: currentUser?.role,
      currentUserVendorId: currentUser?.vendorId ?? null,
    }),
    [currentUser?.role, currentUser?.vendorId, isAuthenticated, permissions]
  )

  useRenderMemo(() => {
    router.update({
      context: {
        queryClient,
        authState,
      },
    })
  }, [authState, queryClient])

  return null
}

function QueryErrorNotifierBridge() {
  const bus = useNotificationBus()

  useEffect(() => {
    return registerQueryErrorNotifier((payload) => {
      bus.emit(NOTIFICATION_EVENT_TOAST, payload)
    })
  }, [bus])

  return null
}
