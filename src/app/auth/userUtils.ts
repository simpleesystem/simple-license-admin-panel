import type { User } from '@/simpleLicense'

export const isSystemAdminUser = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  const role = user.role
  return role === 'SUPERUSER' || role === 'ADMIN'
}

export const isVendorScopedUser = (user: User | null): boolean => {
  if (!user) {
    return false
  }
  return !!user.vendorId
}

export const isApiUser = (user: User | null): boolean => {
  if (!user || !user.role) {
    return false
  }
  return user.role.startsWith('API_')
}
