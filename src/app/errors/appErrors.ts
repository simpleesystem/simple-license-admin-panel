import {
  ApiException,
  ClientConfigurationException,
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_BODY_VALIDATION_ERROR,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_INVALID_TOKEN,
  ERROR_CODE_MISSING_TOKEN,
  ERROR_CODE_MUST_CHANGE_PASSWORD,
  ERROR_CODE_NETWORK_ERROR,
  ERROR_CODE_VALIDATION_ERROR,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_TOO_MANY_REQUESTS,
  HTTP_UNAUTHORIZED,
  NetworkException,
} from '@simple-license/react-sdk'

import {
  APP_ERROR_CODE_UNEXPECTED,
  APP_ERROR_MESSAGE_CLIENT_CONFIGURATION,
  APP_ERROR_MESSAGE_NON_ERROR_THROWABLE,
  APP_ERROR_MESSAGE_UNEXPECTED,
  APP_ERROR_TYPE_AUTH,
  APP_ERROR_TYPE_CLIENT,
  APP_ERROR_TYPE_NETWORK,
  APP_ERROR_TYPE_NOT_FOUND,
  APP_ERROR_TYPE_RATE_LIMIT,
  APP_ERROR_TYPE_SERVER,
  APP_ERROR_TYPE_UNEXPECTED,
  APP_ERROR_TYPE_VALIDATION,
} from '../constants'
import type { ErrorScope } from '../state/types'

export type AppErrorType =
  | typeof APP_ERROR_TYPE_NETWORK
  | typeof APP_ERROR_TYPE_AUTH
  | typeof APP_ERROR_TYPE_VALIDATION
  | typeof APP_ERROR_TYPE_RATE_LIMIT
  | typeof APP_ERROR_TYPE_NOT_FOUND
  | typeof APP_ERROR_TYPE_SERVER
  | typeof APP_ERROR_TYPE_CLIENT
  | typeof APP_ERROR_TYPE_UNEXPECTED

export type AppError = {
  type: AppErrorType
  code: string
  message: string
  scope: ErrorScope
  status?: number
  requestId?: string
  correlationId?: string
  cause?: unknown
}

const AUTH_CODES = new Set<string>([
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_MISSING_TOKEN,
  ERROR_CODE_INVALID_TOKEN,
  ERROR_CODE_MUST_CHANGE_PASSWORD,
])

const VALIDATION_CODES = new Set<string>([ERROR_CODE_VALIDATION_ERROR, ERROR_CODE_BODY_VALIDATION_ERROR])

export const mapUnknownToAppError = (error: unknown, scope: ErrorScope): AppError => {
  if (error instanceof NetworkException) {
    return mapNetworkException(error, scope)
  }
  if (error instanceof ClientConfigurationException) {
    return {
      type: APP_ERROR_TYPE_CLIENT,
      code: error.errorCode,
      message: error.message || APP_ERROR_MESSAGE_CLIENT_CONFIGURATION,
      scope,
      cause: error,
    }
  }
  if (error instanceof ApiException) {
    return mapApiException(error, scope)
  }
  if (error instanceof Error) {
    return {
      type: APP_ERROR_TYPE_UNEXPECTED,
      code: APP_ERROR_CODE_UNEXPECTED,
      message: error.message || APP_ERROR_MESSAGE_UNEXPECTED,
      scope,
      cause: error,
    }
  }
  return {
    type: APP_ERROR_TYPE_UNEXPECTED,
    code: APP_ERROR_CODE_UNEXPECTED,
    message: APP_ERROR_MESSAGE_NON_ERROR_THROWABLE,
    scope,
    cause: error,
  }
}

const mapNetworkException = (error: NetworkException, scope: ErrorScope): AppError => {
  const requestId = extractRequestId(error)
  return {
    type: APP_ERROR_TYPE_NETWORK,
    code: error.errorCode ?? ERROR_CODE_NETWORK_ERROR,
    message: error.message,
    status: error.errorDetails?.status ?? 0,
    requestId,
    correlationId: requestId,
    scope,
    cause: error,
  }
}

const mapApiException = (error: ApiException, scope: ErrorScope): AppError => {
  const status = error.errorDetails?.status
  const requestId = extractRequestId(error)
  const code = error.errorCode

  if (status === HTTP_UNAUTHORIZED || status === HTTP_FORBIDDEN || (code && AUTH_CODES.has(code))) {
    return {
      type: APP_ERROR_TYPE_AUTH,
      code,
      message: error.message,
      status,
      requestId,
      correlationId: requestId,
      scope,
      cause: error,
    }
  }

  if (status === HTTP_TOO_MANY_REQUESTS) {
    return {
      type: APP_ERROR_TYPE_RATE_LIMIT,
      code,
      message: error.message,
      status,
      requestId,
      correlationId: requestId,
      scope,
      cause: error,
    }
  }

  if (status === HTTP_NOT_FOUND) {
    return {
      type: APP_ERROR_TYPE_NOT_FOUND,
      code,
      message: error.message,
      status,
      requestId,
      correlationId: requestId,
      scope,
      cause: error,
    }
  }

  if (status !== undefined && status >= 500) {
    return {
      type: APP_ERROR_TYPE_SERVER,
      code,
      message: error.message,
      status,
      requestId,
      correlationId: requestId,
      scope,
      cause: error,
    }
  }

  if ((status !== undefined && status >= 400) || (code && VALIDATION_CODES.has(code))) {
    return {
      type: APP_ERROR_TYPE_VALIDATION,
      code,
      message: error.message,
      status,
      requestId,
      correlationId: requestId,
      scope,
      cause: error,
    }
  }

  return {
    type: APP_ERROR_TYPE_UNEXPECTED,
    code,
    message: error.message,
    status,
    requestId,
    correlationId: requestId,
    scope,
    cause: error,
  }
}

const extractRequestId = (
  error: ApiException | NetworkException | ClientConfigurationException
): string | undefined => {
  const value = error.errorDetails?.requestId
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined
}
