import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { TrackingClient } from '../../../src/app/analytics/tracking'
import { TrackingContext, useTracking } from '../../../src/app/analytics/trackingContext'

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
