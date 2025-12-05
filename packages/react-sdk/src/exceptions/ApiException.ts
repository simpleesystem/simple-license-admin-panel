/**
 * Base exception for all API-related errors
 */

import {
  ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED,
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_LICENSE_EXPIRED,
  ERROR_CODE_LICENSE_NOT_FOUND,
  ERROR_CODE_NETWORK_ERROR,
  ERROR_CODE_VALIDATION_ERROR,
} from '../constants'
import type { ErrorDetails } from '../types/api'

type StackTraceCallback = ((...args: never[]) => unknown) | (abstract new (...args: never[]) => unknown)

export class ApiException extends Error {
  public readonly errorCode: string
  public readonly errorDetails: ErrorDetails | undefined

  constructor(
    message: string,
    errorCode: string = ERROR_CODE_AUTHENTICATION_ERROR,
    errorDetails: ErrorDetails | undefined = undefined,
    cause?: Error
  ) {
    super(message, { cause })
    this.name = 'ApiException'
    this.errorCode = errorCode
    this.errorDetails = errorDetails

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    const captureStackTrace = (
      Error as ErrorConstructor & {
        captureStackTrace?: (target: object, constructorOpt?: StackTraceCallback) => void
      }
    ).captureStackTrace
    if (captureStackTrace) {
      captureStackTrace(this, ApiException)
    }
  }
}

// Specific exception types
export class LicenseExpiredException extends ApiException {
  constructor(message?: string, errorDetails?: ErrorDetails) {
    super(message ?? 'License has expired', ERROR_CODE_LICENSE_EXPIRED, errorDetails)
    this.name = 'LicenseExpiredException'
  }
}

export class LicenseNotFoundException extends ApiException {
  constructor(message?: string, errorDetails?: ErrorDetails) {
    super(message ?? 'License not found', ERROR_CODE_LICENSE_NOT_FOUND, errorDetails)
    this.name = 'LicenseNotFoundException'
  }
}

export class ActivationLimitExceededException extends ApiException {
  constructor(message?: string, errorDetails?: ErrorDetails) {
    super(message ?? 'Activation limit exceeded', ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED, errorDetails)
    this.name = 'ActivationLimitExceededException'
  }
}

export class ValidationException extends ApiException {
  constructor(message?: string, errorDetails?: ErrorDetails) {
    super(message ?? 'Validation error', ERROR_CODE_VALIDATION_ERROR, errorDetails)
    this.name = 'ValidationException'
  }
}

export class NetworkException extends ApiException {
  constructor(message?: string, errorDetails?: ErrorDetails, cause?: Error) {
    super(message ?? 'Network error', ERROR_CODE_NETWORK_ERROR, errorDetails, cause)
    this.name = 'NetworkException'
  }
}

export class AuthenticationException extends ApiException {
  constructor(message?: string, errorDetails?: ErrorDetails) {
    super(message ?? 'Authentication failed', ERROR_CODE_AUTHENTICATION_ERROR, errorDetails)
    this.name = 'AuthenticationException'
  }
}
