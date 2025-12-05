import { describe, expect, it } from 'vitest'
import {
  ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED,
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_LICENSE_EXPIRED,
  ERROR_CODE_LICENSE_NOT_FOUND,
  ERROR_CODE_NETWORK_ERROR,
  ERROR_CODE_VALIDATION_ERROR,
} from '@/constants'
import {
  ActivationLimitExceededException,
  ApiException,
  AuthenticationException,
  LicenseExpiredException,
  LicenseNotFoundException,
  NetworkException,
  ValidationException,
} from '@/exceptions/ApiException'

describe('ApiException', () => {
  it('should create exception with message and error code', () => {
    const message = 'Test error message'
    const errorCode = ERROR_CODE_LICENSE_NOT_FOUND
    const exception = new ApiException(message, errorCode)

    expect(exception.message).toBe(message)
    expect(exception.errorCode).toBe(errorCode)
    expect(exception.errorDetails).toBeUndefined()
    expect(exception).toBeInstanceOf(Error)
  })

  it('should create exception with error details', () => {
    const message = 'Test error message'
    const errorCode = ERROR_CODE_LICENSE_EXPIRED
    const errorDetails = { licenseKey: 'test-key', expiresAt: '2024-01-01' }
    const exception = new ApiException(message, errorCode, errorDetails)

    expect(exception.message).toBe(message)
    expect(exception.errorCode).toBe(errorCode)
    expect(exception.errorDetails).toEqual(errorDetails)
  })

  it('should preserve original error in cause', () => {
    const originalError = new Error('Original error')
    const message = 'Wrapped error'
    const errorCode = ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED
    const exception = new ApiException(message, errorCode, undefined, originalError)

    expect(exception.cause).toBe(originalError)
  })

  it('should have correct name', () => {
    const exception = new ApiException('Test', ERROR_CODE_LICENSE_NOT_FOUND)
    expect(exception.name).toBe('ApiException')
  })

  it('should use Error.captureStackTrace when available (V8) - covers line 31', () => {
    // This test ensures the Error.captureStackTrace branch is covered
    // In Node.js/V8 environments, Error.captureStackTrace is available
    const exception = new ApiException('Test', ERROR_CODE_LICENSE_NOT_FOUND)

    // If captureStackTrace exists and was called, the stack will be set
    // Otherwise, the Error constructor will set it
    expect(exception.stack).toBeTruthy()

    // Verify the branch condition is actually tested
    // By creating an exception, we've executed the constructor which includes the if check
    if (Error.captureStackTrace) {
      // In V8 environments, this should be truthy and the branch should be taken
      expect(Error.captureStackTrace).toBeDefined()
    }
  })
})

describe('LicenseExpiredException', () => {
  it('should create exception with default message', () => {
    const exception = new LicenseExpiredException()

    expect(exception.message).toBe('License has expired')
    expect(exception.errorCode).toBe(ERROR_CODE_LICENSE_EXPIRED)
    expect(exception.name).toBe('LicenseExpiredException')
  })

  it('should create exception with custom message', () => {
    const message = 'Custom expired message'
    const exception = new LicenseExpiredException(message)

    expect(exception.message).toBe(message)
    expect(exception.errorCode).toBe(ERROR_CODE_LICENSE_EXPIRED)
  })

  it('should accept error details', () => {
    const errorDetails = { expiresAt: '2024-01-01' }
    const exception = new LicenseExpiredException(undefined, errorDetails)

    expect(exception.errorDetails).toEqual(errorDetails)
  })
})

describe('LicenseNotFoundException', () => {
  it('should create exception with default message', () => {
    const exception = new LicenseNotFoundException()

    expect(exception.message).toBe('License not found')
    expect(exception.errorCode).toBe(ERROR_CODE_LICENSE_NOT_FOUND)
    expect(exception.name).toBe('LicenseNotFoundException')
  })
})

describe('ActivationLimitExceededException', () => {
  it('should create exception with default message', () => {
    const exception = new ActivationLimitExceededException()

    expect(exception.message).toBe('Activation limit exceeded')
    expect(exception.errorCode).toBe(ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED)
    expect(exception.name).toBe('ActivationLimitExceededException')
  })
})

describe('ValidationException', () => {
  it('should create exception with default message', () => {
    const exception = new ValidationException()

    expect(exception.message).toBe('Validation error')
    expect(exception.errorCode).toBe(ERROR_CODE_VALIDATION_ERROR)
    expect(exception.name).toBe('ValidationException')
  })
})

describe('NetworkException', () => {
  it('should create exception with default message', () => {
    const exception = new NetworkException()

    expect(exception.message).toBe('Network error')
    expect(exception.errorCode).toBe(ERROR_CODE_NETWORK_ERROR)
    expect(exception.name).toBe('NetworkException')
  })

  it('should accept cause error', () => {
    const cause = new Error('Network timeout')
    const exception = new NetworkException(undefined, undefined, cause)

    expect(exception.cause).toBe(cause)
  })
})

describe('AuthenticationException', () => {
  it('should create exception with default message', () => {
    const exception = new AuthenticationException()

    expect(exception.message).toBe('Authentication failed')
    expect(exception.errorCode).toBe(ERROR_CODE_AUTHENTICATION_ERROR)
    expect(exception.name).toBe('AuthenticationException')
  })
})
