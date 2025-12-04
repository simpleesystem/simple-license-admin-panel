import type { AdminRole, User } from '@simple-license/react-sdk'

const API_USER_ROLES: readonly AdminRole[] = ['API_READ_ONLY', 'API_VENDOR_WRITE', 'API_CONSUMER_ACTIVATE']

export const isApiUser = (user: User | null | undefined): boolean => {
  if (!user?.role) {
    return false
  }
  return API_USER_ROLES.includes(user.role)
}

export const isSystemAdminUser = (user: User | null | undefined): boolean => {
  if (!user?.role) {
    return false
  }
  return user.role === 'SUPERUSER' || user.role === 'ADMIN'
}

export const isVendorScopedUser = (user: User | null | undefined): boolean => {
  return Boolean(user?.vendorId)
}

