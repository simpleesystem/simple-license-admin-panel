import type { UiSelectOption } from '../types'

export type TenantRecord = {
  id: string
  name: string
  vendorId?: string | null
}

export type ProductRecord = {
  vendorId?: string
  vendor_id?: unknown
}

export function getProductTenantId(product: ProductRecord): string {
  if (typeof product.vendorId === 'string' && product.vendorId.length > 0) {
    return product.vendorId
  }
  return typeof product.vendor_id === 'string' ? product.vendor_id : ''
}

export function getTenantFilterId(tenant: TenantRecord): string {
  if (typeof tenant.vendorId === 'string' && tenant.vendorId.length > 0) {
    return tenant.vendorId
  }
  return tenant.id
}

export function buildTenantNameMap(tenants: readonly TenantRecord[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const tenant of tenants) {
    if (tenant.id) {
      map.set(tenant.id, tenant.name)
    }
    if (tenant.vendorId) {
      map.set(tenant.vendorId, tenant.name)
    }
  }
  return map
}

type BuildTenantOptionsInput = {
  tenants: readonly TenantRecord[]
  products: readonly ProductRecord[]
  tenantMap: Map<string, string>
  isVendorScoped: boolean
  allOptionLabel: string
}

export function buildTenantOptions({
  tenants,
  products,
  tenantMap,
  isVendorScoped,
  allOptionLabel,
}: BuildTenantOptionsInput): UiSelectOption[] {
  const tenantIdsFromProducts = [...new Set(products.map((product) => getProductTenantId(product)).filter(Boolean))]
  const tenantIds = isVendorScoped
    ? tenantIdsFromProducts
    : [
        ...new Set(
          tenants
            .map((tenant) => getTenantFilterId(tenant))
            .filter((tenantId): tenantId is string => typeof tenantId === 'string' && tenantId.length > 0)
        ),
      ]
  const options = tenantIds.map((tenantId) => ({
    value: tenantId,
    label: tenantMap.get(tenantId) ?? tenantId,
  }))
  options.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
  return [{ value: '', label: allOptionLabel }, ...options]
}
