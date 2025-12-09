const DEFAULT_SCOPE = 'data' as const

type MetaWithScope = { scope?: unknown }

export const coerceScopeFromMeta = (meta: unknown, queryKey?: unknown): string => {
  if (meta && typeof meta === 'object') {
    const candidate = (meta as MetaWithScope).scope
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate
    }
  }
  if (Array.isArray(queryKey) && typeof queryKey[0] === 'string' && queryKey[0].trim().length > 0) {
    return queryKey[0]
  }
  return DEFAULT_SCOPE
}
