import type { ReactNode } from 'react'

import { UI_ALERT_VARIANT_DANGER, UI_ALERT_VARIANT_INFO } from '../constants'
import type { UiAlertVariant } from '../types'
import { InlineAlert } from './InlineAlert'

export type InlineStatusGateProps = {
  isLoading?: boolean
  isError?: boolean
  loadingTitle?: ReactNode
  loadingMessage?: ReactNode
  errorTitle?: ReactNode
  errorMessage?: ReactNode
  loadingVariant?: UiAlertVariant
  errorVariant?: UiAlertVariant
  children: ReactNode
}

export function InlineStatusGate({
  isLoading,
  isError,
  loadingTitle,
  loadingMessage,
  errorTitle,
  errorMessage,
  loadingVariant = UI_ALERT_VARIANT_INFO,
  errorVariant = UI_ALERT_VARIANT_DANGER,
  children,
}: InlineStatusGateProps) {
  if (isLoading) {
    return (
      <InlineAlert variant={loadingVariant} title={loadingTitle}>
        {loadingMessage}
      </InlineAlert>
    )
  }

  if (isError) {
    return (
      <InlineAlert variant={errorVariant} title={errorTitle}>
        {errorMessage}
      </InlineAlert>
    )
  }

  return <>{children}</>
}
