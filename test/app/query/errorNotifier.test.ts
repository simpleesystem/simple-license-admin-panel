import { describe, expect, it, vi } from 'vitest'

import { I18N_KEY_APP_ERROR_MESSAGE, I18N_KEY_APP_ERROR_TITLE, NOTIFICATION_VARIANT_ERROR } from '@/app/constants'
import { notifyQueryError, registerQueryErrorNotifier } from '@/app/query/errorNotifier'
import type { ToastNotificationPayload } from '@/notifications/constants'

describe('query error notifier', () => {
  const payload: ToastNotificationPayload = {
    titleKey: I18N_KEY_APP_ERROR_TITLE,
    descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
    variant: NOTIFICATION_VARIANT_ERROR,
  }

  it('routes notifications to the latest registered handler', () => {
    const firstHandler = vi.fn()
    const secondHandler = vi.fn()

    const unregisterFirst = registerQueryErrorNotifier(firstHandler)
    const unregisterSecond = registerQueryErrorNotifier(secondHandler)

    notifyQueryError(payload)

    expect(firstHandler).not.toHaveBeenCalled()
    expect(secondHandler).toHaveBeenCalledWith(payload)

    unregisterFirst()
    unregisterSecond()
  })

  it('stops routing notifications after unregistering the handler', () => {
    const handler = vi.fn()
    const unregister = registerQueryErrorNotifier(handler)

    notifyQueryError(payload)
    unregister()
    notifyQueryError(payload)

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
