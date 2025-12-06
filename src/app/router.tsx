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
import type { PermissionKey, Permissions } from './auth/permissions'
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

export type AuthStateSnapshot = {
  isAuthenticated: boolean
  permissions: Permissions
  currentUserRole?: AdminRole
  currentUserVendorId?: string | null
}

export type RouterContext = {
  queryClient: QueryClient
  authState?: AuthStateSnapshot
}

type RouterLocationLike = {
  href: string
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootRouteComponent,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_ROOT,
  beforeLoad: ({ context, location }) => {
    assertPermission(context, location, 'viewDashboard')
  },
  component: DashboardRouteComponent,
})

const dashboardIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATH_DASHBOARD,
  beforeLoad: ({ context, location }) => {
    assertPermission(context, location, 'viewDashboard')
  },
  component: DashboardRouteComponent,
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
  dashboardIndexRoute,
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

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined as unknown as QueryClient,
  },
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
    throw redirect({ to: ROUTE_PATH_ROOT })
  }
}

export const assertSystemAccess = (context: RouterContext, location: RouterLocationLike) => {
  assertAuthenticated(context, location)
  const role = context.authState?.currentUserRole
  if (role !== 'SUPERUSER' && role !== 'ADMIN') {
    throw redirect({ to: ROUTE_PATH_ROOT })
  }
}

export const assertTenantAccess = (context: RouterContext, location: RouterLocationLike) => {
  assertAuthenticated(context, location)
  const canManageTenants = context.authState?.permissions.manageTenants
  const hasVendorScope = Boolean(context.authState?.currentUserVendorId)
  if (!canManageTenants && !hasVendorScope) {
    throw redirect({ to: ROUTE_PATH_ROOT })
  }
}
