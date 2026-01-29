import { derivePermissionsFromUser, type PermissionKey, type Permissions } from './permissions'
import { useAuth } from './useAuth'

export function usePermissions(): Permissions {
  const { user } = useAuth()
  return derivePermissionsFromUser(user)
}

export function useCan(permission: PermissionKey): boolean {
  const permissions = usePermissions()
  return permissions[permission] ?? false
}
