import { WS_STATE_CONNECTED, WS_STATE_CONNECTING } from '@simple-license/react-sdk'
import { describe, expect, test } from 'vitest'

import {
  UI_BADGE_VARIANT_INFO,
  UI_BADGE_VARIANT_SECONDARY,
  UI_BADGE_VARIANT_SUCCESS,
  UI_BADGE_VARIANT_WARNING,
  UI_LIVE_STATUS_CONNECTED,
  UI_LIVE_STATUS_CONNECTING,
  UI_LIVE_STATUS_DISCONNECTED,
  UI_LIVE_STATUS_ERROR,
} from '../../../src/ui/constants'
import { getLiveStatusDescriptor } from '../../../src/ui/utils/liveStatus'

describe('getLiveStatusDescriptor', () => {
  test('returns error variant when socket has error flag', () => {
    const descriptor = getLiveStatusDescriptor(WS_STATE_CONNECTED, true)

    expect(descriptor).toEqual({ text: UI_LIVE_STATUS_ERROR, variant: UI_BADGE_VARIANT_WARNING })
  })

  test('returns connected variant', () => {
    const descriptor = getLiveStatusDescriptor(WS_STATE_CONNECTED, false)

    expect(descriptor).toEqual({ text: UI_LIVE_STATUS_CONNECTED, variant: UI_BADGE_VARIANT_SUCCESS })
  })

  test('returns connecting variant', () => {
    const descriptor = getLiveStatusDescriptor(WS_STATE_CONNECTING, false)

    expect(descriptor).toEqual({ text: UI_LIVE_STATUS_CONNECTING, variant: UI_BADGE_VARIANT_INFO })
  })

  test('returns disconnected variant by default', () => {
    const descriptor = getLiveStatusDescriptor('unknown' as never, false)

    expect(descriptor).toEqual({ text: UI_LIVE_STATUS_DISCONNECTED, variant: UI_BADGE_VARIANT_SECONDARY })
  })
})
