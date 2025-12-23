import type { LicenseStatus } from '@/simpleLicense'
import {
  API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION,
  API_ENDPOINT_ADMIN_ANALYTICS_LICENSE,
  API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS,
  API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES,
  API_ENDPOINT_ADMIN_ANALYTICS_TRENDS,
  API_ENDPOINT_ADMIN_ANALYTICS_USAGE,
  API_ENDPOINT_ADMIN_AUDIT_LOGS,
  API_ENDPOINT_ADMIN_AUDIT_VERIFY,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_CREATE,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_DELETE,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_UPDATE,
  API_ENDPOINT_ADMIN_HEALTH,
  API_ENDPOINT_ADMIN_LICENSES_ACTIVATIONS,
  API_ENDPOINT_ADMIN_LICENSES_CREATE,
  API_ENDPOINT_ADMIN_LICENSES_FREEZE,
  API_ENDPOINT_ADMIN_LICENSES_GET,
  API_ENDPOINT_ADMIN_LICENSES_LIST,
  API_ENDPOINT_ADMIN_LICENSES_RESUME,
  API_ENDPOINT_ADMIN_LICENSES_REVOKE,
  API_ENDPOINT_ADMIN_LICENSES_SUSPEND,
  API_ENDPOINT_ADMIN_LICENSES_UPDATE,
  API_ENDPOINT_ADMIN_METRICS,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_CREATE,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_DELETE,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_UPDATE,
  API_ENDPOINT_ADMIN_PRODUCTS_CREATE,
  API_ENDPOINT_ADMIN_PRODUCTS_DELETE,
  API_ENDPOINT_ADMIN_PRODUCTS_LIST,
  API_ENDPOINT_ADMIN_PRODUCTS_RESUME,
  API_ENDPOINT_ADMIN_PRODUCTS_SUSPEND,
  API_ENDPOINT_ADMIN_PRODUCTS_UPDATE,
  API_ENDPOINT_ADMIN_STATS,
  API_ENDPOINT_ADMIN_STATUS,
  API_ENDPOINT_ADMIN_TENANTS_CREATE,
  API_ENDPOINT_ADMIN_TENANTS_LIST,
  API_ENDPOINT_ADMIN_TENANTS_RESUME,
  API_ENDPOINT_ADMIN_TENANTS_SUSPEND,
  API_ENDPOINT_ADMIN_TENANTS_UPDATE,
  API_ENDPOINT_ADMIN_USERS_CREATE,
  API_ENDPOINT_ADMIN_USERS_DELETE,
  API_ENDPOINT_ADMIN_USERS_LIST,
  API_ENDPOINT_ADMIN_USERS_ME,
  API_ENDPOINT_ADMIN_USERS_UPDATE,
  API_ENDPOINT_AUTH_LOGIN,
} from '@/simpleLicense'
import { HttpResponse, http } from 'msw'

import { AUTH_FIELD_USERNAME } from '../../src/app/constants'
import { buildEntitlement } from '../factories/entitlementFactory'
import { buildLicense } from '../factories/licenseFactory'
import { buildProduct } from '../factories/productFactory'
import { buildProductTier } from '../factories/productTierFactory'
import { buildTenant } from '../factories/tenantFactory'
import { buildUser } from '../factories/userFactory'

const MSW_FAKE_TOKEN = 'test-token' as const
const MSW_LOGIN_EXPIRATION_SECONDS = 3_600 as const

type MswLicenseRecord = {
  id: string
  status?: string
  customerEmail?: string
  productSlug?: string
  tierCode?: string
  vendorId?: string | null
  [key: string]: unknown
}

type MswEntitlementRecord = {
  id: string
  productId?: string
  key?: string
  value_type?: string
  default_value?: unknown
  usage_limit?: number | null
  vendorId?: string | null
  [key: string]: unknown
}

