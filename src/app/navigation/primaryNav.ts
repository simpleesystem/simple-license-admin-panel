import type { User } from '@/simpleLicense'
import {
  UI_NAV_ID_ANALYTICS,
  UI_NAV_ID_AUDIT,
  UI_NAV_ID_DASHBOARD,
  UI_NAV_ID_HEALTH,
  UI_NAV_ID_LICENSES,
  UI_NAV_ID_PRODUCTS,
  UI_NAV_ID_TENANTS,
  UI_NAV_ID_USERS,
  UI_NAV_LABEL_ANALYTICS,
  UI_NAV_LABEL_AUDIT,
  UI_NAV_LABEL_DASHBOARD,
  UI_NAV_LABEL_HEALTH,
  UI_NAV_LABEL_LICENSES,
  UI_NAV_LABEL_PRODUCTS,
  UI_NAV_LABEL_TENANTS,
  UI_NAV_LABEL_USERS,
} from '../../ui/navigation/navConstants'
import type { PermissionKey, Permissions } from '../auth/permissions'
import { isSystemAdminUser, isVendorScopedUser } from '../auth/userUtils'
import {
  ROUTE_PATH_ANALYTICS,
  ROUTE_PATH_AUDIT,
  ROUTE_PATH_DASHBOARD,
  ROUTE_PATH_HEALTH,
  ROUTE_PATH_LICENSES,
  ROUTE_PATH_PRODUCTS,
  ROUTE_PATH_TENANTS,
  ROUTE_PATH_USERS,
} from '../constants'

type NavMatchStrategy = 'exact' | 'startsWith'

type NavDefinition = {
  id: string
  label: string
  href: string
  permission?: PermissionKey
  predicate?: (context: BuildPrimaryNavOptions) => boolean
  matchStrategy?: NavMatchStrategy
}

const NAV_DEFINITIONS: readonly NavDefinition[] = [
  {
    id: UI_NAV_ID_DASHBOARD,
    label: UI_NAV_LABEL_DASHBOARD,
    href: ROUTE_PATH_DASHBOARD,
    permission: 'viewDashboard',
    matchStrategy: 'startsWith',
  },
  {
    id: UI_NAV_ID_LICENSES,
    label: UI_NAV_LABEL_LICENSES,
    href: ROUTE_PATH_LICENSES,
    permission: 'manageLicenses',
    matchStrategy: 'startsWith',
  },
  {
    id: UI_NAV_ID_PRODUCTS,
    label: UI_NAV_LABEL_PRODUCTS,
    href: ROUTE_PATH_PRODUCTS,
    permission: 'manageProducts',
    matchStrategy: 'startsWith',
  },
  {
    id: UI_NAV_ID_TENANTS,
    label: UI_NAV_LABEL_TENANTS,
    href: ROUTE_PATH_TENANTS,
    predicate: (context) => context.permissions.manageTenants || isVendorScopedUser(context.currentUser),
    matchStrategy: 'startsWith',
  },
  {
    id: UI_NAV_ID_USERS,
    label: UI_NAV_LABEL_USERS,
    href: ROUTE_PATH_USERS,
    permission: 'manageUsers',
    matchStrategy: 'startsWith',
  },
  {
    id: UI_NAV_ID_ANALYTICS,
    label: UI_NAV_LABEL_ANALYTICS,
    href: ROUTE_PATH_ANALYTICS,
    permission: 'viewAnalytics',
    matchStrategy: 'startsWith',
  },
  {
    id: UI_NAV_ID_HEALTH,
    label: UI_NAV_LABEL_HEALTH,
    href: ROUTE_PATH_HEALTH,
    predicate: (context) => isSystemAdminUser(context.currentUser),
    matchStrategy: 'startsWith',
  },
  {
    id: UI_NAV_ID_AUDIT,
    label: UI_NAV_LABEL_AUDIT,
    href: ROUTE_PATH_AUDIT,
    predicate: (context) => isSystemAdminUser(context.currentUser),
    matchStrategy: 'startsWith',
  },
]

export type PrimaryNavItem = {
  id: string
  label: string
  href: string
  active: boolean
}

export type BuildPrimaryNavOptions = {
  permissions: Permissions
  currentUser: User | null
  currentPath: string
}

export const buildPrimaryNavigation = ({
  permissions,
  currentUser,
  currentPath,
}: BuildPrimaryNavOptions): PrimaryNavItem[] => {
  return NAV_DEFINITIONS.filter((definition) => {
    if (definition.permission && !permissions[definition.permission]) {
      return false
    }
    if (definition.predicate && !definition.predicate({ permissions, currentUser, currentPath })) {
      return false
    }
    return true
  }).map((definition) => ({
    id: definition.id,
    label: definition.label,
    href: definition.href,
    active: matchesPath(definition, currentPath),
  }))
}

const matchesPath = (definition: NavDefinition, currentPath: string): boolean => {
  const strategy = definition.matchStrategy ?? 'exact'
  if (strategy === 'startsWith') {
    return currentPath.startsWith(definition.href)
  }
  return currentPath === definition.href
}
