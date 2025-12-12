import type { AdminRole, User } from '@simple-license/react-sdk'
import {
  UI_USER_ROLE_ADMIN,
  UI_USER_ROLE_API_CONSUMER_ACTIVATE,
  UI_USER_ROLE_API_READ_ONLY,
  UI_USER_ROLE_API_VENDOR_WRITE,
  UI_USER_ROLE_SUPERUSER,
  UI_USER_ROLE_VENDOR_ADMIN,
  UI_USER_ROLE_VENDOR_MANAGER,
  UI_USER_ROLE_VIEWER,
} from '../../ui/constants'

export const PERMISSION_KEYS = [
  'viewDashboard',
  'manageLicenses',
  'manageProducts',
  'manageTenants',
  'manageUsers',
  'viewAnalytics',
  'changePassword',
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
  changePassword: false,
  ...overrides,
})

const ALL_PERMISSIONS = createPermissionSet(
  PERMISSION_KEYS.reduce<Partial<Permissions>>((acc, key) => {
    acc[key] = true
    return acc
  }, {})
)

const ROLE_PERMISSION_MATRIX: Record<AdminRole, Permissions> = {
  [UI_USER_ROLE_SUPERUSER]: ALL_PERMISSIONS,
  [UI_USER_ROLE_ADMIN]: ALL_PERMISSIONS,
  [UI_USER_ROLE_VENDOR_MANAGER]: createPermissionSet({
    viewDashboard: true,
    manageLicenses: true,
    manageProducts: true,
    manageTenants: true,
    manageUsers: true,
    viewAnalytics: true,
  }),
  [UI_USER_ROLE_VENDOR_ADMIN]: createPermissionSet({
    viewDashboard: true,
    manageLicenses: true,
    manageProducts: true,
    viewAnalytics: true,
  }),
  [UI_USER_ROLE_VIEWER]: createPermissionSet({
    viewDashboard: true,
    viewAnalytics: true,
  }),
  [UI_USER_ROLE_API_READ_ONLY]: createPermissionSet(),
  [UI_USER_ROLE_API_VENDOR_WRITE]: createPermissionSet(),
  [UI_USER_ROLE_API_CONSUMER_ACTIVATE]: createPermissionSet(),
}

const DEFAULT_PERMISSIONS = createPermissionSet()

export const derivePermissionsFromUser = (
  user: Pick<User, 'role' | 'passwordResetRequired' | 'vendorId'> | null | undefined
): Permissions => {
  if (user?.passwordResetRequired) {
    return createPermissionSet({ changePassword: true })
  }

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

export const isVendorScopedUser = (user: Pick<User, 'role' | 'vendorId'> | null | undefined): boolean => {
  if (!user) {
    return false
  }
  if (user.role === UI_USER_ROLE_SUPERUSER || user.role === UI_USER_ROLE_ADMIN) {
    return false
  }
  return Boolean(user.vendorId)
}

export const isTenantOwnedByUser = (
  user: Pick<User, 'vendorId'> | null | undefined,
  tenant: { vendorId?: string | null }
): boolean => {
  if (!user?.vendorId) {
    return false
  }
  return tenant.vendorId === user.vendorId
}

export const canCreateTenant = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return user?.role === UI_USER_ROLE_SUPERUSER || user?.role === UI_USER_ROLE_ADMIN
}

export const canDeleteTenant = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return canCreateTenant(user)
}

export const canUpdateTenant = (
  user: Pick<User, 'role' | 'vendorId'> | null | undefined,
  tenant: { vendorId?: string | null }
): boolean => {
  if (canCreateTenant(user)) {
    return true
  }
  if (!user) {
    return false
  }
  if (user.role === UI_USER_ROLE_VENDOR_MANAGER) {
    return isTenantOwnedByUser(user, tenant)
  }
  return false
}

export const canViewTenants = (user: Pick<User, 'role' | 'vendorId'> | null | undefined): boolean => {
  const permissions = derivePermissionsFromUser(user)
  if (hasPermission(permissions, 'manageTenants')) {
    return true
  }
  return isVendorScopedUser(user)
}

export const isProductOwnedByUser = (
  user: Pick<User, 'vendorId'> | null | undefined,
  product: { vendorId?: string | null }
): boolean => {
  if (!user?.vendorId) {
    return false
  }
  return product.vendorId === user.vendorId
}

export const canCreateProduct = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return user?.role === UI_USER_ROLE_SUPERUSER || user?.role === UI_USER_ROLE_ADMIN
}

export const canDeleteProduct = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return canCreateProduct(user)
}

export const canUpdateProduct = (
  user: Pick<User, 'role' | 'vendorId'> | null | undefined,
  product: { vendorId?: string | null }
): boolean => {
  if (canCreateProduct(user)) {
    return true
  }
  if (!user) {
    return false
  }
  if (user.role === UI_USER_ROLE_VENDOR_MANAGER) {
    return isProductOwnedByUser(user, product)
  }
  return false
}

export const canViewProducts = (user: Pick<User, 'role' | 'vendorId'> | null | undefined): boolean => {
  const permissions = derivePermissionsFromUser(user)
  if (hasPermission(permissions, 'manageProducts')) {
    return true
  }
  return isVendorScopedUser(user)
}

