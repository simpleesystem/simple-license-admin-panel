import type { AdminRole, User } from '@simple-license/react-sdk'

export const PERMISSION_KEYS = [
  'viewDashboard',
  'manageLicenses',
  'manageProducts',
  'manageTenants',
  'manageUsers',
  'viewAnalytics',
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]

export type Permissions = Record<PermissionKey, boolean>

export const createPermissionSet = (overrides: Partial<Permissions> = {}): Permissions => ({
  viewDashboard: false,
  manageLicenses: false,
  manageProducts: false,
  manageTenants: false,
  manageUsers: false,
  viewAnalytics: false,
  ...overrides,
})

const ALL_PERMISSIONS = createPermissionSet(
  PERMISSION_KEYS.reduce<Partial<Permissions>>((acc, key) => {
    acc[key] = true
    return acc
  }, {}),
)

const ROLE_PERMISSION_MATRIX: Record<AdminRole, Permissions> = {
  SUPERUSER: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS,
  VENDOR_MANAGER: createPermissionSet({
    viewDashboard: true,
    manageLicenses: true,
    manageProducts: true,
    manageTenants: true,
    viewAnalytics: true,
  }),
  VENDOR_ADMIN: createPermissionSet({
    viewDashboard: true,
    manageLicenses: true,
    manageProducts: true,
    viewAnalytics: true,
  }),
  VIEWER: createPermissionSet({
    viewDashboard: true,
    viewAnalytics: true,
  }),
}

const DEFAULT_PERMISSIONS = createPermissionSet()

export const derivePermissionsFromUser = (user: Pick<User, 'role'> | null | undefined): Permissions => {
  if (!user?.role) {
    return { ...DEFAULT_PERMISSIONS }
  }
  const rolePermissions = ROLE_PERMISSION_MATRIX[user.role]
  if (!rolePermissions) {
    return { ...DEFAULT_PERMISSIONS }
  }
  return { ...rolePermissions }
}

export const hasPermission = (permissions: Permissions, permission: PermissionKey): boolean => {
  return Boolean(permissions[permission])
}