const toLicenseRecord = (license: ReturnType<typeof buildLicense>): MswLicenseRecord => ({
  id: license.id,
  status: license.status,
  customerEmail:
    (license as { customerEmail?: string }).customerEmail ?? (license as { customer_email?: string }).customer_email,
  productSlug: (license as { productSlug?: string }).productSlug ?? (license as { product_slug?: string }).product_slug,
  tierCode: (license as { tierCode?: string }).tierCode ?? (license as { tier_code?: string }).tier_code,
  vendorId: (license as { vendorId?: string | null }).vendorId ?? null,
})

const toEntitlementRecord = (entitlement: ReturnType<typeof buildEntitlement>): MswEntitlementRecord => ({
  id: entitlement.id,
  productId: (entitlement as { productId?: string }).productId,
  key: (entitlement as { key?: string }).key,
  value_type: (entitlement as { value_type?: string }).value_type,
  default_value: (entitlement as { default_value?: unknown }).default_value,
  usage_limit: (entitlement as { usage_limit?: number | null }).usage_limit,
  vendorId: (entitlement as { vendorId?: string | null }).vendorId ?? null,
})

let adminUsers: ReturnType<typeof buildUser>[] = [buildUser()]
let adminTenants: ReturnType<typeof buildTenant>[] = [buildTenant()]
let adminProducts: ReturnType<typeof buildProduct>[] = [buildProduct()]
let adminProductTiers: ReturnType<typeof buildProductTier>[] = [buildProductTier()]
let adminEntitlements: MswEntitlementRecord[] = [toEntitlementRecord(buildEntitlement())]
let adminLicenses: MswLicenseRecord[] = [toLicenseRecord(buildLicense())]
let adminActivations: Array<{
  id: string
  licenseKey: string
  domain: string
  siteName?: string | null
  status: string
  activatedAt: string
  lastSeenAt?: string | null
  ipAddress?: string | null
  region?: string | null
  clientVersion?: string | null
  vendorId?: string | null
}> = [
  {
    id: 'activation-1',
    licenseKey: 'LICENSE-1',
    domain: 'example.com',
    siteName: 'site',
    status: 'ACTIVE',
    activatedAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    ipAddress: '127.0.0.1',
    region: 'us-east-1',
    clientVersion: '1.0.0',
    vendorId: null,
  },
]

export const resetMswAdminUsers = (users: ReturnType<typeof buildUser>[] = [buildUser()]) => {
  adminUsers = users
}

export const resetMswAdminTenants = (tenants: ReturnType<typeof buildTenant>[] = [buildTenant()]) => {
  adminTenants = tenants
}

export const resetMswAdminProducts = (products: ReturnType<typeof buildProduct>[] = [buildProduct()]) => {
  adminProducts = products
}

export const resetMswAdminProductTiers = (tiers: ReturnType<typeof buildProductTier>[] = [buildProductTier()]) => {
  adminProductTiers = tiers
}

export const resetMswEntitlements = (
  entitlements: MswEntitlementRecord[] = [toEntitlementRecord(buildEntitlement())]
) => {
  adminEntitlements = entitlements
}

export const resetMswLicenses = (licenses: MswLicenseRecord[] = [toLicenseRecord(buildLicense())]) => {
  adminLicenses = licenses
}

export const resetMswActivations = (activations: typeof adminActivations = []) => {
  adminActivations = activations
}

