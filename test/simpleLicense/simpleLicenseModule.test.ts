import { describe, expect, it } from 'vitest'

import { AxiosHttpClient, Client } from '@/simpleLicense'

describe('simpleLicense module', () => {
  it('exports Client', () => {
    expect(typeof Client).toBe('function')
  })

  it('exports AxiosHttpClient', () => {
    expect(typeof AxiosHttpClient).toBe('function')
  })
})


