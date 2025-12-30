import type { Emitter } from 'mitt'

import { NOTIFICATION_EVENT_TOAST } from '../app/constants'
import type { ToastNotificationPayload } from './constants'

export type NotificationEventMap = {
  [NOTIFICATION_EVENT_TOAST]: ToastNotificationPayload
}

export type NotificationBus = Emitter<NotificationEventMap>
