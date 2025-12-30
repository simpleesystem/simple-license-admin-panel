import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TrackingContext, useTracking } from '../../../src/app/analytics/trackingContext'
import type { TrackingClient } from '../../../src/app/analytics/tracking'

const createTrackingClient = (): TrackingClient => ({
  track: vi.fn(),
})

describe('tracking context', () => {
  it('throws when accessed without a provider', () => {
    expect(() => renderHook(() => useTracking())).toThrow(/Tracking context/)
  })

  it('returns the provided tracking client', () => {
    const trackingClient = createTrackingClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TrackingContext.Provider value={trackingClient}>{children}</TrackingContext.Provider>
    )

    const { result } = renderHook(() => useTracking(), { wrapper })

    expect(result.current).toBe(trackingClient)
  })
})