export const isProductTierOwnedByUser = (
  user: Pick<User, 'vendorId'> | null | undefined,
  tier: { vendorId?: string | null }
): boolean => {
  if (!user?.vendorId) {
    return false
  }
  return tier.vendorId === user.vendorId
}

export const canCreateProductTier = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return user?.role === UI_USER_ROLE_SUPERUSER || user?.role === UI_USER_ROLE_ADMIN
}

export const canDeleteProductTier = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return canCreateProductTier(user)
}

export const canUpdateProductTier = (
  user: Pick<User, 'role' | 'vendorId'> | null | undefined,
  tier: { vendorId?: string | null }
): boolean => {
  if (canCreateProductTier(user)) {
    return true
  }
  if (!user) {
    return false
  }
  if (user.role === UI_USER_ROLE_VENDOR_MANAGER) {
    return isProductTierOwnedByUser(user, tier)
  }
  return false
}

export const canViewProductTiers = (user: Pick<User, 'role' | 'vendorId'> | null | undefined): boolean => {
  const permissions = derivePermissionsFromUser(user)
  if (hasPermission(permissions, 'manageProducts')) {
    return true
  }
  return isVendorScopedUser(user)
}

export const isEntitlementOwnedByUser = (
  user: Pick<User, 'vendorId'> | null | undefined,
  entitlement: { vendorId?: string | null }
): boolean => {
  if (!user?.vendorId) {
    return false
  }
  return entitlement.vendorId === user.vendorId
}

export const isUserOwnedByUser = (
  user: Pick<User, 'vendorId'> | null | undefined,
  target: { vendorId?: string | null }
) => {
  if (!user?.vendorId) {
    return false
  }
  return target.vendorId === user.vendorId
}

export const canCreateUser = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return user?.role === UI_USER_ROLE_SUPERUSER || user?.role === UI_USER_ROLE_ADMIN
}

export const canUpdateUser = (
  user: Pick<User, 'role' | 'vendorId'> | null | undefined,
  target: { vendorId?: string | null }
) => {
  if (canCreateUser(user)) {
    return true
  }
  if (!user) {
    return false
  }
  if (user.role === UI_USER_ROLE_VENDOR_MANAGER) {
    return isUserOwnedByUser(user, target)
  }
  return false
}

export const canDeleteUser = (
  user: Pick<User, 'role' | 'vendorId'> | null | undefined,
  target: { vendorId?: string | null }
) => {
  return canUpdateUser(user, target)
}

export const canViewUsers = (user: Pick<User, 'role' | 'vendorId'> | null | undefined): boolean => {
  const permissions = derivePermissionsFromUser(user)
  if (hasPermission(permissions, 'manageUsers')) {
    return true
  }
  return isVendorScopedUser(user)
}

export const canCreateEntitlement = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return user?.role === UI_USER_ROLE_SUPERUSER || user?.role === UI_USER_ROLE_ADMIN
}

export const canDeleteEntitlement = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return canCreateEntitlement(user)
}

export const canUpdateEntitlement = (
  user: Pick<User, 'role' | 'vendorId'> | null | undefined,
  entitlement: { vendorId?: string | null }
): boolean => {
  if (canCreateEntitlement(user)) {
    return true
  }
  if (!user) {
    return false
  }
  if (user.role === UI_USER_ROLE_VENDOR_MANAGER) {
    return isEntitlementOwnedByUser(user, entitlement)
  }
  return false
}

export const canViewEntitlements = (user: Pick<User, 'role' | 'vendorId'> | null | undefined): boolean => {
  const permissions = derivePermissionsFromUser(user)
  if (hasPermission(permissions, 'manageProducts')) {
    return true
  }
  return isVendorScopedUser(user)
}

export const isLicenseOwnedByUser = (
  user: Pick<User, 'vendorId'> | null | undefined,
  license: { vendorId?: string | null }
): boolean => {
  if (!user?.vendorId) {
    return false
  }
  return license.vendorId === user.vendorId
}

export const canCreateLicense = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return user?.role === UI_USER_ROLE_SUPERUSER || user?.role === UI_USER_ROLE_ADMIN
}

export const canDeleteLicense = (user: Pick<User, 'role'> | null | undefined): boolean => {
  return canCreateLicense(user)
}

export const canUpdateLicense = (
  user: Pick<User, 'role' | 'vendorId'> | null | undefined,
  license: { vendorId?: string | null }
): boolean => {
  if (canCreateLicense(user)) {
    return true
  }
  if (!user) {
    return false
  }
  if (user.role === UI_USER_ROLE_VENDOR_MANAGER) {
    return isLicenseOwnedByUser(user, license)
  }
  return false
}

export const canViewLicenses = (user: Pick<User, 'role' | 'vendorId'> | null | undefined): boolean => {
  const permissions = derivePermissionsFromUser(user)
  if (hasPermission(permissions, 'manageLicenses')) {
    return true
  }
  return isVendorScopedUser(user)
}

export const isActivationOwnedByUser = (
  user: Pick<User, 'vendorId'> | null | undefined,
  activation: { vendorId?: string | null }
): boolean => {
  if (!user?.vendorId) {
    return false
  }
  return activation.vendorId === user.vendorId
}

export const canViewActivations = (user: Pick<User, 'role' | 'vendorId'> | null | undefined): boolean => {
  return canViewLicenses(user)
}
