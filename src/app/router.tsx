import type { AdminRole } from '@simple-license/react-sdk'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { AnalyticsRouteComponent } from '../routes/analytics/AnalyticsRoute'
import { AuditRouteComponent } from '../routes/audit/AuditRoute'
import { AuthRouteComponent } from '../routes/auth/AuthRoute'
import { ChangePasswordRouteComponent } from '../routes/auth/ChangePasswordRoute'
import { DashboardRouteComponent } from '../routes/dashboard/DashboardRoute'
import { HealthRouteComponent } from '../routes/health/HealthRoute'
import { LicensesRouteComponent } from '../routes/licenses/LicensesRoute'
import { NotFoundRouteComponent } from '../routes/notFound/NotFoundRoute'
import { ProductsRouteComponent } from '../routes/products/ProductsRoute'
import { RootRouteComponent } from '../routes/root/RootRoute'
import { TenantsRouteComponent } from '../routes/tenants/TenantsRoute'
import { UsersRouteComponent } from '../routes/users/UsersRoute'
import { derivePermissionsFromUser, type PermissionKey, type Permissions } from './auth/permissions'
import {
  ROUTE_PATH_ANALYTICS,
  ROUTE_PATH_AUDIT,
  ROUTE_PATH_AUTH,
  ROUTE_PATH_CHANGE_PASSWORD,
  ROUTE_PATH_DASHBOARD,
  ROUTE_PATH_HEALTH,
  ROUTE_PATH_LICENSES,
  ROUTE_PATH_PRODUCTS,
  ROUTE_PATH_ROOT,
  ROUTE_PATH_TENANTS,
  ROUTE_PATH_USERS,
  ROUTE_PATH_WILDCARD,
} from './constants'
import { createAppQueryClient } from './queryClient'

export type AuthStateSnapshot = {
  isAuthenticated: boolean
  permissions: Permissions
  currentUserRole?: AdminRole
  currentUserVendorId?: string | null
}

export type RouterContext = {
  queryClient: QueryClient
  authState?: AuthStateSnapshot
  firstAllowedRoute?: string
}

type RouterLocationLike = {
  href: string
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootRouteComponent,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_DASHBOARD,
  beforeLoad: ({ context, location }) => {
    assertPermission(context, location, 'viewDashboard')
  },
  component: DashboardRouteComponent,
})

const rootLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_ROOT,
  beforeLoad: ({ context, location }) => {
    assertPermission(context, location, 'viewDashboard')
    throw redirect({ to: ROUTE_PATH_DASHBOARD })
  },
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_AUTH,
  component: AuthRouteComponent,
})

const changePasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_CHANGE_PASSWORD,
  beforeLoad: ({ context, location }) => {
    assertAuthenticated(context, location)
    if (!context.authState?.permissions.changePassword) {
      throw redirect({ to: context.firstAllowedRoute ?? ROUTE_PATH_ROOT })
    }
  },
  component: ChangePasswordRouteComponent,
})

const licensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_LICENSES,
  beforeLoad: ({ context, location }) => {
    assertPermission(context, location, 'manageLicenses')
  },
  component: LicensesRouteComponent,
})

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_PRODUCTS,
  beforeLoad: ({ context, location }) => {
    assertPermission(context, location, 'manageProducts')
  },
  component: ProductsRouteComponent,
})

const tenantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_TENANTS,
  beforeLoad: ({ context, location }) => {
    assertTenantAccess(context, location)
  },
  component: TenantsRouteComponent,
})

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_USERS,
  beforeLoad: ({ context, location }) => {
    assertPermission(context, location, 'manageUsers')
  },
  component: UsersRouteComponent,
})

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_ANALYTICS,
  beforeLoad: ({ context, location }) => {
    assertPermission(context, location, 'viewAnalytics')
  },
  component: AnalyticsRouteComponent,
})

const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_HEALTH,
  beforeLoad: ({ context, location }) => {
    assertSystemAccess(context, location)
  },
  component: HealthRouteComponent,
})

const auditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_AUDIT,
  beforeLoad: ({ context, location }) => {
    assertSystemAccess(context, location)
  },
  component: AuditRouteComponent,
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_WILDCARD,
  component: NotFoundRouteComponent,
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  rootLandingRoute,
  authRoute,
  changePasswordRoute,
  licensesRoute,
  productsRoute,
  tenantsRoute,
  usersRoute,
  analyticsRoute,
  healthRoute,
  auditRoute,
  notFoundRoute,
])

export const createDefaultAuthState = (): AuthStateSnapshot => ({
  isAuthenticated: false,
  permissions: derivePermissionsFromUser(null),
  currentUserRole: undefined,
  currentUserVendorId: null,
})

export const createRouterContext = (overrides?: Partial<RouterContext>): RouterContext => ({
  queryClient: createAppQueryClient(),
  authState: createDefaultAuthState(),
  firstAllowedRoute: ROUTE_PATH_AUTH,
  ...overrides,
})

export const router = createRouter({
  routeTree,
  context: createRouterContext(),
  defaultNotFoundComponent: NotFoundRouteComponent,
})

export type AppRouter = typeof router

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter
  }
}

const resolveRedirectTarget = (location: RouterLocationLike): string => {
  const target = location.href
  if (typeof target === 'string' && target.trim().length > 0) {
    return target
  }
  return ROUTE_PATH_ROOT
}

export const assertAuthenticated = (context: RouterContext, location: RouterLocationLike) => {
  if (!context.authState?.isAuthenticated) {
    throw redirect({
      to: ROUTE_PATH_AUTH,
      search: {
        redirect: resolveRedirectTarget(location),
      },
    })
  }
}

export const assertPermission = (context: RouterContext, location: RouterLocationLike, permission: PermissionKey) => {
  assertAuthenticated(context, location)
  if (!context.authState?.permissions[permission]) {
    throw redirect({ to: context.firstAllowedRoute ?? ROUTE_PATH_ROOT })
  }
}

export const assertSystemAccess = (context: RouterContext, location: RouterLocationLike) => {
  assertAuthenticated(context, location)
  const role = context.authState?.currentUserRole
  if (role !== 'SUPERUSER' && role !== 'ADMIN') {
    throw redirect({ to: context.firstAllowedRoute ?? ROUTE_PATH_ROOT })
  }
}

export const assertTenantAccess = (context: RouterContext, location: RouterLocationLike) => {
  assertAuthenticated(context, location)
  const canManageTenants = context.authState?.permissions.manageTenants
  const hasVendorScope = Boolean(context.authState?.currentUserVendorId)
  if (!canManageTenants && !hasVendorScope) {
    throw redirect({ to: context.firstAllowedRoute ?? ROUTE_PATH_ROOT })
  }
}

export const computeFirstAllowedRoute = (authState: AuthStateSnapshot | undefined): string => {
  if (!authState?.isAuthenticated) {
    return ROUTE_PATH_AUTH
  }
  if (authState.permissions.changePassword) {
    return ROUTE_PATH_CHANGE_PASSWORD
  }
  if (authState.permissions.viewDashboard) {
    return ROUTE_PATH_DASHBOARD
  }
  if (authState.permissions.manageLicenses) {
    return ROUTE_PATH_LICENSES
  }
  if (authState.permissions.manageProducts) {
    return ROUTE_PATH_PRODUCTS
  }
  if (authState.permissions.manageTenants) {
    return ROUTE_PATH_TENANTS
  }
  if (authState.permissions.manageUsers) {
    return ROUTE_PATH_USERS
  }
  if (authState.permissions.viewAnalytics) {
    return ROUTE_PATH_ANALYTICS
  }
  return ROUTE_PATH_ROOT
}
