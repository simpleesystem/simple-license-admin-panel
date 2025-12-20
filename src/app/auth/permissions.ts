import type { License, LicenseActivation, Product, Tenant, User } from '@simple-license/react-sdk'
import { isSystemAdminUser, isVendorScopedUser } from './userUtils'

export type PermissionKey =
  | 'viewDashboard'
  | 'manageLicenses'
  | 'manageProducts'
  | 'manageTenants'
  | 'manageUsers'
  | 'viewAnalytics'
  | 'changePassword'

export const PERMISSION_KEYS: PermissionKey[] = [
  'viewDashboard',
  'manageLicenses',
  'manageProducts',
  'manageTenants',
  'manageUsers',
  'viewAnalytics',
  'changePassword',
]

export type Permissions = Record<PermissionKey, boolean>

export function derivePermissionsFromUser(user: User | null): Permissions {
  if (!user) {
    return {
      viewDashboard: false,
      manageLicenses: false,
      manageProducts: false,
      manageTenants: false,
      manageUsers: false,
      viewAnalytics: false,
      changePassword: false,
    }
  }

  const role = user.role
  const isSuperUser = role === 'SUPERUSER'
  const isAdmin = role === 'ADMIN'
  const isSupport = role === 'SUPPORT'
  const isVendorManager = role === 'VENDOR_MANAGER'
  const isVendorAdmin = role === 'VENDOR_ADMIN'

  return {
    viewDashboard: true,
    manageLicenses: isSuperUser || isAdmin || isSupport || isVendorManager || isVendorAdmin,
    manageProducts: isSuperUser || isAdmin || isVendorManager || isVendorAdmin,
    manageTenants: isSuperUser || isAdmin,
    manageUsers: isSuperUser || isAdmin || isVendorManager,
    viewAnalytics: isSuperUser || isAdmin || isSupport || isVendorManager || isVendorAdmin,
    changePassword: user.passwordResetRequired ?? false,
  }
}

// Re-export user utils for convenience/compatibility
export { isVendorScopedUser }

// Permission Helpers

export const hasPermission = (permissions: Permissions, key: PermissionKey): boolean => {
  return permissions[key]
}

export const canViewLicenses = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageLicenses
}

export const canViewProducts = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageProducts
}

export const canViewTenants = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageTenants
}

export const canViewUsers = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageUsers
}

export const canViewActivations = (user: User | null): boolean => {
  return canViewLicenses(user)
}

// Resource Actions

export const canSuspendTenant = (user: User | null): boolean => {
  return isSystemAdminUser(user)
}

export const canUpdateTenant = (user: User | null, tenant?: Tenant): boolean => {
  if (!user) {
    return false
  }
  if (isSystemAdminUser(user)) {
    return true
  }
  if (tenant && isVendorScopedUser(user)) {
    return user.vendorId === tenant.vendorId
  }
  return false
}

export const canCreateUser = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageUsers
}

export const canDeleteUser = (user: User | null, targetUser?: User): boolean => {
  if (!user) {
    return false
  }
  if (isSystemAdminUser(user)) {
    return true
  }
  // Vendors can delete their own users? Assuming yes for now if scoped
  if (targetUser && isVendorScopedUser(user)) {
    return user.vendorId === targetUser.vendorId
  }
  return false
}

export const canUpdateUser = (user: User | null, targetUser?: User): boolean => {
  if (!user) {
    return false
  }
  // Users can update themselves (profile) - handled separately usually, but for admin actions:
  if (isSystemAdminUser(user)) {
    return true
  }
  if (targetUser && isVendorScopedUser(user)) {
    return user.vendorId === targetUser.vendorId
  }
  return false
}

export const canCreateLicense = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageLicenses
}

export const canDeleteLicense = (user: User | null, license?: License): boolean => {
  if (!user) {
    return false
  }
  if (isSystemAdminUser(user)) {
    return true
  }
  if (license && isVendorScopedUser(user)) {
    // Assuming license doesn't have direct vendorId but product does, or we check customer?
    // Using simple ownership check for now
    return false // Only admins delete licenses for now unless we look up product ownership
  }
  return false
}

export const canUpdateLicense = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  return canViewLicenses(user) // simplified
}

export const canCreateProduct = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageProducts
}

export const canDeleteEntitlement = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageProducts
}

export const canUpdateEntitlement = (user: User | null, entitlement?: unknown): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  if (!perms.manageProducts) {
    return false
  }

  // Vendor scoping check
  if (entitlement && isVendorScopedUser(user)) {
    // If entitlement has vendorId (not all list items do, but fetched ones might)
    // Or we rely on product ownership which should be checked before this
    // For now, consistent with create:
    return true
  }
  return perms.manageProducts
}

export const canCreateEntitlement = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageProducts
}

export const canDeleteProductTier = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageProducts
}

export const canUpdateProductTier = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  if (!perms.manageProducts) {
    return false
  }
  return true
}

export const canCreateProductTier = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageProducts
}

export const canDeleteProduct = (user: User | null): boolean => {
  return canViewProducts(user)
}

export const canUpdateProduct = (user: User | null): boolean => {
  return canViewProducts(user)
}

export const canCreateTenant = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const perms = derivePermissionsFromUser(user)
  return perms.manageTenants
}

// Ownership Checks

export const isLicenseOwnedByUser = (user: User | null, license: License | null): boolean => {
  if (!user || !license) {
    return false
  }
  if (isSystemAdminUser(user)) {
    return true
  }
  if (user.vendorId) {
    // This is tricky without product vendor lookup, but assuming safe default
    return false
  }
  return false
}

export const isProductOwnedByUser = (user: User | null, product: Product | null): boolean => {
  if (!user || !product) {
    return false
  }
  if (isSystemAdminUser(user)) {
    return true
  }
  if (user.vendorId && product.vendorId) {
    return user.vendorId === product.vendorId
  }
  return false
}

export const isTenantOwnedByUser = (user: User | null, tenant: Tenant | null): boolean => {
  if (!user || !tenant) {
    return false
  }
  if (isSystemAdminUser(user)) {
    return true
  }
  if (user.vendorId && tenant.vendorId) {
    return user.vendorId === tenant.vendorId
  }
  return false
}

export const isActivationOwnedByUser = (user: User | null, activation: LicenseActivation | null): boolean => {
  if (!user || !activation) {
    return false
  }
  if (isSystemAdminUser(user)) {
    return true
  }
  if (user.vendorId && activation.vendorId) {
    return user.vendorId === activation.vendorId
  }
  return false
}

// These were referenced in UI components but missing from exports
export const canViewEntitlements = canViewProducts
export const isEntitlementOwnedByUser = isProductOwnedByUser
export const canViewProductTiers = canViewProducts
export const isProductTierOwnedByUser = isProductOwnedByUser
