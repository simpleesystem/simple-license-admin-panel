import { describe, expect, it } from 'vitest'
import { ApiException, NetworkException } from '@/simpleLicense'
import { I18N_KEY_APP_ERROR_MESSAGE, I18N_KEY_APP_ERROR_TITLE } from '../../../src/app/constants'
import { handleQueryError, isNetworkError, shouldRetryRequest } from '../../../src/app/query/errorHandling'

describe('handleQueryError', () => {
  it('returns null for auth 401 errors (AUTHENTICATION_ERROR)', () => {
    const error = new ApiException('Invalid credentials', 'AUTHENTICATION_ERROR', { status: 401 })
    const result = handleQueryError(error)
    expect(result).toBeNull()
  })

  it('returns null for auth errors with INVALID_CREDENTIALS code', () => {
    const error = new ApiException('Invalid credentials', 'INVALID_CREDENTIALS', { status: 401 })
    const result = handleQueryError(error)
    expect(result).toBeNull()
  })

  it('maps ApiException instances with error code', () => {
    const exception = new ApiException('failure', 'ERROR_CODE')
    const payload = handleQueryError(exception)
    expect(payload).not.toBeNull()
    expect(payload?.titleKey).toBe('ERROR_CODE')
    expect(payload?.descriptionKey).toBe(I18N_KEY_APP_ERROR_MESSAGE)
  })

  it('handles ApiException with empty error code', () => {
    const exception = new ApiException('failure', '', { status: 500 })
    const payload = handleQueryError(exception)
    expect(payload).not.toBeNull()
    expect(payload?.titleKey).toBe(I18N_KEY_APP_ERROR_TITLE)
  })

  it('handles ApiException with empty error code', () => {
    const exception = new ApiException('failure', '', { status: 500 })
    const payload = handleQueryError(exception)
    expect(payload).not.toBeNull()
    expect(payload?.titleKey).toBe(I18N_KEY_APP_ERROR_TITLE)
  })

  it('returns payload for non-auth errors', () => {
    const error = new ApiException('Other error', 'SOME_ERROR', { status: 500 })
    const result = handleQueryError(error)
    expect(result).not.toBeNull()
  })

  it('falls back to generic notifications for unknown errors', () => {
    const payload = handleQueryError(new Error('boom'))
    expect(payload).not.toBeNull()
    expect(payload?.titleKey).toBe(I18N_KEY_APP_ERROR_TITLE)
    expect(payload?.descriptionKey).toBe(I18N_KEY_APP_ERROR_MESSAGE)
  })

  it('handles null errors', () => {
    const payload = handleQueryError(null)
    expect(payload).not.toBeNull()
    expect(payload?.titleKey).toBe(I18N_KEY_APP_ERROR_TITLE)
  })

  it('handles undefined errors', () => {
    const payload = handleQueryError(undefined)
    expect(payload).not.toBeNull()
    expect(payload?.titleKey).toBe(I18N_KEY_APP_ERROR_TITLE)
  })
})

describe('isNetworkError', () => {
  it('detects NetworkException instances', () => {
    expect(isNetworkError(new NetworkException('Offline'))).toBe(true)
  })

  it('detects axios-style network errors with ERR_NETWORK', () => {
    expect(isNetworkError({ code: 'ERR_NETWORK' })).toBe(true)
  })

  it('detects axios-style network errors with network_error', () => {
    expect(isNetworkError({ code: 'network_error' })).toBe(true)
  })

  it('detects axios-style network errors with econnaborted', () => {
    expect(isNetworkError({ code: 'ECONNABORTED' })).toBe(true)
  })

  it('handles code with whitespace', () => {
    expect(isNetworkError({ code: '  ERR_NETWORK  ' })).toBe(true)
  })

  it('handles case-insensitive code matching', () => {
    expect(isNetworkError({ code: 'err_network' })).toBe(true)
  })

  it('returns false for non-retryable codes', () => {
    expect(isNetworkError({ code: 'OTHER_ERROR' })).toBe(false)
  })

  it('handles non-string code values', () => {
    expect(isNetworkError({ code: 123 })).toBe(false)
    expect(isNetworkError({ code: null })).toBe(false)
    expect(isNetworkError({ code: undefined })).toBe(false)
  })

  it('handles objects without code property', () => {
    expect(isNetworkError({ message: 'test' })).toBe(false)
  })

  it('detects generic errors with network messaging', () => {
    expect(isNetworkError(new Error('Network request failed'))).toBe(true)
    expect(isNetworkError(new Error('network error occurred'))).toBe(true)
  })

  it('returns false for non-network errors', () => {
    expect(isNetworkError(new Error('Something else happened'))).toBe(false)
  })

  it('returns false for falsy inputs', () => {
    expect(isNetworkError(undefined)).toBe(false)
    expect(isNetworkError(null)).toBe(false)
    expect(isNetworkError(false)).toBe(false)
    expect(isNetworkError(0)).toBe(false)
  })

  it('returns false for non-object errors', () => {
    expect(isNetworkError('string error')).toBe(false)
    expect(isNetworkError(123)).toBe(false)
  })
})

describe('shouldRetryRequest', () => {
  it('retries network errors up to the maximum', () => {
    const networkError = new NetworkException('timeout')
    expect(shouldRetryRequest(0, networkError)).toBe(true)
    expect(shouldRetryRequest(1, networkError)).toBe(true)
    expect(shouldRetryRequest(2, networkError)).toBe(false)
  })

  it('does not retry ApiException instances', () => {
    const apiError = new ApiException('bad request', 'VALIDATION_ERROR')
    expect(shouldRetryRequest(0, apiError)).toBe(false)
  })

  it('retries unknown errors at least once', () => {
    expect(shouldRetryRequest(0, new Error('flaky'))).toBe(true)
    expect(shouldRetryRequest(1, new Error('flaky again'))).toBe(false)
  })
})
