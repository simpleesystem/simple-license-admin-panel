import type { ReactNode } from 'react'
import Button from 'react-bootstrap/Button'

import {
  UI_BUTTON_VARIANT_SECONDARY,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_SIZE_SMALL,
} from '../constants'
import { SectionStatus } from './SectionStatus'

export type RouteStatusProps = {
  isLoading?: boolean
  isError?: boolean
  loadingTitle?: ReactNode
  loadingMessage?: ReactNode
  errorTitle?: ReactNode
  errorMessage?: ReactNode
  retryLabel?: ReactNode
  onRetry?: () => void
}

export function RouteStatus({
  isLoading,
  isError,
  loadingTitle,
  loadingMessage,
  errorTitle,
  errorMessage,
  retryLabel,
  onRetry,
}: RouteStatusProps) {
  if (isLoading) {
    return <SectionStatus status={UI_SECTION_STATUS_LOADING} title={loadingTitle} message={loadingMessage} />
  }

  if (isError) {
    const retryAction =
      onRetry && retryLabel ? (
        <Button variant={UI_BUTTON_VARIANT_SECONDARY} size={UI_SIZE_SMALL} onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : undefined

    return (
      <SectionStatus status={UI_SECTION_STATUS_ERROR} title={errorTitle} message={errorMessage} actions={retryAction} />
    )
  }

  return null
}
