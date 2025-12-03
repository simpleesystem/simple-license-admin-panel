import type { QueryClient } from '@tanstack/react-query'
import { createRouter, createRoute, createRootRouteWithContext, redirect } from '@tanstack/react-router'

import {
  ROUTE_PATH_AUTH,
  ROUTE_PATH_DASHBOARD,
  ROUTE_PATH_ROOT,
} from './constants'
import { AuthRouteComponent } from '../routes/auth/AuthRoute'
import { DashboardRouteComponent } from '../routes/dashboard/DashboardRoute'
import { NotFoundRouteComponent } from '../routes/notFound/NotFoundRoute'
import { RootRouteComponent } from '../routes/root/RootRoute'
import type { Permissions, PermissionKey } from './auth/permissions'

export type AuthStateSnapshot = {
  isAuthenticated: boolean
  permissions: Permissions
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

const routeTree = rootRoute.addChildren([dashboardRoute, dashboardIndexRoute, authRoute])

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

export const assertPermission = (
  context: RouterContext,
  location: RouterLocationLike,
  permission: PermissionKey,
) => {
  assertAuthenticated(context, location)
  if (!context.authState?.permissions[permission]) {
    throw redirect({ to: ROUTE_PATH_ROOT })
  }
}

