import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { usePermissions } from '../auth/useAuthorization'
import { AbilityContext } from './abilityContext'
import { buildAbilityFromPermissions } from './factory'

type AbilityProviderProps = PropsWithChildren

export function AbilityProvider({ children }: AbilityProviderProps) {
  const permissions = usePermissions()

  const ability = useMemo(() => buildAbilityFromPermissions(permissions), [permissions])

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
}
