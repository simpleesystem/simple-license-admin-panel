import { HTTP_FORBIDDEN, HTTP_OK, HTTP_TOO_MANY_REQUESTS, HTTP_UNAUTHORIZED } from './constants'
import { ApiException } from './exceptions/ApiException'

export const EMAIL_OUTCOME_UNKNOWN = 'delivery_unknown'
export const EMAIL_OUTCOME_ACCEPTED = 'accepted'
export const EMAIL_STATUS_UNAVAILABLE = 'email_status_unavailable'
export const EMAIL_AMBIGUOUS_CODES = new Set([EMAIL_OUTCOME_UNKNOWN, 'unknown_send'])
const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
const EMAIL_FAILURE_CODES = new Set([
  // Protected endpoint's local failures, followed by the frozen eece0eec relay protocol.
  'email_not_configured',
  'development_only',
  'email_operator_required',
  'confirm_required',
  'rate_limited',
  'validation_error',
  'message_too_large',
  'unauthorized',
  'invalid_site',
  'site_disabled',
  'config_invalid',
  'invalid_request_id',
  'invalid_json',
  'invalid_payload',
  'request_too_large',
  'unsupported_media_type',
  'method_not_allowed',
  'not_found',
  'recipient_not_allowed',
  'too_many_recipients',
  'too_many_attachments',
  'content_too_large',
  'invalid_header',
  'invalid_attachment',
  'quota_exceeded',
  'ledger_full',
  'idempotency_conflict',
  'storage_unavailable',
  'sender_not_verified',
  'sender_domain_unavailable',
  'recipient_suppressed',
  'provider_validation_rejected',
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
