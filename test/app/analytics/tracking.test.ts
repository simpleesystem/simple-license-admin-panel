import { describe, expect, it } from 'vitest'

import { createTrackingClient } from '../../../src/app/analytics/tracking'

describe('tracking client', () => {
  it('provides a noop track method by default', () => {
    const client = createTrackingClient()

    expect(() => client.track('event-id', { foo: 'bar' })).not.toThrow()
  })
})
