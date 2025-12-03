import { describe, it, expect } from 'vitest'

import { PERMISSION_KEYS } from '@/app/auth/permissions'
import {
  ABILITY_ACTION_MANAGE,
  ABILITY_ACTION_VIEW,
  ABILITY_SUBJECT_ANALYTICS,
  ABILITY_SUBJECT_DASHBOARD,
  ABILITY_SUBJECT_LICENSE,
  ABILITY_SUBJECT_PRODUCT,
  ABILITY_SUBJECT_TENANT,
  ABILITY_SUBJECT_USER,
} from '@/app/constants'
import {
  getAbilitiesForPermission,
  PERMISSION_TO_ABILITIES,
} from '@/app/abilities/abilityMap'

describe('permission to ability mapping', () => {
  it('covers every permission key with at least one ability tuple', () => {
    const mappedPermissionKeys = Object.keys(PERMISSION_TO_ABILITIES)
    expect(mappedPermissionKeys).toHaveLength(PERMISSION_KEYS.length)

    const permissionsWithoutAbilities = new Set(['changePassword'])

    PERMISSION_KEYS.forEach((permission) => {
      if (permissionsWithoutAbilities.has(permission)) {
        expect(getAbilitiesForPermission(permission)).toHaveLength(0)
      } else {
        expect(getAbilitiesForPermission(permission)).not.toHaveLength(0)
      }
    })
  })

  it('maps viewDashboard to the dashboard view ability', () => {
    const abilities = getAbilitiesForPermission('viewDashboard')
    expect(abilities).toContainEqual([ABILITY_ACTION_VIEW, ABILITY_SUBJECT_DASHBOARD])
  })

  it('maps manageLicenses to both view and manage license abilities', () => {
    const abilities = getAbilitiesForPermission('manageLicenses')
    expect(abilities).toContainEqual([ABILITY_ACTION_VIEW, ABILITY_SUBJECT_LICENSE])
    expect(abilities).toContainEqual([ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_LICENSE])
  })

  it('maps manageProducts to manage product abilities', () => {
    const abilities = getAbilitiesForPermission('manageProducts')
    expect(abilities).toContainEqual([ABILITY_ACTION_VIEW, ABILITY_SUBJECT_PRODUCT])
    expect(abilities).toContainEqual([ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_PRODUCT])
  })

  it('maps manageTenants to manage tenant abilities', () => {
    const abilities = getAbilitiesForPermission('manageTenants')
    expect(abilities).toContainEqual([ABILITY_ACTION_VIEW, ABILITY_SUBJECT_TENANT])
    expect(abilities).toContainEqual([ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_TENANT])
  })

  it('maps manageUsers to manage user abilities', () => {
    const abilities = getAbilitiesForPermission('manageUsers')
    expect(abilities).toContainEqual([ABILITY_ACTION_VIEW, ABILITY_SUBJECT_USER])
    expect(abilities).toContainEqual([ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_USER])
  })

  it('maps viewAnalytics to analytics view ability', () => {
    const abilities = getAbilitiesForPermission('viewAnalytics')
    expect(abilities).toContainEqual([ABILITY_ACTION_VIEW, ABILITY_SUBJECT_ANALYTICS])
  })
})


