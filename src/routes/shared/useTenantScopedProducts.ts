import { useMemo } from 'react'
import type { Product, User } from '@/simpleLicense'

import { isProductOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import type { UiSelectOption } from '../../ui/types'
import {
  buildTenantNameMap,
  buildTenantOptions,
  getProductTenantId,
  type ProductRecord,
  type TenantRecord,
} from '../../ui/utils/tenantFilters'

type CollectionResponse<T> = readonly T[] | { data?: readonly T[] } | null | undefined

type UseTenantScopedProductsInput<TProduct extends ProductRecord> = {
  currentUser?: User | null
  products: CollectionResponse<TProduct>
  tenants: CollectionResponse<TenantRecord>
  selectedTenantId: string
  allOptionLabel: string
}

type UseTenantScopedProductsResult<TProduct extends ProductRecord> = {
  isVendorScoped: boolean
  visibleProducts: readonly TProduct[]
  filteredProducts: readonly TProduct[]
  tenantOptions: readonly UiSelectOption[]
  showTenantFilter: boolean
}

function toList<T>(value: CollectionResponse<T>): readonly T[] {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value
  }
  const response = value as { data?: readonly T[] }
  return response.data ?? []
}

export function useTenantScopedProducts<TProduct extends ProductRecord>({
  currentUser,
  products,
  tenants,
  selectedTenantId,
  allOptionLabel,
}: UseTenantScopedProductsInput<TProduct>): UseTenantScopedProductsResult<TProduct> {
  const isVendorScoped = isVendorScopedUser(currentUser ?? null)

  const tenantList = useMemo(() => toList(tenants), [tenants])
  const productList = useMemo(() => toList(products), [products])

  const visibleProducts = useMemo(() => {
    if (!currentUser || !isVendorScoped) {
      return productList
    }
    return productList.filter((product) => isProductOwnedByUser(currentUser, product as unknown as Product))
  }, [currentUser, isVendorScoped, productList])

  const tenantMap = useMemo(() => buildTenantNameMap(tenantList), [tenantList])

  const tenantOptions = useMemo<UiSelectOption[]>(
    () =>
      buildTenantOptions({
        tenants: tenantList,
        products: visibleProducts,
        tenantMap,
        isVendorScoped,
        allOptionLabel,
      }),
    [allOptionLabel, isVendorScoped, tenantList, tenantMap, visibleProducts]
  )

  const showTenantFilter = tenantOptions.filter((option) => option.value !== '').length > 1

  const filteredProducts = useMemo(
    () =>
      selectedTenantId
        ? visibleProducts.filter((product) => getProductTenantId(product) === selectedTenantId)
        : visibleProducts,
    [selectedTenantId, visibleProducts]
  )

  return {
    isVendorScoped,
    visibleProducts,
    filteredProducts,
    tenantOptions,
    showTenantFilter,
  }
}
