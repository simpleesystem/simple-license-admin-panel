import {
  ApiException,
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_INVALID_CREDENTIALS,
  NetworkException,
} from '@/simpleLicense'
import type { ToastNotificationPayload } from '../../notifications/constants'
import { I18N_KEY_APP_ERROR_MESSAGE, I18N_KEY_APP_ERROR_TITLE, NOTIFICATION_VARIANT_ERROR } from '../constants'

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
  // Auth errors should be handled separately (e.g., redirect to login), not shown as notifications
  if (isApiException(error)) {
    const errorCode = error.errorCode || error.code || ''
    if (errorCode === ERROR_CODE_AUTHENTICATION_ERROR || errorCode === ERROR_CODE_INVALID_CREDENTIALS) {
      return null
    }
    // Map ApiException to notification payload
    return {
      titleKey: errorCode || I18N_KEY_APP_ERROR_TITLE,
      descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
      variant: NOTIFICATION_VARIANT_ERROR,
    }
  }
  // Fallback for unknown errors
  return {
    titleKey: I18N_KEY_APP_ERROR_TITLE,
    descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
    variant: NOTIFICATION_VARIANT_ERROR,
  }
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
