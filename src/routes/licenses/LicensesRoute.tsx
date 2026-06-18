import { useQueries } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { ListLicensesRequest } from '@/simpleLicense'
import { QUERY_KEYS, useAdminLicenses, useAdminProducts, useAdminTenants } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canViewLicenses } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import { ROUTE_PATH_LICENSES } from '../../app/constants'
import { useTableSeed } from '../../app/navigation/useTableSeed'
import {
  UI_LICENSE_COLUMN_ID_CUSTOMER,
  UI_LICENSE_COLUMN_ID_DOMAIN,
  UI_LICENSE_COLUMN_ID_STATUS,
  UI_LICENSE_COLUMN_ID_TIER,
  UI_LICENSE_STATUS_ACTION_RETRY,
  UI_LICENSE_STATUS_ERROR_BODY,
  UI_LICENSE_STATUS_ERROR_TITLE,
  UI_LICENSE_STATUS_LOADING_BODY,
  UI_LICENSE_STATUS_LOADING_TITLE,
  UI_PAGE_SUBTITLE_LICENSES,
  UI_PAGE_TITLE_LICENSES,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_SORT_ASC,
  UI_TABLE_PAGE_SIZE_OPTIONS,
  UI_TENANT_FILTER_ALL,
} from '../../ui/constants'
import { useTableState } from '../../ui/data/useTableState'
import { RouteStatus } from '../../ui/feedback/RouteStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiSelectOption } from '../../ui/types'
import type { LicenseListItem } from '../../ui/workflows/LicenseManagementPanel'
import { LicenseManagementPanel } from '../../ui/workflows/LicenseManagementPanel'
import { buildRouteStatusState } from '../shared/routeStatus'
import { useTenantScopedProducts } from '../shared/useTenantScopedProducts'

type LicenseFilters = {
  status: string[]
  tenantId: string
  productSlug: string
}

// Map table column ids to server sort tokens. The product column is intentionally
// absent: product slug lives on the related product (not the License row), so it
// cannot be ordered server-side without a join.
const LICENSE_SORT_FIELD_BY_COLUMN: Record<string, string> = {
  [UI_LICENSE_COLUMN_ID_CUSTOMER]: 'customer_email',
  [UI_LICENSE_COLUMN_ID_DOMAIN]: 'domain',
  [UI_LICENSE_COLUMN_ID_TIER]: 'tier_code',
  [UI_LICENSE_COLUMN_ID_STATUS]: 'status',
}

