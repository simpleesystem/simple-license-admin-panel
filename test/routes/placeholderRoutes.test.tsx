import type { JSX } from 'react'
import { render, screen } from '@testing-library/react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { describe, test, beforeAll } from 'vitest'
import { renderWithProviders } from '../ui/utils'

import { AnalyticsRouteComponent } from '../../src/routes/analytics/AnalyticsRoute'
import { AuditRouteComponent } from '../../src/routes/audit/AuditRoute'
import { SectionPlaceholder } from '../../src/routes/common/SectionPlaceholder'
import { LicensesRouteComponent } from '../../src/routes/licenses/LicensesRoute'
import { ProductsRouteComponent } from '../../src/routes/products/ProductsRoute'
import { TenantsRouteComponent } from '../../src/routes/tenants/TenantsRoute'
import { UsersRouteComponent } from '../../src/routes/users/UsersRoute'
import {
  UI_PAGE_PLACEHOLDER_TITLE,
  UI_PAGE_TITLE_ANALYTICS,
  UI_PAGE_TITLE_AUDIT,
  UI_PAGE_TITLE_LICENSES,
  UI_PAGE_TITLE_PRODUCTS,
  UI_PAGE_TITLE_TENANTS,
  UI_PAGE_TITLE_USERS,
} from '../../src/ui/constants'
import { APP_DEFAULT_LANGUAGE, APP_I18N_DEFAULT_NAMESPACE } from '../../src/app/constants'
import { i18nResources } from '../../src/app/i18n/resources'


type RouteCase = {
  label: string
  Component: () => JSX.Element
  title: string
}

const ROUTE_CASES: RouteCase[] = [
  { label: 'analytics', Component: AnalyticsRouteComponent, title: UI_PAGE_TITLE_ANALYTICS },
  { label: 'audit', Component: AuditRouteComponent, title: UI_PAGE_TITLE_AUDIT },
]

describe('placeholder routes', () => {
  beforeAll(async () => {
    if (!i18n.isInitialized) {
      await i18n.use(initReactI18next).init({
        lng: APP_DEFAULT_LANGUAGE,
        fallbackLng: APP_DEFAULT_LANGUAGE,
        defaultNS: APP_I18N_DEFAULT_NAMESPACE,
        resources: {
          [APP_DEFAULT_LANGUAGE]: {
            [APP_I18N_DEFAULT_NAMESPACE]: i18nResources[APP_I18N_DEFAULT_NAMESPACE],
          },
        },
        interpolation: { escapeValue: false },
      })
    }
  })

  ROUTE_CASES.forEach(({ label, Component, title }) => {
    test(`renders ${label} placeholder content`, async () => {
      renderWithProviders(<Component />)
      expect(await screen.findByText(title)).toBeInTheDocument()
      expect(await screen.findByText(UI_PAGE_PLACEHOLDER_TITLE)).toBeInTheDocument()
    })
  })

  test('renders users route content', async () => {
    renderWithProviders(<UsersRouteComponent />)
    expect(await screen.findByText(UI_PAGE_TITLE_USERS)).toBeInTheDocument()
    expect(screen.queryByText(UI_PAGE_PLACEHOLDER_TITLE)).toBeNull()
  })

  test('renders tenants route content', async () => {
    renderWithProviders(<TenantsRouteComponent />)
    expect(await screen.findByText(UI_PAGE_TITLE_TENANTS)).toBeInTheDocument()
    expect(screen.queryByText(UI_PAGE_PLACEHOLDER_TITLE)).toBeNull()
  })

  test('renders products route content', async () => {
    renderWithProviders(<ProductsRouteComponent />)
    expect(await screen.findByText(UI_PAGE_TITLE_PRODUCTS)).toBeInTheDocument()
    expect(screen.queryByText(UI_PAGE_PLACEHOLDER_TITLE)).toBeNull()
  })

  test('renders licenses route content', async () => {
    renderWithProviders(<LicensesRouteComponent />)
    expect(await screen.findByText(UI_PAGE_TITLE_LICENSES)).toBeInTheDocument()
    expect(screen.queryByText(UI_PAGE_PLACEHOLDER_TITLE)).toBeNull()
  })

  test('renders products route content', async () => {
    renderWithProviders(<ProductsRouteComponent />)
    expect(await screen.findByText(UI_PAGE_TITLE_PRODUCTS)).toBeInTheDocument()
    expect(screen.queryByText(UI_PAGE_PLACEHOLDER_TITLE)).toBeNull()
  })

  test('SectionPlaceholder renders custom body', () => {
    const customBody = 'Custom placeholder body'
    render(<SectionPlaceholder title="Custom" subtitle="Subtitle" body={customBody} testMode />)
    expect(screen.getByText('Custom')).toBeInTheDocument()
    expect(screen.getByText(customBody)).toBeInTheDocument()
  })
})
