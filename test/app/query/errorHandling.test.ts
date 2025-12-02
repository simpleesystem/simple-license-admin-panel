import { ApiException, NetworkException } from '@simple-license/react-sdk'
import { describe, expect, it } from 'vitest'

import {
  handleQueryError,
  isNetworkError,
  shouldRetryRequest,
} from '../../../src/app/query/errorHandling'
import { I18N_KEY_APP_ERROR_MESSAGE, I18N_KEY_APP_ERROR_TITLE } from '../../../src/app/constants'

describe('handleQueryError', () => {
  it('maps ApiException instances with mapApiException', () => {
    const exception = new ApiException('failure', 'ERROR_CODE')
    const payload = handleQueryError(exception)
    expect(payload.titleKey).toBe('ERROR_CODE')
    expect(payload.descriptionKey).toBe(I18N_KEY_APP_ERROR_MESSAGE)
  })

  it('falls back to generic notifications for unknown errors', () => {
    const payload = handleQueryError(new Error('boom'))
    expect(payload.titleKey).toBe(I18N_KEY_APP_ERROR_TITLE)
    expect(payload.descriptionKey).toBe(I18N_KEY_APP_ERROR_MESSAGE)
  })
})

describe('isNetworkError', () => {
  it('detects NetworkException instances', () => {
    expect(isNetworkError(new NetworkException('Offline'))).toBe(true)
  })

  it('detects axios-style network errors', () => {
    expect(isNetworkError({ code: 'ERR_NETWORK' })).toBe(true)
  })

  it('detects generic errors with network messaging', () => {
    expect(isNetworkError(new Error('Network request failed'))).toBe(true)
  })

  it('returns false for non-network errors', () => {
    expect(isNetworkError(new Error('Something else happened'))).toBe(false)
  })

  it('returns false for falsy inputs', () => {
    expect(isNetworkError(undefined)).toBe(false)
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


