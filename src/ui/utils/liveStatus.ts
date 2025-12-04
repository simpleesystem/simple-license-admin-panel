import {
  WS_STATE_CONNECTED,
  WS_STATE_CONNECTING,
  WS_STATE_ERROR,
  type WebSocketState,
} from '@simple-license/react-sdk'

import {
  UI_BADGE_VARIANT_INFO,
  UI_BADGE_VARIANT_SECONDARY,
  UI_BADGE_VARIANT_SUCCESS,
  UI_BADGE_VARIANT_WARNING,
  UI_LIVE_STATUS_CONNECTED,
  UI_LIVE_STATUS_CONNECTING,
  UI_LIVE_STATUS_DISCONNECTED,
  UI_LIVE_STATUS_ERROR,
} from '../constants'

export type LiveStatusDescriptor = {
  text: string
  variant: string
}

export const getLiveStatusDescriptor = (state: WebSocketState, hasError: boolean): LiveStatusDescriptor => {
  if (hasError || state === WS_STATE_ERROR) {
    return { text: UI_LIVE_STATUS_ERROR, variant: UI_BADGE_VARIANT_WARNING }
  }

  if (state === WS_STATE_CONNECTED) {
    return { text: UI_LIVE_STATUS_CONNECTED, variant: UI_BADGE_VARIANT_SUCCESS }
  }

  if (state === WS_STATE_CONNECTING) {
    return { text: UI_LIVE_STATUS_CONNECTING, variant: UI_BADGE_VARIANT_INFO }
  }

  return { text: UI_LIVE_STATUS_DISCONNECTED, variant: UI_BADGE_VARIANT_SECONDARY }
}

