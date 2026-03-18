import { describe, expect, it } from 'vitest'

import { HTTP_SERVICE_UNAVAILABLE, HTTP_TOO_MANY_REQUESTS } from '../../src/simpleLicense/constants'
import { ApiException } from '../../src/simpleLicense/exceptions/ApiException'
import { AxiosHttpClient } from '../../src/simpleLicense/http/AxiosHttpClient'

type RetryProbe = {
  shouldRetry: (error: unknown, isIdempotent: boolean, attempt: number) => boolean
  shouldHandleUnauthorizedWithRefresh: (
    error: { response?: { status?: number } },
    request: { _retry?: boolean; data?: unknown }
  ) => boolean
}

describe('AxiosHttpClient retry behavior', () => {
  it('does not retry idempotent requests on 429 rate-limit responses', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleaisystem.com')
    const probe = client as unknown as RetryProbe
    const rateLimitError = new ApiException('Too many requests', 'RATE_LIMIT_ERROR', {
      status: HTTP_TOO_MANY_REQUESTS,
    })

    const shouldRetry = probe.shouldRetry(rateLimitError, true, 0)

    expect(shouldRetry).toBe(false)
  })

  it('retries idempotent requests on 503 service unavailable responses', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleaisystem.com')
    const probe = client as unknown as RetryProbe
    const unavailableError = new ApiException('Service unavailable', 'SERVICE_UNAVAILABLE', {
      status: HTTP_SERVICE_UNAVAILABLE,
    })

    const shouldRetry = probe.shouldRetry(unavailableError, true, 0)

    expect(shouldRetry).toBe(true)
  })

  it('does not auto-refresh/retry unauthorized FormData uploads', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleaisystem.com', undefined, {
      onRefreshToken: async () => null,
    })
    const probe = client as unknown as RetryProbe
    const formData = new FormData()
    formData.append('file', new Blob(['test']), 'test.zip')

    const shouldHandle = probe.shouldHandleUnauthorizedWithRefresh(
      { response: { status: 401 } },
      { _retry: false, data: formData }
    )

    expect(shouldHandle).toBe(false)
  })

  it('still auto-refreshes unauthorized JSON requests', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleaisystem.com', undefined, {
      onRefreshToken: async () => null,
    })
    const probe = client as unknown as RetryProbe

    const shouldHandle = probe.shouldHandleUnauthorizedWithRefresh(
      { response: { status: 401 } },
      { _retry: false, data: { sample: true } }
    )

    expect(shouldHandle).toBe(true)
  })
})
