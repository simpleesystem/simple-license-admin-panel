import { useLocation } from '@tanstack/react-router'
import { Button, Stack } from 'react-bootstrap'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'

import {
  I18N_KEY_APP_ERROR_MESSAGE,
  I18N_KEY_APP_ERROR_RESET,
  I18N_KEY_APP_ERROR_TITLE,
  TEST_ID_ROUTE_ERROR_FALLBACK,
} from '../app/constants'
import { useLogger } from '../app/logging/loggerContext'
import { raiseErrorFromUnknown } from '../app/state/dispatchers'
import { useAppStore } from '../app/state/store'
import { UI_BUTTON_VARIANT_PRIMARY } from '../ui/constants'

const RouteErrorFallback = ({ resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation()

  return (
    <Stack gap={3} className="p-4 align-items-start" data-testid={TEST_ID_ROUTE_ERROR_FALLBACK}>
      <div>
        <h2 className="h4 mb-1">{t(I18N_KEY_APP_ERROR_TITLE)}</h2>
        <p className="mb-0 text-body-secondary">{t(I18N_KEY_APP_ERROR_MESSAGE)}</p>
      </div>
      <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={resetErrorBoundary}>
        {t(I18N_KEY_APP_ERROR_RESET)}
      </Button>
    </Stack>
  )
}

/**
 * Route-level error boundary rendered inside the app shell.
 *
 * A render crash in one route's panels is contained here, so the header and
 * navigation stay interactive and the user can move to another route. The
 * boundary auto-resets on navigation (resetKeys on pathname).
 */
export function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const logger = useLogger()
  const dispatch = useAppStore((state) => state.dispatch)
  const { pathname } = useLocation()

  return (
    <ErrorBoundary
      FallbackComponent={RouteErrorFallback}
      resetKeys={[pathname]}
      onError={(error, info) => {
        logger.error(error, { componentStack: info.componentStack, stage: 'route:error-boundary', route: pathname })
        raiseErrorFromUnknown({
          error,
          dispatch,
          scope: 'route',
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
