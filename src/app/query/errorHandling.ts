import { ApiException, NetworkException } from '@simple-license/react-sdk'
import { mapApiException, mapErrorToNotification } from '../../errors/mappers'
import type { ToastNotificationPayload } from '../../notifications/constants'

const RETRYABLE_ERROR_CODES = new Set(['err_network', 'network_error', 'econnaborted'])
const MAX_NETWORK_RETRIES = 2

const normalizeCode = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }
  return value.trim().toLowerCase()
}

const isAxiosLikeNetworkError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false
  }
  const normalized = normalizeCode((error as { code?: unknown }).code)
  return normalized ? RETRYABLE_ERROR_CODES.has(normalized) : false
}

export const isApiException = (error: unknown): error is ApiException => error instanceof ApiException

export const isNetworkError = (error: unknown): boolean => {
  if (!error) {
    return false
  }
  if (error instanceof NetworkException) {
    return true
  }
  if (isAxiosLikeNetworkError(error)) {
    return true
  }
  if (error instanceof Error) {
    return /network/i.test(error.message)
  }
  return false
}

export const handleQueryError = (error: unknown): ToastNotificationPayload | null => {
  if (isApiException(error)) {
    const code = error.errorCode?.toUpperCase?.()
    const status = error.errorDetails?.status

    // Suppress toast for auth errors; handled inline by auth flows.
    if (
      status === 401 ||
      status === 403 ||
      code === 'AUTHENTICATION_ERROR' ||
      code === 'INVALID_CREDENTIALS' ||
      code === 'INVALID_TOKEN' ||
      code === 'MISSING_TOKEN'
    ) {
      return null
    }

    return mapApiException(error)
  }
  return mapErrorToNotification()
}

export const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  if (isNetworkError(error)) {
    return failureCount < MAX_NETWORK_RETRIES
  }
  if (isApiException(error)) {
    return false
  }
  return failureCount < 1
}
