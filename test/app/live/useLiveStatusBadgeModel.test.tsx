import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  ADMIN_SYSTEM_WS_STATUS_CONNECTED,
  ADMIN_SYSTEM_WS_STATUS_CONNECTING,
  ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
  ADMIN_SYSTEM_WS_STATUS_ERROR,
} from '../../../src/app/constants'
import { useLiveStatusBadgeModel } from '../../../src/app/live/useLiveStatusBadgeModel'
import {
  UI_BADGE_VARIANT_DANGER,
  UI_BADGE_VARIANT_INFO,
  UI_BADGE_VARIANT_SECONDARY,
  UI_BADGE_VARIANT_SUCCESS,
  UI_LIVE_STATUS_CONNECTED,
  UI_LIVE_STATUS_CONNECTING,
  UI_LIVE_STATUS_DISCONNECTED,
  UI_LIVE_STATUS_ERROR,
} from '../../../src/ui/constants'

const mockUseAdminSystemLiveFeed = vi.fn()

vi.mock('../../../src/app/live/useAdminSystemLiveFeed', () => ({
  useAdminSystemLiveFeed: () => mockUseAdminSystemLiveFeed(),
}))

const createState = (connectionStatus: string) => ({
  connectionStatus,
  lastError: null,
  lastHealthUpdate: null,
})

describe('useLiveStatusBadgeModel', () => {
  it('returns connecting status model', () => {
    mockUseAdminSystemLiveFeed.mockReturnValueOnce({
      state: createState(ADMIN_SYSTEM_WS_STATUS_CONNECTING),
    })

    const { result } = renderHook(() => useLiveStatusBadgeModel())

    expect(result.current).toEqual({
      text: UI_LIVE_STATUS_CONNECTING,
      variant: UI_BADGE_VARIANT_INFO,
    })
  })

  it('returns connected status model', () => {
    mockUseAdminSystemLiveFeed.mockReturnValueOnce({
      state: createState(ADMIN_SYSTEM_WS_STATUS_CONNECTED),
    })

    const { result } = renderHook(() => useLiveStatusBadgeModel())

    expect(result.current).toEqual({
      text: UI_LIVE_STATUS_CONNECTED,
      variant: UI_BADGE_VARIANT_SUCCESS,
    })
  })

  it('returns error status model', () => {
    mockUseAdminSystemLiveFeed.mockReturnValueOnce({
      state: createState(ADMIN_SYSTEM_WS_STATUS_ERROR),
    })

    const { result } = renderHook(() => useLiveStatusBadgeModel())

    expect(result.current).toEqual({
      text: UI_LIVE_STATUS_ERROR,
      variant: UI_BADGE_VARIANT_DANGER,
    })
  })

  it('returns disconnected status model by default', () => {
    mockUseAdminSystemLiveFeed.mockReturnValueOnce({
      state: createState(ADMIN_SYSTEM_WS_STATUS_DISCONNECTED),
    })

    const { result } = renderHook(() => useLiveStatusBadgeModel())

    expect(result.current).toEqual({
      text: UI_LIVE_STATUS_DISCONNECTED,
      variant: UI_BADGE_VARIANT_SECONDARY,
    })
  })
})
