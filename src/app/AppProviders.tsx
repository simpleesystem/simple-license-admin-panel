import 'bootstrap/dist/css/bootstrap.min.css'

import { useEffect, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { ApiProvider } from '../api/ApiProvider'
import { AppErrorBoundary } from '../errors/AppErrorBoundary'
import { ToastProvider } from '../notifications/ToastProvider'
import { NotificationBusProvider } from '../notifications/bus'
import { useNotificationBus } from '../notifications/busContext'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/authContext'
import { AuthorizationProvider } from './auth/AuthorizationProvider'
import { usePermissions } from './auth/useAuthorization'
import { SessionManager } from './auth/SessionManager'
import { AppConfigProvider, useAppConfig, useFeatureFlag } from './config'
import { createAppQueryClient } from './queryClient'
import { enableQueryCachePersistence } from './query/persistence'
import { registerQueryErrorNotifier } from './query/errorNotifier'
import { router } from './router'
import { AppStateProvider } from './state/appState'
import { I18nProvider } from './i18n/I18nProvider'
import { NOTIFICATION_EVENT_TOAST } from './constants'
import { createAppLogger } from './logging/logger'
import { LoggerContext } from './logging/loggerContext'
import { createTrackingClient } from './analytics/tracking'
import { TrackingContext } from './analytics/trackingContext'
import { DevToolbar } from './dev/DevToolbar'
import { AbilityProvider } from './abilities/AbilityProvider'

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
  const queryClient = useMemo(() => createAppQueryClient(logger), [logger])
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
                    <AbilityProvider>
                      <RouterContextBridge queryClient={queryClient} />
                      <NotificationBusProvider>
                        <SessionManager />
                        <QueryErrorNotifierBridge />
                        <ToastProvider />
                        <AppErrorBoundary>
                          {children ?? <RouterProvider router={router} />}
                        </AppErrorBoundary>
                        <DevToolbar />
                      </NotificationBusProvider>
                    </AbilityProvider>
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
  const { isAuthenticated } = useAuth()
  const permissions = usePermissions()

  router.update({
    context: {
      queryClient,
      authState: {
        isAuthenticated,
        permissions,
      },
    },
  })

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