export function LicensesRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data: productsData } = useAdminProducts(client)
  const { data: tenantsData } = useAdminTenants(client)

  const seededSearch = useTableSeed(ROUTE_PATH_LICENSES)
  const tableState = useTableState<LicenseFilters>({
    initialFilters: {
      status: [],
      tenantId: '',
      productSlug: '',
    },
    initialSearchTerm: seededSearch,
    initialSortState: { columnId: UI_LICENSE_COLUMN_ID_CUSTOMER, direction: UI_SORT_ASC },
  })
  const [pageSize, setPageSize] = useState<number>(UI_TABLE_PAGE_SIZE_OPTIONS[0])

  const selectedTenantId = tableState.filters.tenantId
  const selectedProductSlug = tableState.filters.productSlug

  const { filteredProducts, isVendorScoped, tenantOptions, showTenantFilter } = useTenantScopedProducts({
    currentUser,
    products: productsData,
    tenants: tenantsData,
    selectedTenantId,
    allOptionLabel: UI_TENANT_FILTER_ALL,
  })

  // Tiers populate the create/edit form dropdowns. Fetch them per product through
  // React Query (same cache key as useProductTiers) so responses are cached and
  // deduped. Failures only affect form dropdowns, so they are suppressed rather
  // than surfaced as blocking errors.
  const tierQueries = useQueries({
    queries: filteredProducts.map((product) => ({
      queryKey: QUERY_KEYS.adminProductTiers.all(product.id),
      queryFn: () => client.listProductTiers(product.id),
      meta: { suppressErrorToast: true },
    })),
  })

  const tierOptions = useMemo<{ value: string; label: string }[]>(() => {
    const allTiers: { value: string; label: string }[] = []
    tierQueries.forEach((query, index) => {
      const product = filteredProducts[index]
      if (!product || !query.data) {
        return
      }
      const response = query.data
      const tiers = Array.isArray(response) ? response : (response?.data ?? [])
      for (const tier of tiers) {
        allTiers.push({
          value: tier.tierCode,
          label: `${product.name} - ${tier.tierName}`,
        })
      }
    })
    allTiers.sort((a, b) => a.label.localeCompare(b.label))
    return allTiers
  }, [tierQueries, filteredProducts])

  const filteredProductOptions = useMemo<UiSelectOption[]>(() => {
    const options = filteredProducts.map((product) => ({ value: product.slug, label: product.name }))
    options.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
    return options
  }, [filteredProducts])

  // Server-side query parameters. Pagination, status (multi + DELETED), product,
  // search, sort, and the tenant filter are all resolved by the backend so the
  // table stays correct beyond the first page.
  const filters = useMemo<ListLicensesRequest>(() => {
    const offset = Math.max(0, (tableState.page - 1) * pageSize)
    const sortColumnId = tableState.sortState?.columnId
    const sortField = sortColumnId ? LICENSE_SORT_FIELD_BY_COLUMN[sortColumnId] : undefined
    const params: ListLicensesRequest = {
      limit: pageSize,
      offset,
      search: tableState.searchTerm || undefined,
      status: tableState.filters.status.length > 0 ? tableState.filters.status.join(',') : undefined,
      product_slug: tableState.filters.productSlug || undefined,
      sort_by: sortField,
      sort_dir: sortField ? tableState.sortState?.direction : undefined,
    }
    // Vendor-scoped users are constrained to their own products by the server;
    // the tenant filter only applies to global admins.
    if (!isVendorScoped && tableState.filters.tenantId) {
      params.vendor_id = tableState.filters.tenantId
    }
    return params
  }, [isVendorScoped, pageSize, tableState.filters, tableState.page, tableState.searchTerm, tableState.sortState])

  const { data, isLoading, isError, refetch } = useAdminLicenses(client, filters)

  const licenses = useMemo<LicenseListItem[]>(() => {
    return Array.isArray(data) ? (data as LicenseListItem[]) : ((data?.data as LicenseListItem[]) ?? [])
  }, [data])

  const totalPages = useMemo(() => {
    if (Array.isArray(data)) {
      return 1
    }
    return data?.pagination?.totalPages ?? 1
  }, [data])

  const canView = canViewLicenses(currentUser ?? null)

  const handleRefresh = () => {
    void refetch()
  }

  const routeStatus = buildRouteStatusState({
    isLoading,
    isError,
    canView,
    loadingTitle: UI_LICENSE_STATUS_LOADING_TITLE,
    loadingMessage: UI_LICENSE_STATUS_LOADING_BODY,
    errorTitle: UI_LICENSE_STATUS_ERROR_TITLE,
    errorMessage: UI_LICENSE_STATUS_ERROR_BODY,
    retryLabel: UI_LICENSE_STATUS_ACTION_RETRY,
    onRetry: handleRefresh,
  })

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_LICENSES} subtitle={UI_PAGE_SUBTITLE_LICENSES} />

      <RouteStatus {...routeStatus.routeStatusProps} />

      {routeStatus.canRenderContent ? (
        <LicenseManagementPanel
          client={client}
          licenses={licenses}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
          searchTerm={tableState.searchTerm}
          onSearchChange={tableState.setSearchTerm}
          statusFilter={tableState.filters.status}
          onStatusFilterChange={(value) => tableState.setFilter('status', value)}
          selectedTenantId={selectedTenantId}
          tenantOptions={tenantOptions}
          showTenantFilter={showTenantFilter}
          onTenantFilterChange={(value) => {
            tableState.setFilter('tenantId', value)
            tableState.setFilter('productSlug', '')
          }}
          selectedProductSlug={selectedProductSlug}
          onProductFilterChange={(value) => tableState.setFilter('productSlug', value)}
          page={tableState.page}
          totalPages={totalPages}
          onPageChange={tableState.setPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            tableState.setPage(1)
          }}
          sortState={tableState.sortState}
          onSortChange={tableState.setSortState}
          productOptions={filteredProductOptions}
          tierOptions={tierOptions}
        />
      ) : null}
    </Page>
  )
}
