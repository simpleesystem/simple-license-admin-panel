import type { ToastNotificationPayload } from '../../notifications/constants'

type QueryErrorNotifier = (payload: ToastNotificationPayload) => void

let currentNotifier: QueryErrorNotifier | null = null

export const registerQueryErrorNotifier = (notifier: QueryErrorNotifier): (() => void) => {
  currentNotifier = notifier
  return () => {
    if (currentNotifier === notifier) {
      currentNotifier = null
    }
  }
}

export const notifyQueryError = (payload: ToastNotificationPayload): void => {
  currentNotifier?.(payload)
}


