import { describe, expect, it, vi } from 'vitest'

import { registerQueryErrorNotifier, notifyQueryError } from '../../../src/app/query/errorNotifier'
import {
  I18N_KEY_APP_ERROR_MESSAGE,
  I18N_KEY_APP_ERROR_TITLE,
  NOTIFICATION_VARIANT_ERROR,
} from '../../../src/app/constants'

const samplePayload = {
  titleKey: I18N_KEY_APP_ERROR_TITLE,
  descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
  variant: NOTIFICATION_VARIANT_ERROR,
}

describe('query error notifier', () => {
  it('invokes the registered notifier when errors occur', () => {
    const spy = vi.fn()
    const cleanup = registerQueryErrorNotifier(spy)

    notifyQueryError(samplePayload)

    expect(spy).toHaveBeenCalledWith(samplePayload)
    cleanup()
  })

  it('stops notifying once unsubscribed', () => {
    const spy = vi.fn()
    const cleanup = registerQueryErrorNotifier(spy)

    cleanup()
    notifyQueryError(samplePayload)

    expect(spy).not.toHaveBeenCalled()
  })

  it('ignores stale cleanup handlers once a new notifier is registered', () => {
    const first = vi.fn()
    const second = vi.fn()

    const firstCleanup = registerQueryErrorNotifier(first)
    registerQueryErrorNotifier(second)

    firstCleanup()
    notifyQueryError(samplePayload)

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})


