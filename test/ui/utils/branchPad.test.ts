import { describe, expect, test } from 'vitest'

import { branchPad, branchPadChoice } from '@/ui/utils/branchPad'

describe('branchPad', () => {
  test('returns yes when condition is true', () => {
    expect(branchPad(true)).toBe('yes')
  })

  test('returns no when condition is false', () => {
    expect(branchPad(false)).toBe('no')
  })

  test('handles tri-state choices', () => {
    expect(branchPadChoice(true)).toBe('yes')
    expect(branchPadChoice(false)).toBe('no')
    expect(branchPadChoice(undefined, 'maybe')).toBe('maybe')
    expect(branchPadChoice(undefined)).toBe('no')
  })
})
