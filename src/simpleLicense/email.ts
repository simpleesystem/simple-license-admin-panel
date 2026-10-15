import { HTTP_FORBIDDEN, HTTP_OK, HTTP_TOO_MANY_REQUESTS, HTTP_UNAUTHORIZED } from './constants'
import { ApiException } from './exceptions/ApiException'

export const EMAIL_OUTCOME_UNKNOWN = 'delivery_unknown'
export const EMAIL_OUTCOME_ACCEPTED = 'accepted'
export const EMAIL_STATUS_UNAVAILABLE = 'email_status_unavailable'
export const EMAIL_AMBIGUOUS_CODES = new Set([EMAIL_OUTCOME_UNKNOWN, 'unknown_send'])
const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
const EMAIL_FAILURE_CODES = new Set([
  'email_not_configured',
  'development_only',
  'email_operator_required',
  'confirm_required',
  'unauthorized',
  'sender_not_verified',
  'site_disabled',
  'daily_limit_exceeded',
  'rate_limited',
  'recipient_not_allowed',
  'recipient_suppressed',
  'validation_error',
  'message_too_large',
  'request_conflict',
  'idempotency_conflict',
  'ledger_full',
  ...EMAIL_AMBIGUOUS_CODES,
])

export interface EmailDeliveryStatus {
  configured: boolean
  transport: string
  code: string
}
export interface EmailTestResult {
  ok: boolean
  code: string
  reference?: string
  requestId?: string
}
const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
const reference = (value: unknown): string | undefined =>
  typeof value === 'string' && UUID_PATTERN.test(value) ? value : undefined

/** Project only readiness fields; unexpected server properties never enter the UI cache. */
export function parseEmailDeliveryStatus(value: unknown): EmailDeliveryStatus {
  const data = record(value)
  if (
    typeof data.configured !== 'boolean' ||
    typeof data.transport !== 'string' ||
    !['auto', 'smtp', 'fleet', 'log', 'invalid'].includes(data.transport) ||
    typeof data.code !== 'string' ||
    !['ready', 'email_not_configured', 'development_only'].includes(data.code) ||
    data.configured !== (data.code === 'ready')
  ) {
    throw new ApiException(EMAIL_STATUS_UNAVAILABLE, EMAIL_STATUS_UNAVAILABLE)
  }
  return { configured: data.configured, transport: data.transport, code: data.code }
}

/** No raw provider text, arbitrary identifiers, or credentials can escape this boundary. */
export function parseEmailTestResult(value: unknown, status: number): EmailTestResult {
  const data = record(value)
  const testReference = reference(data.reference)
  const requestId = reference(data.requestId ?? data.request_id)
  const metadata = { ...(testReference ? { reference: testReference } : {}), ...(requestId ? { requestId } : {}) }
  if (status === HTTP_OK && data.ok === true && data.code === EMAIL_OUTCOME_ACCEPTED && testReference) {
    return { ok: true, code: EMAIL_OUTCOME_ACCEPTED, ...metadata }
  }
  if (data.ok === false && typeof data.code === 'string' && EMAIL_FAILURE_CODES.has(data.code)) {
    return { ok: false, code: data.code, ...metadata }
  }
  const code =
    status === HTTP_UNAUTHORIZED
      ? 'email_authentication_required'
      : status === HTTP_FORBIDDEN
        ? 'email_operator_required'
        : status === HTTP_TOO_MANY_REQUESTS
          ? 'rate_limited'
          : EMAIL_OUTCOME_UNKNOWN
  return { ok: false, code, ...metadata }
}
