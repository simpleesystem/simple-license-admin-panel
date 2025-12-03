import {
  ABILITY_ACTION_MANAGE,
  ABILITY_ACTION_VIEW,
  ABILITY_SUBJECT_ANALYTICS,
  ABILITY_SUBJECT_DASHBOARD,
  ABILITY_SUBJECT_LICENSE,
  ABILITY_SUBJECT_PRODUCT,
  ABILITY_SUBJECT_TENANT,
  ABILITY_SUBJECT_USER,
} from '../constants'
import type { PermissionKey } from '../auth/permissions'

export const ABILITY_ACTIONS = [ABILITY_ACTION_VIEW, ABILITY_ACTION_MANAGE] as const
export type AbilityAction = (typeof ABILITY_ACTIONS)[number]

export const ABILITY_SUBJECTS = [
  ABILITY_SUBJECT_DASHBOARD,
  ABILITY_SUBJECT_LICENSE,
  ABILITY_SUBJECT_PRODUCT,
  ABILITY_SUBJECT_TENANT,
  ABILITY_SUBJECT_USER,
  ABILITY_SUBJECT_ANALYTICS,
] as const
export type AbilitySubject = (typeof ABILITY_SUBJECTS)[number]

export type AbilityTuple = readonly [AbilityAction, AbilitySubject]

type PermissionAbilityMap = Record<PermissionKey, AbilityTuple[]>

export const PERMISSION_TO_ABILITIES: PermissionAbilityMap = {
  viewDashboard: [[ABILITY_ACTION_VIEW, ABILITY_SUBJECT_DASHBOARD]],
  manageLicenses: [
    [ABILITY_ACTION_VIEW, ABILITY_SUBJECT_LICENSE],
    [ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_LICENSE],
  ],
  manageProducts: [
    [ABILITY_ACTION_VIEW, ABILITY_SUBJECT_PRODUCT],
    [ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_PRODUCT],
  ],
  manageTenants: [
    [ABILITY_ACTION_VIEW, ABILITY_SUBJECT_TENANT],
    [ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_TENANT],
  ],
  manageUsers: [
    [ABILITY_ACTION_VIEW, ABILITY_SUBJECT_USER],
    [ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_USER],
  ],
  viewAnalytics: [[ABILITY_ACTION_VIEW, ABILITY_SUBJECT_ANALYTICS]],
  changePassword: [],
}

export const getAbilitiesForPermission = (permission: PermissionKey): readonly AbilityTuple[] => {
  return PERMISSION_TO_ABILITIES[permission]
}


