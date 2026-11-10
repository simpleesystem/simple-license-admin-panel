import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import {
  ERROR_CODE_AUTHENTICATION_ERROR,
  ERROR_CODE_INVALID_TOKEN,
  ERROR_CODE_UNAUTHORIZED,
  HTTP_SERVICE_UNAVAILABLE,
  HTTP_TOO_MANY_REQUESTS,
} from '../../src/simpleLicense/constants'
import { ApiException } from '../../src/simpleLicense/exceptions/ApiException'
import { AxiosHttpClient } from '../../src/simpleLicense/http/AxiosHttpClient'
import { server } from '../msw/server'

type RetryProbe = {
  shouldRetry: (error: unknown, isIdempotent: boolean, attempt: number) => boolean
  shouldHandleUnauthorizedWithRefresh: (
    error: { response?: { status?: number; data?: unknown } },
    request: { _retry?: boolean; data?: unknown }
  ) => boolean
}

describe('AxiosHttpClient retry behavior', () => {
  it('does not retry idempotent requests on 429 rate-limit responses', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleesystem.com')
    const probe = client as unknown as RetryProbe
    const rateLimitError = new ApiException('Too many requests', 'RATE_LIMIT_ERROR', {
      status: HTTP_TOO_MANY_REQUESTS,
    })

    const shouldRetry = probe.shouldRetry(rateLimitError, true, 0)

    expect(shouldRetry).toBe(false)
  })

  it('retries idempotent requests on 503 service unavailable responses', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleesystem.com')
    const probe = client as unknown as RetryProbe
    const unavailableError = new ApiException('Service unavailable', 'SERVICE_UNAVAILABLE', {
      status: HTTP_SERVICE_UNAVAILABLE,
    })

    const shouldRetry = probe.shouldRetry(unavailableError, true, 0)

    expect(shouldRetry).toBe(true)
  })

  it('does not auto-refresh/retry unauthorized FormData uploads', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleesystem.com', undefined, {
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
    const client = new AxiosHttpClient('https://license-admin-data.simpleesystem.com', undefined, {
      onRefreshToken: async () => null,
    })
    const probe = client as unknown as RetryProbe

    const shouldHandle = probe.shouldHandleUnauthorizedWithRefresh(
      { response: { status: 401 } },
      { _retry: false, data: { sample: true } }
    )

    expect(shouldHandle).toBe(true)
  })

  it('auto-refreshes 403 responses when error code is INVALID_TOKEN', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleesystem.com', undefined, {
      onRefreshToken: async () => null,
    })
    const probe = client as unknown as RetryProbe

    const shouldHandle = probe.shouldHandleUnauthorizedWithRefresh(
      {
        response: {
          status: 403,
          data: {
            error: {
              code: ERROR_CODE_INVALID_TOKEN,
            },
          },
        },
      },
      { _retry: false, data: { sample: true } }
    )

    expect(shouldHandle).toBe(true)
  })

  it('auto-refreshes 403 responses when error code is UNAUTHORIZED', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleesystem.com', undefined, {
      onRefreshToken: async () => null,
    })
    const probe = client as unknown as RetryProbe

    const shouldHandle = probe.shouldHandleUnauthorizedWithRefresh(
      {
        response: {
          status: 403,
          data: {
            error: {
              code: ERROR_CODE_UNAUTHORIZED,
            },
          },
        },
      },
      { _retry: false, data: { sample: true } }
    )

    expect(shouldHandle).toBe(true)
  })

  it('auto-refreshes 403 responses when error code is AUTHENTICATION_ERROR', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleesystem.com', undefined, {
      onRefreshToken: async () => null,
    })
    const probe = client as unknown as RetryProbe

    const shouldHandle = probe.shouldHandleUnauthorizedWithRefresh(
      {
        response: {
          status: 403,
          data: {
            error: {
              code: ERROR_CODE_AUTHENTICATION_ERROR,
            },
          },
        },
      },
      { _retry: false, data: { sample: true } }
    )

    expect(shouldHandle).toBe(true)
  })

  it('does not auto-refresh 403 responses with non-auth error codes', () => {
    const client = new AxiosHttpClient('https://license-admin-data.simpleesystem.com', undefined, {
      onRefreshToken: async () => null,
    })
    const probe = client as unknown as RetryProbe

    const shouldHandle = probe.shouldHandleUnauthorizedWithRefresh(
      {
        response: {
          status: 403,
          data: {
            error: {
              code: 'NOT_AUTH_RELATED',
            },
          },
        },
      },
      { _retry: false, data: { sample: true } }
    )

    expect(shouldHandle).toBe(false)
  })
})

// These use the actual Axios adapter and intercepted HTTP, not private retry probes.
describe('Publication transport one-attempt boundary', () => {
  const origin = 'https://publication.invalid'
  it.each([401, 403, 503])('never refreshes or replays publication JSON after HTTP %s', async (status) => {
    let posts = 0
    const refresh = vi.fn(async () => 'replacement-token')
    server.use(
      http.post(`${origin}/promote`, async ({ request }) => {
        posts += 1
        expect(await request.json()).toEqual({ operationId: 'original-operation', expected: { revision: 7 } })
        return HttpResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'held' } }, { status })
      })
    )
    const client = new AxiosHttpClient(origin, undefined, {
      retryAttempts: 3,
      retryDelayMs: 0,
      onRefreshToken: refresh,
    })
    await expect(
      client.post(
        '/promote',
        { operationId: 'original-operation', expected: { revision: 7 } },
        { replayPolicy: 'never' }
      )
    ).rejects.toThrow()
    expect(posts).toBe(1)
    expect(refresh).not.toHaveBeenCalled()
  })
  it.each([401, 503])('sends multipart bytes and original nonce once after HTTP %s', async (status) => {
    let posts = 0
    const refresh = vi.fn(async () => 'replacement-token')
    server.use(
      http.post(`${origin}/register`, async ({ request }) => {
        posts += 1
        const form = await request.formData()
        expect(form.get('operation_id')).toBe('retained-operation')
        expect(form.get('scope_fingerprint')).toBe('a'.repeat(64))
        const file = form.get('file')
        expect(file && typeof file !== 'string' ? file.name : null).toBe('retained.zip')
        expect(file && typeof file !== 'string' ? await file.text() : null).toBe('original bytes')
        return HttpResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'held' } }, { status })
      })
    )
    const form = new FormData()
    form.set('operation_id', 'retained-operation')
    form.set('scope_fingerprint', 'a'.repeat(64))
    form.set('file', new File(['original bytes'], 'retained.zip'))
    const client = new AxiosHttpClient(origin, undefined, {
      retryAttempts: 3,
      retryDelayMs: 0,
      onRefreshToken: refresh,
    })
    await expect(client.postFormData('/register', form, { replayPolicy: 'never' })).rejects.toThrow()
    expect(posts).toBe(1)
    expect(refresh).not.toHaveBeenCalled()
  })
  it('preserves the existing single refresh for unrelated JSON requests', async () => {
    let posts = 0
    const refresh = vi.fn(async () => 'replacement-token')
    server.use(
      http.post(`${origin}/unrelated`, ({ request }) => {
        posts += 1
        return request.headers.get('authorization') === 'Bearer replacement-token'
          ? HttpResponse.json({ success: true })
          : HttpResponse.json({ error: { code: 'INVALID_TOKEN' } }, { status: 401 })
      })
    )
    const client = new AxiosHttpClient(origin, undefined, { onRefreshToken: refresh })
    expect((await client.post('/unrelated', { sample: true })).status).toBe(200)
    expect(posts).toBe(2)
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
