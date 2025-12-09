import { Button, Stack } from 'react-bootstrap'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'

import {
  I18N_KEY_APP_ERROR_MESSAGE,
  I18N_KEY_APP_ERROR_RESET,
  I18N_KEY_APP_ERROR_TITLE,
  TEST_ID_ERROR_FALLBACK,
} from '../app/constants'
import { useLogger } from '../app/logging/loggerContext'
import { raiseErrorFromUnknown } from '../app/state/dispatchers'
import { useAppStore } from '../app/state/store'

const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation()

  return (
    <Stack gap={3} className="p-4 align-items-start" data-testid={TEST_ID_ERROR_FALLBACK}>
      <div>
        <h2 className="h4 mb-1">{t(I18N_KEY_APP_ERROR_TITLE)}</h2>
        <p className="mb-0 text-body-secondary">{t(I18N_KEY_APP_ERROR_MESSAGE)}</p>
      </div>
      <Button variant="primary" onClick={resetErrorBoundary}>
        {t(I18N_KEY_APP_ERROR_RESET)}
      </Button>
    </Stack>
  )
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  const logger = useLogger()
  const dispatch = useAppStore((state) => state.dispatch)

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        logger.error(error, { componentStack: info.componentStack })
        const appError = raiseErrorFromUnknown({
          error,
          dispatch,
          scope: 'global',
        })
        logger.error(error, {
          stage: 'app:error-boundary',
          code: appError.code,
          type: appError.type,
          status: appError.status,
          requestId: appError.requestId,
          scope: appError.scope,
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
