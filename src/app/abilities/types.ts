import type { MongoAbility } from '@casl/ability'

import type { AbilityAction, AbilitySubject } from './abilityMap'

export type AppAbility = MongoAbility<[AbilityAction, AbilitySubject]>
