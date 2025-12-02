import type { Permissions } from '@/app/auth/permissions'
import { createPermissionSet } from '@/app/auth/permissions'

export const buildPermissions = (overrides: Partial<Permissions> = {}): Permissions => {
  return createPermissionSet(overrides)
}


