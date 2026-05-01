import { useCallback, useMemo } from 'react'
import type { Product } from '@/simpleLicense'
import { useAdminProducts, useAdminTenants } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canViewProducts, isProductOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import {
  UI_PAGE_SUBTITLE_PRODUCTS,
  UI_PAGE_TITLE_PRODUCTS,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_PRODUCT_COLUMN_ID_NAME,
  UI_PRODUCT_COLUMN_ID_SLUG,
  UI_PRODUCT_COLUMN_ID_STATUS,
  UI_PRODUCT_COLUMN_ID_VENDOR,
  UI_PRODUCT_STATUS_ACTION_RETRY,
  UI_PRODUCT_STATUS_ERROR_BODY,
  UI_PRODUCT_STATUS_ERROR_TITLE,
  UI_PRODUCT_STATUS_LOADING_BODY,
  UI_PRODUCT_STATUS_LOADING_TITLE,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_SORT_ASC,
} from '../../ui/constants'
import { useDataTableState } from '../../ui/data/useDataTableState'
import { useTableState } from '../../ui/data/useTableState'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiSelectOption } from '../../ui/types'
import type { ProductListItem } from '../../ui/workflows/ProductManagementPanel'
import { ProductManagementPanel } from '../../ui/workflows/ProductManagementPanel'

export function ProductsRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminProducts(client)
  const { data: tenantsData } = useAdminTenants(client)
  const tableState = useTableState({
    initialFilters: {
      status: 'true',
    },
  })

  const visibleProducts = useMemo<ProductListItem[]>(() => {
    const list = Array.isArray(data) ? data : (data?.data ?? [])
    const tenants = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.data ?? [])
    const tenantMap = new Map(tenants.map((tenant) => [tenant.id, tenant.name]))

    let mapped = list.map<ProductListItem>((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? undefined,
      isActive: product.isActive,
      vendorId: product.vendorId,
      vendorName: tenantMap.get(product.vendorId),
    }))

    if (isVendorScopedUser(currentUser)) {
      mapped = mapped.filter((product) => isProductOwnedByUser(currentUser, product as unknown as Product))
    }

    return mapped
  }, [currentUser, data, tenantsData])

  const vendorOptions = useMemo<UiSelectOption[]>(() => {
    const tenants = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.data ?? [])
    return tenants.map((tenant) => ({
      value: tenant.id,
      label: tenant.name,
    }))
  }, [tenantsData])

  const searchProducts = useCallback((product: ProductListItem, term: string) => {
    const needle = term.toLowerCase()
    return product.name.toLowerCase().includes(needle) || product.slug.toLowerCase().includes(needle)
  }, [])

  const compareText = useCallback(
    (getValue: (product: ProductListItem) => string | null | undefined) => (a: ProductListItem, b: ProductListItem) =>
      (getValue(a) ?? '').localeCompare(getValue(b) ?? '', undefined, { numeric: true, sensitivity: 'base' }),
    []
  )

  const sortComparators = useMemo(
    () => ({
      [UI_PRODUCT_COLUMN_ID_NAME]: compareText((product) => product.name),
      [UI_PRODUCT_COLUMN_ID_SLUG]: compareText((product) => product.slug),
      [UI_PRODUCT_COLUMN_ID_STATUS]: (a: ProductListItem, b: ProductListItem) =>
        Number(b.isActive) - Number(a.isActive),
      [UI_PRODUCT_COLUMN_ID_VENDOR]: compareText((product) => product.vendorName ?? product.vendorId),
    }),
    [compareText]
  )

  const productTable = useDataTableState({
    data: visibleProducts,
    initialSort: { columnId: UI_PRODUCT_COLUMN_ID_NAME, direction: UI_SORT_ASC },
    search: searchProducts,
    filter: (product) => {
      const status = tableState.filters.status
      if (!status) {
        return true
      }
      return product.isActive === (status === 'true')
    },
    sortComparators,
  })

  const canView = canViewProducts(currentUser)

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_PRODUCTS} subtitle={UI_PAGE_SUBTITLE_PRODUCTS} />

      {isLoading ? (
        <SectionStatus
          status={UI_SECTION_STATUS_LOADING}
          title={UI_PRODUCT_STATUS_LOADING_TITLE}
          message={UI_PRODUCT_STATUS_LOADING_BODY}
        />
      ) : null}

      {isError ? (
        <SectionStatus
          status={UI_SECTION_STATUS_ERROR}
          title={UI_PRODUCT_STATUS_ERROR_TITLE}
          message={UI_PRODUCT_STATUS_ERROR_BODY}
          actions={
            <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
              {UI_PRODUCT_STATUS_ACTION_RETRY}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && canView ? (
        <ProductManagementPanel
          client={client}
          products={productTable.rows}
          currentUser={currentUser ?? undefined}
          vendorOptions={vendorOptions}
          onRefresh={handleRefresh}
          searchTerm={productTable.searchTerm}
          onSearchChange={productTable.setSearchTerm}
          statusFilter={tableState.filters.status}
          onStatusFilterChange={(value) => {
            tableState.setFilter('status', value)
            productTable.goToPage(1)
          }}
          page={productTable.page}
          totalPages={productTable.totalPages}
          onPageChange={productTable.goToPage}
          sortState={productTable.sortState}
          onSortChange={productTable.onSort}
        />
      ) : null}
    </Page>
  )
}
