import {
  DEFAULT_NOTIFICATION_EVENT,
  I18N_KEY_APP_ERROR_TITLE,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_SUCCESS,
} from '@/app/constants'
import type { NotificationBus } from '@/notifications/types'

import {
  UI_PRODUCT_ENTITLEMENT_TOAST_CREATE_SUCCESS,
  UI_PRODUCT_ENTITLEMENT_TOAST_DELETE_SUCCESS,
  UI_PRODUCT_ENTITLEMENT_TOAST_UPDATE_SUCCESS,
  UI_PRODUCT_TIER_TOAST_CREATE_SUCCESS,
  UI_PRODUCT_TIER_TOAST_DELETE_SUCCESS,
  UI_PRODUCT_TIER_TOAST_UPDATE_SUCCESS,
  UI_PRODUCT_TOAST_CREATE_SUCCESS,
  UI_PRODUCT_TOAST_DELETE_SUCCESS,
  UI_PRODUCT_TOAST_RESUME_SUCCESS,
  UI_PRODUCT_TOAST_SUSPEND_SUCCESS,
  UI_PRODUCT_TOAST_UPDATE_SUCCESS,
  UI_TENANT_TOAST_CREATE_SUCCESS,
  UI_TENANT_TOAST_DELETE_SUCCESS,
  UI_TENANT_TOAST_RESUME_SUCCESS,
  UI_TENANT_TOAST_SUSPEND_SUCCESS,
  UI_TENANT_TOAST_UPDATE_SUCCESS,
  UI_USER_TOAST_CREATE_SUCCESS,
  UI_USER_TOAST_DELETE_SUCCESS,
  UI_USER_TOAST_UPDATE_SUCCESS,
} from '../constants'

type CrudKind = 'create' | 'update' | 'delete' | 'suspend' | 'resume'

const USER_SUCCESS_TITLES: Record<Exclude<CrudKind, 'suspend' | 'resume'>, string> = {
  create: UI_USER_TOAST_CREATE_SUCCESS,
  update: UI_USER_TOAST_UPDATE_SUCCESS,
  delete: UI_USER_TOAST_DELETE_SUCCESS,
}

const TENANT_SUCCESS_TITLES: Record<CrudKind, string> = {
  create: UI_TENANT_TOAST_CREATE_SUCCESS,
  update: UI_TENANT_TOAST_UPDATE_SUCCESS,
  delete: UI_TENANT_TOAST_DELETE_SUCCESS,
  suspend: UI_TENANT_TOAST_SUSPEND_SUCCESS,
  resume: UI_TENANT_TOAST_RESUME_SUCCESS,
}

const PRODUCT_SUCCESS_TITLES: Record<CrudKind, string> = {
  create: UI_PRODUCT_TOAST_CREATE_SUCCESS,
  update: UI_PRODUCT_TOAST_UPDATE_SUCCESS,
  delete: UI_PRODUCT_TOAST_DELETE_SUCCESS,
  suspend: UI_PRODUCT_TOAST_SUSPEND_SUCCESS,
  resume: UI_PRODUCT_TOAST_RESUME_SUCCESS,
}

const PRODUCT_TIER_SUCCESS_TITLES: Record<Exclude<CrudKind, 'suspend' | 'resume'>, string> = {
  create: UI_PRODUCT_TIER_TOAST_CREATE_SUCCESS,
  update: UI_PRODUCT_TIER_TOAST_UPDATE_SUCCESS,
  delete: UI_PRODUCT_TIER_TOAST_DELETE_SUCCESS,
}

const PRODUCT_ENTITLEMENT_SUCCESS_TITLES: Record<Exclude<CrudKind, 'suspend' | 'resume'>, string> = {
  create: UI_PRODUCT_ENTITLEMENT_TOAST_CREATE_SUCCESS,
  update: UI_PRODUCT_ENTITLEMENT_TOAST_UPDATE_SUCCESS,
  delete: UI_PRODUCT_ENTITLEMENT_TOAST_DELETE_SUCCESS,
}

const emitSuccessToast = (bus: NotificationBus, titleKey: string) => {
  bus.emit(DEFAULT_NOTIFICATION_EVENT, {
    titleKey,
    variant: NOTIFICATION_VARIANT_SUCCESS,
  })
}

export const notifyUserSuccess = (bus: NotificationBus, kind: Exclude<CrudKind, 'suspend' | 'resume'>) =>
  emitSuccessToast(bus, USER_SUCCESS_TITLES[kind])

export const notifyTenantSuccess = (bus: NotificationBus, kind: CrudKind) =>
  emitSuccessToast(bus, TENANT_SUCCESS_TITLES[kind])

export const notifyProductSuccess = (bus: NotificationBus, kind: CrudKind) =>
  emitSuccessToast(bus, PRODUCT_SUCCESS_TITLES[kind])

export const notifyProductTierSuccess = (bus: NotificationBus, kind: Exclude<CrudKind, 'suspend' | 'resume'>) =>
  emitSuccessToast(bus, PRODUCT_TIER_SUCCESS_TITLES[kind])

export const notifyProductEntitlementSuccess = (bus: NotificationBus, kind: Exclude<CrudKind, 'suspend' | 'resume'>) =>
  emitSuccessToast(bus, PRODUCT_ENTITLEMENT_SUCCESS_TITLES[kind])

export const notifyCrudError = (bus: NotificationBus) => {
  bus.emit(DEFAULT_NOTIFICATION_EVENT, {
    titleKey: I18N_KEY_APP_ERROR_TITLE,
    variant: NOTIFICATION_VARIANT_ERROR,
  })
}
