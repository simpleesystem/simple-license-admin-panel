import { useMemo } from 'react'
import type { PropsWithChildren } from 'react'

import { useAuth } from './authContext'
import { AuthorizationContext } from './authorizationContext'
import { derivePermissionsFromUser } from './permissions'

type AuthorizationProviderProps = PropsWithChildren

export function AuthorizationProvider({ children }: AuthorizationProviderProps) {
  const { currentUser } = useAuth()

  const value = useMemo(() => derivePermissionsFromUser(currentUser), [currentUser])

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
}

