import type { BatchOperationResponse } from '@/simpleLicense'
import { NOTIFICATION_EVENT_TOAST, NOTIFICATION_VARIANT_SUCCESS } from '../../../app/constants'
import type { NotificationBus } from '../../../notifications/types'
import { UI_TABLE_BATCH_TOAST_PARTIAL } from '../../constants'

export function notifyBatchOperationResult(
  notificationBus: NotificationBus,
  result: BatchOperationResponse,
  successTitle: string,
  partialTitle: string = UI_TABLE_BATCH_TOAST_PARTIAL
): void {
  const hasPartial = result.data.skipped.length > 0 || result.data.failed.length > 0
  notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
    titleKey: hasPartial ? partialTitle : successTitle,
    variant: NOTIFICATION_VARIANT_SUCCESS,
  })
}
