import { ApiException } from '@/simpleLicense'
import type { MutationAdapter } from '../actions/mutationActions'
import { UI_ERROR_INVALID_METADATA_JSON } from '../constants'

/**
 * Shape the license/product APIs accept for the free-form `metadata` map:
 * a flat record of JSON scalars. Mirrors the `metadata` field on the
 * generated request types in `@/simpleLicense`.
 */
export type MetadataRecord = Record<string, string | number | boolean | null>

/**
 * Parse a metadata textarea value into an object, or throw a user-facing
 * validation error. Several update flows previously called bare JSON.parse
 * here, turning a typo in the metadata field into an unhandled rejection.
 *
 * The runtime guard proves we have a non-null, non-array object; the cast to
 * {@link MetadataRecord} is the API contract — `metadata` is a flat scalar
 * map and is serialized verbatim, so any nested value would be rejected
 * server-side regardless of the client type.
 */
export const parseMetadataInput = (metadataValue: string | undefined): MetadataRecord | undefined => {
  const trimmed = metadataValue?.trim()
  if (!trimmed) {
    return undefined
  }
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as MetadataRecord
    }
  } catch {
    throw new ApiException(UI_ERROR_INVALID_METADATA_JSON)
  }
  throw new ApiException(UI_ERROR_INVALID_METADATA_JSON)
}

type MutationLifecycle = {
  onClose?: () => void
  onCompleted?: () => void
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export const wrapMutationAdapter = <TFieldValues>(
  adapter: MutationAdapter<TFieldValues>,
  lifecycle: MutationLifecycle
): MutationAdapter<TFieldValues> => ({
  mutateAsync: async (values) => {
    try {
      const result = await adapter.mutateAsync(values)
      lifecycle.onSuccess?.()
      lifecycle.onCompleted?.()
      lifecycle.onClose?.()
      return result
    } catch (error) {
      lifecycle.onError?.(error)
      throw error
    }
  },
  isPending: adapter.isPending,
})
