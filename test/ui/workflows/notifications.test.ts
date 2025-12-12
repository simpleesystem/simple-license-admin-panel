import { describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_NOTIFICATION_EVENT,
  I18N_KEY_APP_ERROR_TITLE,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_SUCCESS,
} from '@/app/constants'
import {
  notifyCrudError,
  notifyProductEntitlementSuccess,
  notifyProductSuccess,
  notifyProductTierSuccess,
  notifyTenantSuccess,
  notifyUserSuccess,
} from '@/ui/workflows/notifications'

const createBus = () => {
  const emit = vi.fn()
  return { emit }
}

describe('workflows notifications', () => {
  it('emits user success toasts for create/update/delete', () => {
    const bus = createBus()

    notifyUserSuccess(bus as never, 'create')
    notifyUserSuccess(bus as never, 'update')
    notifyUserSuccess(bus as never, 'delete')

    expect(bus.emit).toHaveBeenCalledTimes(3)
    expect(bus.emit).toHaveBeenCalledWith(DEFAULT_NOTIFICATION_EVENT, {
      titleKey: expect.stringContaining('User'),
      variant: NOTIFICATION_VARIANT_SUCCESS,
    })
  })

  it('emits tenant success toasts for lifecycle actions', () => {
    const bus = createBus()

    notifyTenantSuccess(bus as never, 'create')
    notifyTenantSuccess(bus as never, 'update')
    notifyTenantSuccess(bus as never, 'suspend')
    notifyTenantSuccess(bus as never, 'resume')
    notifyTenantSuccess(bus as never, 'delete')

    expect(bus.emit).toHaveBeenCalledTimes(5)
    expect(bus.emit).toHaveBeenLastCalledWith(DEFAULT_NOTIFICATION_EVENT, {
      titleKey: expect.stringContaining('successfully'),
      variant: NOTIFICATION_VARIANT_SUCCESS,
    })
  })

  it('emits product success toasts for lifecycle actions', () => {
    const bus = createBus()

    notifyProductSuccess(bus as never, 'create')
    notifyProductSuccess(bus as never, 'update')
    notifyProductSuccess(bus as never, 'suspend')
    notifyProductSuccess(bus as never, 'resume')
    notifyProductSuccess(bus as never, 'delete')

    expect(bus.emit).toHaveBeenCalledTimes(5)
    expect(bus.emit).toHaveBeenLastCalledWith(DEFAULT_NOTIFICATION_EVENT, {
      titleKey: expect.stringContaining('successfully'),
      variant: NOTIFICATION_VARIANT_SUCCESS,
    })
  })

  it('emits product tier success toasts for CRUD actions', () => {
    const bus = createBus()

    notifyProductTierSuccess(bus as never, 'create')
    notifyProductTierSuccess(bus as never, 'update')
    notifyProductTierSuccess(bus as never, 'delete')

    expect(bus.emit).toHaveBeenCalledTimes(3)
    expect(bus.emit).toHaveBeenLastCalledWith(DEFAULT_NOTIFICATION_EVENT, {
      titleKey: expect.stringContaining('successfully'),
      variant: NOTIFICATION_VARIANT_SUCCESS,
    })
  })

  it('emits product entitlement success toasts for CRUD actions', () => {
    const bus = createBus()

    notifyProductEntitlementSuccess(bus as never, 'create')
    notifyProductEntitlementSuccess(bus as never, 'update')
    notifyProductEntitlementSuccess(bus as never, 'delete')

    expect(bus.emit).toHaveBeenCalledTimes(3)
    expect(bus.emit).toHaveBeenLastCalledWith(DEFAULT_NOTIFICATION_EVENT, {
      titleKey: expect.stringContaining('successfully'),
      variant: NOTIFICATION_VARIANT_SUCCESS,
    })
  })

  it('emits error toast payloads on CRUD errors', () => {
    const bus = createBus()

    notifyCrudError(bus as never)

    expect(bus.emit).toHaveBeenCalledWith(DEFAULT_NOTIFICATION_EVENT, {
      titleKey: I18N_KEY_APP_ERROR_TITLE,
      variant: NOTIFICATION_VARIANT_ERROR,
    })
  })
})
