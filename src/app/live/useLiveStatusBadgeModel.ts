import {
  UI_BADGE_VARIANT_DANGER,
  UI_BADGE_VARIANT_INFO,
  UI_BADGE_VARIANT_SECONDARY,
  UI_BADGE_VARIANT_SUCCESS,
  UI_LIVE_STATUS_CONNECTED,
  UI_LIVE_STATUS_CONNECTING,
  UI_LIVE_STATUS_DISCONNECTED,
  UI_LIVE_STATUS_ERROR,
} from '../../ui/constants'
import type { UiBadgeVariant } from '../../ui/types'
import {
  ADMIN_SYSTEM_WS_STATUS_CONNECTED,
  ADMIN_SYSTEM_WS_STATUS_CONNECTING,
  ADMIN_SYSTEM_WS_STATUS_ERROR,
} from '../constants'
import { useAdminSystemLiveFeed } from './useAdminSystemLiveFeed'

export const useLiveStatusBadgeModel = (): { text: string; variant: UiBadgeVariant } => {
  const { state } = useAdminSystemLiveFeed()
  switch (state.connectionStatus) {
    case ADMIN_SYSTEM_WS_STATUS_CONNECTING:
      return { text: UI_LIVE_STATUS_CONNECTING, variant: UI_BADGE_VARIANT_INFO }
    case ADMIN_SYSTEM_WS_STATUS_CONNECTED:
      return { text: UI_LIVE_STATUS_CONNECTED, variant: UI_BADGE_VARIANT_SUCCESS }
    case ADMIN_SYSTEM_WS_STATUS_ERROR:
      return { text: UI_LIVE_STATUS_ERROR, variant: UI_BADGE_VARIANT_DANGER }
    default:
      return { text: UI_LIVE_STATUS_DISCONNECTED, variant: UI_BADGE_VARIANT_SECONDARY }
  }
}
