import { describe, expect, test } from 'vitest'

import { ROUTE_PATH_LICENSES, ROUTE_PATH_PRODUCTS, ROUTE_PATH_TENANTS } from '@/app/constants'
import {
  buildEntityLinkTarget,
  ENTITY_LINK_KIND_LICENSES_FOR_CUSTOMER,
  ENTITY_LINK_KIND_LICENSES_FOR_PRODUCT,
  ENTITY_LINK_KIND_PRODUCT,
  ENTITY_LINK_KIND_TENANT,
} from '@/app/navigation/entityLinks'
import {
  UI_ENTITY_LINK_LABEL_VIEW_LICENSES,
  UI_ENTITY_LINK_LABEL_VIEW_PRODUCT,
  UI_ENTITY_LINK_LABEL_VIEW_TENANT,
} from '@/ui/constants'

describe('buildEntityLinkTarget', () => {
  test('routes a product link to the products page filtered by slug', () => {
    const target = buildEntityLinkTarget(ENTITY_LINK_KIND_PRODUCT, 'acme-pro')

    expect(target).toEqual({
      to: ROUTE_PATH_PRODUCTS,
      searchTerm: 'acme-pro',
      title: UI_ENTITY_LINK_LABEL_VIEW_PRODUCT,
    })
  })

  test('routes a product-licenses link to the licenses page filtered by slug', () => {
    const target = buildEntityLinkTarget(ENTITY_LINK_KIND_LICENSES_FOR_PRODUCT, 'acme-pro')

    expect(target).toEqual({
      to: ROUTE_PATH_LICENSES,
      searchTerm: 'acme-pro',
      title: UI_ENTITY_LINK_LABEL_VIEW_LICENSES,
    })
  })

  test('routes a customer-licenses link to the licenses page filtered by email', () => {
    const target = buildEntityLinkTarget(ENTITY_LINK_KIND_LICENSES_FOR_CUSTOMER, 'jane@example.com')

    expect(target.to).toBe(ROUTE_PATH_LICENSES)
    expect(target.searchTerm).toBe('jane@example.com')
    expect(target.title).toBe(UI_ENTITY_LINK_LABEL_VIEW_LICENSES)
  })

  test('routes a tenant link to the tenants page filtered by tenant', () => {
    const target = buildEntityLinkTarget(ENTITY_LINK_KIND_TENANT, 'vendor-1')

    expect(target).toEqual({
      to: ROUTE_PATH_TENANTS,
      searchTerm: 'vendor-1',
      title: UI_ENTITY_LINK_LABEL_VIEW_TENANT,
    })
  })

  test('trims surrounding whitespace from the search term', () => {
    const target = buildEntityLinkTarget(ENTITY_LINK_KIND_PRODUCT, '  spaced-slug  ')

    expect(target.searchTerm).toBe('spaced-slug')
  })
})
