import { describe, expect, it } from 'vitest'
import { coerceScopeFromMeta } from '@/app/query/scope'

describe('coerceScopeFromMeta', () => {
  it('returns scope from meta when meta is object with valid scope string', () => {
    const meta = { scope: 'custom-scope' }
    const result = coerceScopeFromMeta(meta)
    expect(result).toBe('custom-scope')
  })

  it('returns scope from queryKey when meta does not have valid scope', () => {
    const meta = {}
    const queryKey = ['query-scope']
    const result = coerceScopeFromMeta(meta, queryKey)
    expect(result).toBe('query-scope')
  })

  it('returns DEFAULT_SCOPE when neither meta nor queryKey provide valid scope', () => {
    const result = coerceScopeFromMeta(null)
    expect(result).toBe('data')
  })

  it('returns DEFAULT_SCOPE when meta scope is empty string', () => {
    const meta = { scope: '' }
    const result = coerceScopeFromMeta(meta)
    expect(result).toBe('data')
  })

  it('returns DEFAULT_SCOPE when meta scope is whitespace only', () => {
    const meta = { scope: '   ' }
    const result = coerceScopeFromMeta(meta)
    expect(result).toBe('data')
  })

  it('returns scope from queryKey when meta scope is invalid but queryKey is valid', () => {
    const meta = { scope: '' }
    const queryKey = ['valid-scope']
    const result = coerceScopeFromMeta(meta, queryKey)
    expect(result).toBe('valid-scope')
  })

  it('returns DEFAULT_SCOPE when queryKey first element is empty string', () => {
    const meta = {}
    const queryKey = ['']
    const result = coerceScopeFromMeta(meta, queryKey)
    expect(result).toBe('data')
  })

  it('returns DEFAULT_SCOPE when queryKey first element is whitespace only', () => {
    const meta = {}
    const queryKey = ['   ']
    const result = coerceScopeFromMeta(meta, queryKey)
    expect(result).toBe('data')
  })
})
