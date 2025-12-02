import { useContext } from 'react'

import { ERROR_MESSAGE_AUTHORIZATION_CONTEXT_UNAVAILABLE } from '../../app/constants'
import { AuthorizationContext } from './authorizationContext'
import type { PermissionKey, Permissions } from './permissions'

export const usePermissions = (): Permissions => {
  const context = useContext(AuthorizationContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_AUTHORIZATION_CONTEXT_UNAVAILABLE)
  }
  return context
}

export const useCan = (permission: PermissionKey): boolean => {
  const permissions = usePermissions()
  return permissions[permission] ?? false
}

