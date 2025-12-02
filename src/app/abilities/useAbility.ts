import { useContext } from 'react'

import { ERROR_MESSAGE_ABILITY_CONTEXT_UNAVAILABLE } from '../constants'
import { AbilityContext } from './abilityContext'
import type { AbilityAction, AbilitySubject } from './abilityMap'
import type { AppAbility } from './types'

export const useAbility = (): AppAbility => {
  const context = useContext(AbilityContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_ABILITY_CONTEXT_UNAVAILABLE)
  }
  return context
}

export const useCanAbility = (
  action: AbilityAction,
  subject: AbilitySubject,
  conditions?: Record<string, unknown>,
): boolean => {
  const ability = useAbility()
  return ability.can(action, subject, conditions)
}


