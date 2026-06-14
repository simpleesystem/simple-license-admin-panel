import { describe, expect, it } from 'vitest'
import { ApiException } from '@/simpleLicense'
import { UI_ERROR_INVALID_METADATA_JSON } from '@/ui/constants'
import { parseMetadataInput } from '@/ui/workflows/mutationHelpers'

describe('parseMetadataInput', () => {
  it('returns undefined for empty or whitespace-only input', () => {
    expect(parseMetadataInput(undefined)).toBeUndefined()
    expect(parseMetadataInput('')).toBeUndefined()
    expect(parseMetadataInput('   ')).toBeUndefined()
  })

  it('parses a valid JSON object', () => {
    expect(parseMetadataInput('{"plan": "pro", "seats": 5}')).toEqual({ plan: 'pro', seats: 5 })
  })

  it('throws a user-facing validation error for malformed JSON', () => {
    expect(() => parseMetadataInput('{not json')).toThrowError(ApiException)
    expect(() => parseMetadataInput('{not json')).toThrowError(UI_ERROR_INVALID_METADATA_JSON)
  })

  it('rejects JSON values that are not plain objects', () => {
    expect(() => parseMetadataInput('[1, 2, 3]')).toThrowError(UI_ERROR_INVALID_METADATA_JSON)
    expect(() => parseMetadataInput('"a string"')).toThrowError(UI_ERROR_INVALID_METADATA_JSON)
    expect(() => parseMetadataInput('42')).toThrowError(UI_ERROR_INVALID_METADATA_JSON)
    expect(() => parseMetadataInput('null')).toThrowError(UI_ERROR_INVALID_METADATA_JSON)
  })
})
