import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { Client } from '@/simpleLicense'
import { API_ENDPOINT_ADMIN_EMAIL_STATUS, API_ENDPOINT_ADMIN_EMAIL_TEST } from '@/simpleLicense/constants'
import { buildEmailResult, buildEmailStatus, EMAIL_TEST_API_BASE } from '../factories/emailFactory'
import { server } from '../msw/server'

const client = () => new Client(EMAIL_TEST_API_BASE, undefined, { retryAttempts: 3, retryDelayMs: 0 })
describe('Authenticated email diagnostics client', () => {
  it('projects redacted readiness from the direct endpoint response', async () => {
    const status = buildEmailStatus()
    server.use(
      http.get(EMAIL_TEST_API_BASE + API_ENDPOINT_ADMIN_EMAIL_STATUS, () =>
        HttpResponse.json({ ...status, token: faker.string.alphanumeric() })
      )
    )
    expect(await client().getEmailDeliveryStatus()).toEqual(status)
  })
  it('sends exactly confirmed fixed operator intent using existing authentication', async () => {
    const token = faker.string.alphanumeric()
    const receipt = buildEmailResult()
    const received = vi.fn()
    server.use(
      http.post(EMAIL_TEST_API_BASE + API_ENDPOINT_ADMIN_EMAIL_TEST, async ({ request }) => {
        received(request.headers.get('Authorization'), await request.json())
        return HttpResponse.json({
          ok: true,
          code: receipt.code,
          reference: receipt.reference,
          request_id: receipt.requestId,
        })
      })
    )
    const api = client()
    api.setToken(token)
    expect(await api.sendEmailDeliveryTest()).toEqual(receipt)
    expect(received).toHaveBeenCalledExactlyOnceWith(`Bearer ${token}`, { confirm: true })
  })
  it('preserves an ambiguous 503 receipt and never retries it', async () => {
    const receipt = buildEmailResult({ ok: false, code: 'unknown_send' })
    const received = vi.fn()
    server.use(
      http.post(EMAIL_TEST_API_BASE + API_ENDPOINT_ADMIN_EMAIL_TEST, () => {
        received()
        return HttpResponse.json(
          {
            ok: false,
            code: receipt.code,
            reference: receipt.reference,
            request_id: receipt.requestId,
            detail: 'private provider transcript',
          },
          { status: 503 }
        )
      })
    )
    expect(await client().sendEmailDeliveryTest()).toEqual(receipt)
    expect(received).toHaveBeenCalledTimes(1)
  })
  it('does not resend after network failure', async () => {
    const received = vi.fn()
    server.use(
      http.post(EMAIL_TEST_API_BASE + API_ENDPOINT_ADMIN_EMAIL_TEST, () => {
        received()
        return HttpResponse.error()
      })
    )
    expect(await client().sendEmailDeliveryTest()).toEqual({ ok: false, code: 'delivery_unknown' })
    expect(received).toHaveBeenCalledTimes(1)
  })
  it.each([401, 403, 429])('reports HTTP %s without replaying the send or changing authentication', async (status) => {
    const received = vi.fn()
    server.use(
      http.post(EMAIL_TEST_API_BASE + API_ENDPOINT_ADMIN_EMAIL_TEST, () => {
        received()
        return HttpResponse.json({}, { status })
      })
    )
    expect(await client().sendEmailDeliveryTest()).toMatchObject({ ok: false })
    expect(received).toHaveBeenCalledTimes(1)
  })
  it.each([
    { ok: true, code: 'accepted' },
    { ok: true, code: 'unexpected-secret' },
    { ok: false, code: 'private provider transcript' },
  ])('refuses malformed or unknown receipts (%#)', async (body) => {
    server.use(http.post(EMAIL_TEST_API_BASE + API_ENDPOINT_ADMIN_EMAIL_TEST, () => HttpResponse.json(body)))
    expect(await client().sendEmailDeliveryTest()).toEqual({ ok: false, code: 'delivery_unknown' })
  })
})
