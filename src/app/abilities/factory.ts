import { AbilityBuilder, createMongoAbility } from '@casl/ability'

import type { Permissions } from '../auth/permissions'
import { PERMISSION_KEYS } from '../auth/permissions'
import type { AbilitySubject } from './abilityMap'
import { getAbilitiesForPermission } from './abilityMap'
import type { AppAbility } from './types'

export const buildAbilityFromPermissions = (permissions: Permissions): AppAbility => {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  for (const permission of PERMISSION_KEYS) {
    if (!permissions[permission]) {
      continue
    }

    const abilityTuples = getAbilitiesForPermission(permission)
    for (const [action, subject] of abilityTuples) {
      can(action, subject)
    }
  }

  return build({
    detectSubjectType: (subject: AbilitySubject) => subject,
  })
}