const toId = (value: unknown): string => {
  if (Array.isArray(value)) {
    return (value[0] as string | undefined) ?? ''
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

export const handlers = [
  http.post(API_ENDPOINT_AUTH_LOGIN, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    const username = body[AUTH_FIELD_USERNAME]

    return HttpResponse.json(
      {
        token: MSW_FAKE_TOKEN,
        token_type: 'Bearer',
        expires_in: MSW_LOGIN_EXPIRATION_SECONDS,
        user: buildUser({ username }),
      },
      { status: 200 }
    )
  }),
  http.get(API_ENDPOINT_ADMIN_TENANTS_LIST, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          data: adminTenants,
          pagination: {
            page: 1,
            limit: adminTenants.length,
            total: adminTenants.length,
            totalPages: 1,
          },
        },
      },
      { status: 200 }
    )
  }),
  http.options(API_ENDPOINT_ADMIN_TENANTS_LIST, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(API_ENDPOINT_ADMIN_TENANTS_CREATE, async ({ request }) => {
    const body = (await request.json()) as Partial<ReturnType<typeof buildTenant>>
    const newTenant = buildTenant({
      name: body.name,
      vendorId: body.vendorId,
      status: body.status,
    })
    adminTenants = [...adminTenants, newTenant]
    return HttpResponse.json({ success: true, data: { tenant: newTenant } }, { status: 201 })
  }),
  http.options(API_ENDPOINT_ADMIN_TENANTS_CREATE, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.put(`${API_ENDPOINT_ADMIN_TENANTS_UPDATE}/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<ReturnType<typeof buildTenant>>
    const id = toId(params.id)
    adminTenants = adminTenants.map((tenant) => {
      if (tenant.id === id) {
        return {
          ...tenant,
          name: body.name ?? tenant.name,
          vendorId: body.vendorId ?? tenant.vendorId,
          status: body.status ?? tenant.status,
        }
      }
      return tenant
    })
    const updated = adminTenants.find((tenant) => tenant.id === id) ?? buildTenant()
    return HttpResponse.json({ success: true, data: { tenant: updated } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_TENANTS_UPDATE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_TENANTS_SUSPEND}/:id/suspend`, ({ params }) => {
    const id = toId(params.id)
    adminTenants = adminTenants.map((tenant) => (tenant.id === id ? { ...tenant, status: 'SUSPENDED' } : tenant))
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_TENANTS_SUSPEND}/:id/suspend`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_TENANTS_RESUME}/:id/resume`, ({ params }) => {
    const id = toId(params.id)
    adminTenants = adminTenants.map((tenant) => (tenant.id === id ? { ...tenant, status: 'ACTIVE' } : tenant))
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_TENANTS_RESUME}/:id/resume`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(API_ENDPOINT_ADMIN_PRODUCTS_LIST, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          data: adminProducts,
          pagination: {
            page: 1,
            limit: adminProducts.length,
            total: adminProducts.length,
            totalPages: 1,
          },
        },
      },
      { status: 200 }
    )
  }),
  http.options(API_ENDPOINT_ADMIN_PRODUCTS_LIST, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(API_ENDPOINT_ADMIN_PRODUCTS_CREATE, async ({ request }) => {
    const body = (await request.json()) as Partial<ReturnType<typeof buildProduct>>
    const newProduct = buildProduct({
      name: body.name,
      slug: body.slug,
      description: body.description,
      vendorId: body.vendorId,
      isActive: body.isActive ?? true,
    })
    adminProducts = [...adminProducts, newProduct]
    return HttpResponse.json({ success: true, data: { product: newProduct } }, { status: 201 })
  }),
  http.options(API_ENDPOINT_ADMIN_PRODUCTS_CREATE, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.put(`${API_ENDPOINT_ADMIN_PRODUCTS_UPDATE}/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<ReturnType<typeof buildProduct>>
    const id = toId(params.id)
    adminProducts = adminProducts.map((product) => {
      if (product.id === id) {
        return {
          ...product,
          name: body.name ?? product.name,
          slug: body.slug ?? product.slug,
          description: body.description ?? product.description,
          vendorId: body.vendorId ?? product.vendorId,
        }
      }
      return product
    })
    const updated = adminProducts.find((product) => product.id === id) ?? buildProduct()
    return HttpResponse.json({ success: true, data: { product: updated } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_PRODUCTS_UPDATE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.delete(`${API_ENDPOINT_ADMIN_PRODUCTS_DELETE}/:id`, ({ params }) => {
    const id = toId(params.id)
    adminProducts = adminProducts.filter((product) => product.id !== id)
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_PRODUCTS_DELETE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_PRODUCTS_SUSPEND}/:id/suspend`, ({ params }) => {
    const id = toId(params.id)
    adminProducts = adminProducts.map((product) =>
      product.id === id ? { ...product, isActive: false, suspendedAt: new Date().toISOString() } : product
    )
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_PRODUCTS_SUSPEND}/:id/suspend`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_PRODUCTS_RESUME}/:id/resume`, ({ params }) => {
    const id = toId(params.id)
    adminProducts = adminProducts.map((product) =>
      product.id === id ? { ...product, isActive: true, suspendedAt: null } : product
    )
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_PRODUCTS_RESUME}/:id/resume`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(`${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/:productId/tiers`, ({ params }) => {
    const productId = toId(params.productId)
    const tiers = adminProductTiers.filter((tier) => tier.productId === productId)
    return HttpResponse.json(
      {
        success: true,
        data: {
          data: tiers,
          pagination: {
            page: 1,
            limit: tiers.length,
            total: tiers.length,
            totalPages: 1,
          },
        },
      },
      { status: 200 }
    )
  }),
  http.options(`${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/:productId/tiers`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/:productId/tiers`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<ReturnType<typeof buildProductTier>>
    const productId = toId(params.productId)
    const newTier = buildProductTier({
      productId,
      tierCode: body.tierCode,
      tierName: body.tierName,
    })
    adminProductTiers = [...adminProductTiers, newTier]
    return HttpResponse.json({ success: true, data: { tier: newTier } }, { status: 201 })
  }),
  http.options(API_ENDPOINT_ADMIN_PRODUCT_TIERS_CREATE, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.put(`${API_ENDPOINT_ADMIN_PRODUCT_TIERS_UPDATE}/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<ReturnType<typeof buildProductTier>>
    const id = toId(params.id)
    adminProductTiers = adminProductTiers.map((tier) => {
      if (tier.id === id) {
        return {
          ...tier,
          tierCode: body.tierCode ?? tier.tierCode,
          tierName: body.tierName ?? tier.tierName,
        }
      }
      return tier
    })
    const updated = adminProductTiers.find((tier) => tier.id === id) ?? buildProductTier()
    return HttpResponse.json({ success: true, data: { tier: updated } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_PRODUCT_TIERS_UPDATE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.delete(`${API_ENDPOINT_ADMIN_PRODUCT_TIERS_DELETE}/:id`, ({ params }) => {
    const id = toId(params.id)
    adminProductTiers = adminProductTiers.filter((tier) => tier.id !== id)
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_PRODUCT_TIERS_DELETE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(`${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/:productId/entitlements`, ({ params }) => {
    const productId = toId(params.productId)
    const entitlements = adminEntitlements.filter(
      (entitlement) => (entitlement as { productId?: string }).productId === productId
    )
    return HttpResponse.json(
      {
        success: true,
        data: {
          data: entitlements,
          pagination: {
            page: 1,
            limit: entitlements.length,
            total: entitlements.length,
            totalPages: 1,
          },
        },
      },
      { status: 200 }
    )
  }),
  http.options(`${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/:productId/entitlements`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/:productId/entitlements`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const productId = toId(params.productId)
    const newEntitlement = toEntitlementRecord(
      buildEntitlement({
        productId,
        key: body.key as string | undefined,
        value_type: (body.value_type as 'string' | 'number' | 'boolean' | undefined) ?? undefined,
        default_value: body.default_value as string | number | boolean | undefined,
        usage_limit: (body.usage_limit as number | null | undefined) ?? undefined,
        vendorId: (body.vendorId ?? (body as { vendor_id?: string | null }).vendor_id) as string | null | undefined,
      } as Partial<ReturnType<typeof buildEntitlement>>)
    )
    adminEntitlements = [...adminEntitlements, newEntitlement]
    return HttpResponse.json({ success: true, data: { entitlement: newEntitlement } }, { status: 201 })
  }),
  http.options(API_ENDPOINT_ADMIN_ENTITLEMENTS_CREATE, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.put(`${API_ENDPOINT_ADMIN_ENTITLEMENTS_UPDATE}/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const id = toId(params.id)
    adminEntitlements = adminEntitlements.map((entitlement) => {
      const ent = entitlement as MswEntitlementRecord
      if ((ent.id as string | undefined) === id) {
        return {
          ...ent,
          key: (body.key as string | undefined) ?? (ent.key as string | undefined),
          value_type: (body.value_type as string | undefined) ?? (ent.value_type as string | undefined),
          default_value: (body.default_value as unknown) ?? ent.default_value,
          usage_limit:
            (body.usage_limit as number | null | undefined) ?? (ent.usage_limit as number | null | undefined),
          vendorId:
            ((body.vendorId ?? (body as { vendor_id?: string | null }).vendor_id) as string | null | undefined) ??
            (ent.vendorId as string | null | undefined),
        } as MswEntitlementRecord
      }
      return entitlement as MswEntitlementRecord
    }) as MswEntitlementRecord[]
    const updated =
      (adminEntitlements.find((entitlement) => (entitlement as { id?: string }).id === id) as
        | MswEntitlementRecord
        | undefined) ?? toEntitlementRecord(buildEntitlement())
    return HttpResponse.json({ success: true, data: { entitlement: updated } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_ENTITLEMENTS_UPDATE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.delete(`${API_ENDPOINT_ADMIN_ENTITLEMENTS_DELETE}/:id`, ({ params }) => {
    const id = toId(params.id)
    adminEntitlements = adminEntitlements.filter((entitlement) => (entitlement as { id?: string }).id !== id)
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_ENTITLEMENTS_DELETE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(API_ENDPOINT_ADMIN_LICENSES_LIST, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          data: adminLicenses,
          pagination: {
            page: 1,
            limit: adminLicenses.length,
            total: adminLicenses.length,
            totalPages: 1,
          },
        },
      },
      { status: 200 }
    )
  }),
  http.options(API_ENDPOINT_ADMIN_LICENSES_LIST, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(API_ENDPOINT_ADMIN_LICENSES_CREATE, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const base = toLicenseRecord(buildLicense())
    const newLicense: MswLicenseRecord = {
      ...base,
      customerEmail:
        ((body.customerEmail ?? (body as { customer_email?: string }).customer_email) as string) || base.customerEmail,
      productSlug:
        ((body.productSlug ?? (body as { product_slug?: string }).product_slug) as string) || base.productSlug,
      tierCode: ((body.tierCode ?? (body as { tier_code?: string }).tier_code) as string) || base.tierCode,
      vendorId: (body.vendorId ?? (body as { vendor_id?: string | null }).vendor_id ?? base.vendorId) as
        | string
        | null
        | undefined,
      status: ((body.status as LicenseStatus | undefined) ?? (base.status as string) ?? 'ACTIVE') as string,
    }
    adminLicenses = [...adminLicenses, newLicense]
    return HttpResponse.json({ success: true, data: { license: newLicense } }, { status: 201 })
  }),
  http.options(API_ENDPOINT_ADMIN_LICENSES_CREATE, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.put(`${API_ENDPOINT_ADMIN_LICENSES_UPDATE}/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const id = toId(params.id)
    adminLicenses = adminLicenses.map((license) => {
      const lic = license as MswLicenseRecord
      if ((lic.id as string | undefined) === id) {
        return {
          ...lic,
          customerEmail:
            body.customerEmail ??
            (body as { customer_email?: string }).customer_email ??
            lic.customerEmail ??
            'customer@example.com',
          productSlug:
            body.productSlug ?? (body as { product_slug?: string }).product_slug ?? lic.productSlug ?? 'product-slug',
          tierCode: body.tierCode ?? (body as { tier_code?: string }).tier_code ?? lic.tierCode ?? 'TIER',
          vendorId: body.vendorId ?? (body as { vendor_id?: string | null }).vendor_id ?? lic.vendorId,
          status: ((body.status as LicenseStatus | undefined) ??
            (lic.status as LicenseStatus | undefined) ??
            'ACTIVE') as LicenseStatus,
        } as MswLicenseRecord
      }
      return license
    })
    const updated =
      (adminLicenses.find((license) => (license as MswLicenseRecord).id === id) as MswLicenseRecord | undefined) ??
      toLicenseRecord(buildLicense())
    return HttpResponse.json({ success: true, data: { license: updated } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_LICENSES_UPDATE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.delete(`${API_ENDPOINT_ADMIN_LICENSES_REVOKE}/:id`, ({ params }) => {
    const id = toId(params.id)
    adminLicenses = adminLicenses.map((license) => {
      const lic = license as MswLicenseRecord
      return lic.id === id ? { ...lic, status: 'REVOKED' } : lic
    })
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_LICENSES_REVOKE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_LICENSES_SUSPEND}/:id/suspend`, ({ params }) => {
    const id = toId(params.id)
    adminLicenses = adminLicenses.map((license) => {
      const lic = license as MswLicenseRecord
      return lic.id === id ? { ...lic, status: 'SUSPENDED' } : lic
    })
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_LICENSES_SUSPEND}/:id/suspend`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_LICENSES_RESUME}/:id/resume`, ({ params }) => {
    const id = toId(params.id)
    adminLicenses = adminLicenses.map((license) => {
      const lic = license as MswLicenseRecord
      return lic.id === id ? { ...lic, status: 'ACTIVE' } : lic
    })
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_LICENSES_RESUME}/:id/resume`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(`${API_ENDPOINT_ADMIN_LICENSES_FREEZE}/:id/freeze`, ({ params }) => {
    const id = toId(params.id)
    adminLicenses = adminLicenses.map((license) => {
      const lic = license as MswLicenseRecord
      return lic.id === id ? { ...lic, status: 'SUSPENDED' } : lic
    })
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_LICENSES_FREEZE}/:id/freeze`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(`${API_ENDPOINT_ADMIN_LICENSES_ACTIVATIONS}/:id/activations`, ({ params }) => {
    const id = toId(params.id)
    const activations = adminActivations.filter((activation) => activation.licenseKey === id || activation.id === id)
    return HttpResponse.json(
      {
        success: true,
        data: {
          activations,
        },
      },
      { status: 200 }
    )
  }),
  http.options(`${API_ENDPOINT_ADMIN_LICENSES_ACTIVATIONS}/:id/activations`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(`${API_ENDPOINT_ADMIN_LICENSES_GET}/:id`, ({ params }) => {
    const id = toId(params.id)
    const license = adminLicenses.find((item) => item.id === id) ?? buildLicense()
    return HttpResponse.json({ success: true, data: { license } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_LICENSES_GET}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(API_ENDPOINT_ADMIN_USERS_ME, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: buildUser(),
        },
      },
      { status: 200 }
    )
  }),
  http.get(API_ENDPOINT_ADMIN_USERS_LIST, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          data: adminUsers,
          pagination: {
            page: 1,
            limit: adminUsers.length,
            total: adminUsers.length,
            totalPages: 1,
          },
        },
      },
      { status: 200 }
    )
  }),
  http.options(API_ENDPOINT_ADMIN_USERS_LIST, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.post(API_ENDPOINT_ADMIN_USERS_CREATE, async ({ request }) => {
    const body = (await request.json()) as Partial<ReturnType<typeof buildUser>>
    const newUser = buildUser({
      username: body.username,
      email: body.email,
      role: (body as { role?: ReturnType<typeof buildUser>['role'] })?.role,
      vendorId: (body as { vendor_id?: string | null })?.vendor_id ?? body.vendorId,
    })
    adminUsers = [...adminUsers, newUser]
    return HttpResponse.json({ success: true, data: { user: newUser } }, { status: 201 })
  }),
  http.options(API_ENDPOINT_ADMIN_USERS_CREATE, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.put(`${API_ENDPOINT_ADMIN_USERS_UPDATE}/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<ReturnType<typeof buildUser>>
    const id = toId(params.id)
    adminUsers = adminUsers.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          username: body.username ?? user.username,
          email: body.email ?? user.email,
          role: (body as { role?: ReturnType<typeof buildUser>['role'] })?.role ?? user.role,
          vendorId: (body as { vendor_id?: string | null })?.vendor_id ?? user.vendorId,
        }
      }
      return user
    })
    const updated = adminUsers.find((user) => user.id === id) ?? buildUser()
    return HttpResponse.json({ success: true, data: { user: updated } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_USERS_UPDATE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.delete(`${API_ENDPOINT_ADMIN_USERS_DELETE}/:id`, ({ params }) => {
    const id = toId(params.id)
    adminUsers = adminUsers.filter((user) => user.id !== id)
    return HttpResponse.json({ success: true, data: { success: true } }, { status: 200 })
  }),
  http.options(`${API_ENDPOINT_ADMIN_USERS_DELETE}/:id`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.options(API_ENDPOINT_ADMIN_USERS_ME, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(API_ENDPOINT_ADMIN_STATUS, () =>
    HttpResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: { database: 1 },
      },
    })
  ),
  http.options(API_ENDPOINT_ADMIN_STATUS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_HEALTH, () =>
    HttpResponse.json({
      success: true,
      data: {
        metrics: {
          uptime: 123,
          memory: {
            rss: 1,
            heapTotal: 1,
            heapUsed: 1,
            external: 0,
          },
          cpu: {
            user: 1,
            system: 1,
          },
        },
        system: {
          uptime: 123,
          memory: {
            rss: 1,
            heap_total: 1,
            heap_used: 1,
          },
        },
        database: { active_connections: 1 },
      },
    })
  ),
  http.options(API_ENDPOINT_ADMIN_HEALTH, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_METRICS, () =>
    HttpResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        application: { version: '1.0.0', environment: 'test' },
        system: {
          uptime: 1,
          memory: { rss: 1, heapTotal: 1, heapUsed: 1, external: 0 },
          cpu: { user: 0, system: 0 },
        },
      },
    })
  ),
  http.options(API_ENDPOINT_ADMIN_METRICS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_STATS, () =>
    HttpResponse.json({
      success: true,
      data: { stats: { active_licenses: 0, expired_licenses: 0, total_customers: 0, total_activations: 0 } },
    })
  ),
  http.options(API_ENDPOINT_ADMIN_STATS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_USAGE, () => HttpResponse.json({ success: true, data: { summaries: [] } })),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_USAGE, () => new HttpResponse(null, { status: 200 })),
  http.get(`${API_ENDPOINT_ADMIN_ANALYTICS_LICENSE}/:licenseKey`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: {
        license_key: params.licenseKey,
        stats: { activations: 0 },
        history: [],
      },
    })
  ),
  http.options(`${API_ENDPOINT_ADMIN_ANALYTICS_LICENSE}/:licenseKey`, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_TRENDS, () =>
    HttpResponse.json({ success: true, data: { periodStart: '', periodEnd: '', groupBy: '', trends: [] } })
  ),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_TRENDS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES, () =>
    HttpResponse.json({ success: true, data: { licenses: [] } })
  ),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION, () =>
    HttpResponse.json({ success: true, data: { distribution: [] } })
  ),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS, () =>
    HttpResponse.json({
      success: true,
      data: {
        high: { activations: 10, validations: 10, concurrency: 10 },
        medium: { activations: 5, validations: 5, concurrency: 5 },
      },
    })
  ),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_AUDIT_LOGS, () =>
    HttpResponse.json({
      success: true,
      data: {
        entries: [],
      },
    })
  ),
  http.options(API_ENDPOINT_ADMIN_AUDIT_LOGS, () => new HttpResponse(null, { status: 200 })),
  http.post(API_ENDPOINT_ADMIN_AUDIT_VERIFY, () => HttpResponse.json({ success: true, data: { verified: true } })),
  http.options(API_ENDPOINT_ADMIN_AUDIT_VERIFY, () => new HttpResponse(null, { status: 200 })),
  http.get('http://localhost:4000/ws/health', () => HttpResponse.json({ status: 'ok' })),
  http.options('http://localhost:4000/ws/health', () => new HttpResponse(null, { status: 200 })),
  http.all('http://localhost:4000/api/v1/admin/:path*', () => HttpResponse.json({ success: true, data: {} })),
  http.all('*', () => HttpResponse.json({ success: true, data: {} })),
]
