import type { AdminRole } from '@simple-license/react-sdk'
import { describe, expect, it } from 'vitest'

import { derivePermissionsFromUser, hasPermission, PERMISSION_KEYS, type Permissions } from '../../../src/app/auth/permissions'

const createUser = (role: AdminRole) =>
  ({
    role,
  }) as { role: AdminRole }

describe('derivePermissionsFromUser', () => {
  it('returns all permissions disabled for anonymous users', () => {
    const permissions = derivePermissionsFromUser(null)
    PERMISSION_KEYS.forEach((key) => {
      expect(permissions[key]).toBe(false)
    })
  })

  it('grants all permissions to privileged roles', () => {
    const superuserPermissions = derivePermissionsFromUser(createUser('SUPERUSER'))
    const adminPermissions = derivePermissionsFromUser(createUser('ADMIN'))

    PERMISSION_KEYS.forEach((key) => {
      expect(superuserPermissions[key]).toBe(true)
      expect(adminPermissions[key]).toBe(true)
    })
  })

  it('grants scoped permissions to vendor roles', () => {
    const managerPermissions = derivePermissionsFromUser(createUser('VENDOR_MANAGER'))
    expect(managerPermissions.viewDashboard).toBe(true)
    expect(managerPermissions.manageUsers).toBe(true)
    expect(managerPermissions.manageTenants).toBe(true)

    const adminPermissions = derivePermissionsFromUser(createUser('VENDOR_ADMIN'))
    expect(adminPermissions.manageLicenses).toBe(true)
    expect(adminPermissions.manageTenants).toBe(false)
  })

  it('only allows read-only access for viewer role', () => {
    const viewerPermissions = derivePermissionsFromUser(createUser('VIEWER'))
    expect(viewerPermissions.viewDashboard).toBe(true)
    expect(viewerPermissions.viewAnalytics).toBe(true)
    expect(viewerPermissions.manageLicenses).toBe(false)
  })
  it('limits permissions to changePassword when reset required', () => {
    const permissions = derivePermissionsFromUser({ role: 'ADMIN', passwordResetRequired: true })
    expect(permissions.changePassword).toBe(true)
    expect(permissions.viewDashboard).toBe(false)
    expect(permissions.manageUsers).toBe(false)
  })
})

describe('hasPermission', () => {
  it('checks individual permission flags', () => {
    const permissions: Permissions = {
      viewDashboard: true,
      manageLicenses: false,
      manageProducts: false,
      manageTenants: false,
      manageUsers: false,
      viewAnalytics: true,
      changePassword: false,
    }

    expect(hasPermission(permissions, 'viewDashboard')).toBe(true)
    expect(hasPermission(permissions, 'manageLicenses')).toBe(false)
  })
})

