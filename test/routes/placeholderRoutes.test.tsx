import { render, screen } from '@testing-library/react'
import { describe, test } from 'vitest'

import { AnalyticsRouteComponent } from '../../src/routes/analytics/AnalyticsRoute'
import { AuditRouteComponent } from '../../src/routes/audit/AuditRoute'
import { LicensesRouteComponent } from '../../src/routes/licenses/LicensesRoute'
import { ProductsRouteComponent } from '../../src/routes/products/ProductsRoute'
import { TenantsRouteComponent } from '../../src/routes/tenants/TenantsRoute'
import { UsersRouteComponent } from '../../src/routes/users/UsersRoute'
import { HealthRouteComponent } from '../../src/routes/health/HealthRoute'
import { SectionPlaceholder } from '../../src/routes/common/SectionPlaceholder'
import {
  UI_PAGE_PLACEHOLDER_TITLE,
  UI_PAGE_TITLE_ANALYTICS,
  UI_PAGE_TITLE_AUDIT,
  UI_PAGE_TITLE_HEALTH,
  UI_PAGE_TITLE_LICENSES,
  UI_PAGE_TITLE_PRODUCTS,
  UI_PAGE_TITLE_TENANTS,
  UI_PAGE_TITLE_USERS,
} from '../../src/ui/constants'

type RouteCase = {
  label: string
  Component: () => JSX.Element
  title: string
}

const ROUTE_CASES: RouteCase[] = [
  { label: 'licenses', Component: LicensesRouteComponent, title: UI_PAGE_TITLE_LICENSES },
  { label: 'products', Component: ProductsRouteComponent, title: UI_PAGE_TITLE_PRODUCTS },
  { label: 'tenants', Component: TenantsRouteComponent, title: UI_PAGE_TITLE_TENANTS },
  { label: 'users', Component: UsersRouteComponent, title: UI_PAGE_TITLE_USERS },
  { label: 'analytics', Component: AnalyticsRouteComponent, title: UI_PAGE_TITLE_ANALYTICS },
  { label: 'health', Component: HealthRouteComponent, title: UI_PAGE_TITLE_HEALTH },
  { label: 'audit', Component: AuditRouteComponent, title: UI_PAGE_TITLE_AUDIT },
]

describe('placeholder routes', () => {
  ROUTE_CASES.forEach(({ label, Component, title }) => {
    test(`renders ${label} placeholder content`, () => {
      render(<Component />)
      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByText(UI_PAGE_PLACEHOLDER_TITLE)).toBeInTheDocument()
    })
  })

  test('SectionPlaceholder renders custom body', () => {
    const customBody = 'Custom placeholder body'
    render(<SectionPlaceholder title="Custom" subtitle="Subtitle" body={customBody} />)
    expect(screen.getByText('Custom')).toBeInTheDocument()
    expect(screen.getByText(customBody)).toBeInTheDocument()
  })
})

