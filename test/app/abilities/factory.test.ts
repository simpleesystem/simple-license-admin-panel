import { describe, it, expect } from 'vitest'

import {
  ABILITY_ACTION_MANAGE,
  ABILITY_ACTION_VIEW,
  ABILITY_SUBJECT_DASHBOARD,
  ABILITY_SUBJECT_LICENSE,
} from '@/app/constants'
import { buildAbilityFromPermissions } from '@/app/abilities/factory'
import { buildPermissions } from '@/test/factories/permissionFactory'

describe('buildAbilityFromPermissions', () => {
  it('grants dashboard ability when permission is present', () => {
    const ability = buildAbilityFromPermissions(
      buildPermissions({ viewDashboard: true }),
    )

    expect(ability.can(ABILITY_ACTION_VIEW, ABILITY_SUBJECT_DASHBOARD)).toBe(true)
  })

  it('grants both view and manage license abilities for manageLicenses permission', () => {
    const ability = buildAbilityFromPermissions(
      buildPermissions({ manageLicenses: true }),
    )

    expect(ability.can(ABILITY_ACTION_VIEW, ABILITY_SUBJECT_LICENSE)).toBe(true)
    expect(ability.can(ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_LICENSE)).toBe(true)
  })

  it('denies abilities when permission is absent', () => {
    const ability = buildAbilityFromPermissions(buildPermissions())

    expect(ability.can(ABILITY_ACTION_VIEW, ABILITY_SUBJECT_DASHBOARD)).toBe(false)
    expect(ability.can(ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_LICENSE)).toBe(false)
  })
})


