import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'
import { Button, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import {
  I18N_KEY_APP_ERROR_MESSAGE,
  I18N_KEY_APP_ERROR_RESET,
  I18N_KEY_APP_ERROR_TITLE,
  TEST_ID_ERROR_FALLBACK,
} from '../app/constants'
import { useLogger } from '../app/logging/loggerContext'

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

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        logger.error(error, { componentStack: info.componentStack })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

