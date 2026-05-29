import { useCallback, useMemo } from 'react'
import { useAdminProducts, useAdminTenants } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canViewProducts } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import {
  UI_PAGE_SUBTITLE_PRODUCTS,
  UI_PAGE_TITLE_PRODUCTS,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_PRODUCT_COLUMN_ID_NAME,
  UI_PRODUCT_COLUMN_ID_SLUG,
  UI_PRODUCT_COLUMN_ID_STATUS,
  UI_PRODUCT_COLUMN_ID_VENDOR,
  UI_PRODUCT_COLUMN_ID_WOO_SYNC,
  UI_PRODUCT_FILTER_VALUE_ACTIVE,
  UI_PRODUCT_FILTER_VALUE_INACTIVE,
  UI_PRODUCT_STATUS_ACTION_RETRY,
  UI_PRODUCT_STATUS_ERROR_BODY,
  UI_PRODUCT_STATUS_ERROR_TITLE,
  UI_PRODUCT_STATUS_LOADING_BODY,
  UI_PRODUCT_STATUS_LOADING_TITLE,
  UI_SORT_ASC,
  UI_TABLE_PAGE_SIZE_OPTIONS,
  UI_TENANT_FILTER_ALL,
} from '../../ui/constants'
import { useDataTableState } from '../../ui/data/useDataTableState'
import { useTableState } from '../../ui/data/useTableState'
import { RouteStatus } from '../../ui/feedback/RouteStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiSelectOption } from '../../ui/types'
import { buildTenantNameMap } from '../../ui/utils/tenantFilters'
import type { ProductListItem } from '../../ui/workflows/ProductManagementPanel'
import { ProductManagementPanel } from '../../ui/workflows/ProductManagementPanel'
import { buildRouteStatusState } from '../shared/routeStatus'
import { usePagedFilters } from '../shared/usePagedFilters'
import { useTenantScopedProducts } from '../shared/useTenantScopedProducts'

type ProductFilters = {
  status: string[]
  tenantId: string
}

export function ProductsRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminProducts(client)
  const { data: tenantsData } = useAdminTenants(client)
  const tableState = useTableState<ProductFilters>({
    initialFilters: {
      status: [],
      tenantId: '',
    },
  })

  const selectedTenantId = tableState.filters.tenantId

  const mappedProducts = useMemo<ProductListItem[]>(() => {
    const list = Array.isArray(data) ? data : (data?.data ?? [])
    const tenants = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.data ?? [])
    const tenantMap = buildTenantNameMap(tenants)

    return list.map<ProductListItem>((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? undefined,
      isActive: product.isActive,
      syncToWooCatalog: product.syncToWooCatalog ?? false,
      vendorId: product.vendorId,
      vendorName: tenantMap.get(product.vendorId),
    }))
  }, [data, tenantsData])

  const { filteredProducts, tenantOptions, showTenantFilter } = useTenantScopedProducts({
    currentUser,
    products: mappedProducts,
    tenants: tenantsData,
    selectedTenantId,
    allOptionLabel: UI_TENANT_FILTER_ALL,
  })

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
      [UI_PRODUCT_COLUMN_ID_WOO_SYNC]: (a: ProductListItem, b: ProductListItem) =>
        Number(b.syncToWooCatalog ?? false) - Number(a.syncToWooCatalog ?? false),
      [UI_PRODUCT_COLUMN_ID_VENDOR]: compareText((product) => product.vendorName ?? product.vendorId),
    }),
    [compareText]
  )

  const productTable = useDataTableState({
    data: filteredProducts,
    pageSize: UI_TABLE_PAGE_SIZE_OPTIONS[0],
    initialSort: { columnId: UI_PRODUCT_COLUMN_ID_NAME, direction: UI_SORT_ASC },
    search: searchProducts,
    filter: (product) => {
      const status = tableState.filters.status
      if (status.length === 0) {
        return true
      }
      return status.includes(product.isActive ? UI_PRODUCT_FILTER_VALUE_ACTIVE : UI_PRODUCT_FILTER_VALUE_INACTIVE)
    },
    sortComparators,
  })

  const canView = canViewProducts(currentUser)
  const { setFilterAndReset } = usePagedFilters<ProductFilters>(tableState.setFilter, productTable.goToPage)

  const handleRefresh = () => {
    void refetch()
  }

  const routeStatus = buildRouteStatusState({
    isLoading,
    isError,
    canView,
    loadingTitle: UI_PRODUCT_STATUS_LOADING_TITLE,
    loadingMessage: UI_PRODUCT_STATUS_LOADING_BODY,
    errorTitle: UI_PRODUCT_STATUS_ERROR_TITLE,
    errorMessage: UI_PRODUCT_STATUS_ERROR_BODY,
    retryLabel: UI_PRODUCT_STATUS_ACTION_RETRY,
    onRetry: handleRefresh,
  })

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_PRODUCTS} subtitle={UI_PAGE_SUBTITLE_PRODUCTS} />

      <RouteStatus {...routeStatus.routeStatusProps} />

      {routeStatus.canRenderContent ? (
        <ProductManagementPanel
          client={client}
          products={productTable.rows}
          currentUser={currentUser ?? undefined}
          showPanelHeader={false}
          vendorOptions={vendorOptions}
          selectedTenantId={selectedTenantId}
          tenantOptions={tenantOptions}
          showTenantFilter={showTenantFilter}
          onTenantFilterChange={(value) => setFilterAndReset('tenantId', value)}
          onRefresh={handleRefresh}
          searchTerm={productTable.searchTerm}
          onSearchChange={productTable.setSearchTerm}
          statusFilter={tableState.filters.status}
          onStatusFilterChange={(value) => setFilterAndReset('status', value)}
          page={productTable.page}
          totalPages={productTable.totalPages}
          onPageChange={productTable.goToPage}
          pageSize={productTable.pageSize}
          onPageSizeChange={productTable.setPageSize}
          sortState={productTable.sortState}
          onSortChange={productTable.onSort}
        />
      ) : null}
    </Page>
  )
}
