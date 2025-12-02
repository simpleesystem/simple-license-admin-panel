import { useMemo } from 'react'
import type { PropsWithChildren } from 'react'

import { AbilityContext } from './abilityContext'
import { buildAbilityFromPermissions } from './factory'
import { usePermissions } from '../auth/useAuthorization'

type AbilityProviderProps = PropsWithChildren

export function AbilityProvider({ children }: AbilityProviderProps) {
  const permissions = usePermissions()

  const ability = useMemo(() => buildAbilityFromPermissions(permissions), [permissions])

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
}


