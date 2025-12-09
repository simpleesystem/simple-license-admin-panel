type MaybeHeaderValue = string | number | string[] | number[] | boolean | null | undefined

export type NormalizedTelemetry = {
  method: string
  url?: string
  status?: number
  durationMs?: number
  requestId?: string
  correlationId?: string
  attempt?: number
  error?: unknown
}

const toStringOrUndefined = (value: MaybeHeaderValue): string | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).join(',')
  }
  return String(value)
}

export const normalizeTelemetry = (payload: NormalizedTelemetry): NormalizedTelemetry => ({
  method: (payload.method || 'GET').toString().toUpperCase(),
  url: payload.url || undefined,
  status: payload.status !== undefined ? payload.status : undefined,
  durationMs: payload.durationMs,
  requestId: toStringOrUndefined(payload.requestId),
  correlationId: toStringOrUndefined(payload.correlationId),
  attempt: payload.attempt,
  error: payload.error,
})

export const getHeaderString = (
  headers: Record<string, unknown> | undefined,
  key: string
): string | undefined => {
  if (!headers) {
    return undefined
  }
  const lower = key.toLowerCase()
  return (
    toStringOrUndefined(headers[lower] as unknown) ??
    toStringOrUndefined(headers[key] as unknown)
  )
}

export const extractHeaderString = (value: MaybeHeaderValue): string | undefined => toStringOrUndefined(value)
