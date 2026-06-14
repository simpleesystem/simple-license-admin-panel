import { useQueries } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import type { License } from '@/simpleLicense'
import { QUERY_KEYS, useAdminLicenses, useAdminProducts, useAdminTenants } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canViewLicenses, isLicenseOwnedByUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import { ROUTE_PATH_LICENSES } from '../../app/constants'
import { useTableSeed } from '../../app/navigation/useTableSeed'
import {
  UI_LICENSE_COLUMN_ID_CUSTOMER,
  UI_LICENSE_COLUMN_ID_DOMAIN,
  UI_LICENSE_COLUMN_ID_PRODUCT,
  UI_LICENSE_COLUMN_ID_STATUS,
  UI_LICENSE_COLUMN_ID_TIER,
  UI_LICENSE_STATUS_ACTION_RETRY,
  UI_LICENSE_STATUS_DELETED,
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
import { useDataTableState } from '../../ui/data/useDataTableState'
import { useTableState } from '../../ui/data/useTableState'
import { RouteStatus } from '../../ui/feedback/RouteStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiSelectOption } from '../../ui/types'
import type { LicenseListItem } from '../../ui/workflows/LicenseManagementPanel'
import { LicenseManagementPanel } from '../../ui/workflows/LicenseManagementPanel'
import { buildRouteStatusState } from '../shared/routeStatus'
import { usePagedFilters } from '../shared/usePagedFilters'
import { useTenantScopedProducts } from '../shared/useTenantScopedProducts'

type LicenseFilters = {
  status: string[]
  tenantId: string
  productSlug: string
}

export function LicensesRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminLicenses(client)
  const { data: productsData } = useAdminProducts(client)
  const { data: tenantsData } = useAdminTenants(client)
  const tableState = useTableState<LicenseFilters>({
    initialFilters: {
      status: [],
      tenantId: '',
      productSlug: '',
    },
  })
  const selectedTenantId = tableState.filters.tenantId
  const selectedProductSlug = tableState.filters.productSlug

  const { filteredProducts, isVendorScoped, tenantOptions, showTenantFilter } = useTenantScopedProducts({
    currentUser,
    products: productsData,
    tenants: tenantsData,
    selectedTenantId,
    allOptionLabel: UI_TENANT_FILTER_ALL,
  })

  // Tiers populate the tier filter dropdown. Fetch them per product through
  // React Query (same cache key as useProductTiers) instead of a manual
  // Promise.all in an effect: responses are cached and deduped, so switching
  // the tenant filter or revisiting the page no longer re-fetches tiers for
  // products already loaded. Failures only affect a filter dropdown, so they
  // are suppressed rather than surfaced as blocking errors.
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

  const visibleLicenses = useMemo<LicenseListItem[]>(() => {
    let list = Array.isArray(data) ? (data as LicenseListItem[]) : ((data?.data as LicenseListItem[]) ?? [])

    if (isVendorScoped) {
      list = list.filter((license) => {
        // LicenseListItem is compatible with License for ownership checks
        return isLicenseOwnedByUser(currentUser, license as unknown as License)
      })
    }

    return list
  }, [currentUser, data, isVendorScoped])

  const searchLicenses = useCallback((license: LicenseListItem, term: string) => {
    const needle = term.toLowerCase()
    return (
      (license.customerEmail?.toLowerCase().includes(needle) ?? false) ||
      (license.productSlug?.toLowerCase().includes(needle) ?? false)
    )
  }, [])

  const compareText = useCallback(
    (getValue: (license: LicenseListItem) => string | null | undefined) => (a: LicenseListItem, b: LicenseListItem) =>
      (getValue(a) ?? '').localeCompare(getValue(b) ?? '', undefined, { numeric: true, sensitivity: 'base' }),
    []
  )

  const sortComparators = useMemo(
    () => ({
      [UI_LICENSE_COLUMN_ID_CUSTOMER]: compareText((license) => license.customerEmail),
      [UI_LICENSE_COLUMN_ID_PRODUCT]: compareText((license) => license.productSlug),
      [UI_LICENSE_COLUMN_ID_DOMAIN]: compareText((license) => license.domain),
      [UI_LICENSE_COLUMN_ID_TIER]: compareText((license) => license.tierCode),
      [UI_LICENSE_COLUMN_ID_STATUS]: compareText((license) => license.status),
    }),
    [compareText]
  )

  const seededSearch = useTableSeed(ROUTE_PATH_LICENSES)
  const licenseTable = useDataTableState({
    data: visibleLicenses,
    pageSize: UI_TABLE_PAGE_SIZE_OPTIONS[0],
    initialSort: { columnId: UI_LICENSE_COLUMN_ID_CUSTOMER, direction: UI_SORT_ASC },
    initialSearchTerm: seededSearch,
    search: searchLicenses,
    filter: (license) => {
      const statusFilter = tableState.filters.status
      const isSoftDeleted = license.softDeletedAt != null
      if (statusFilter.length === 0) {
        if (isSoftDeleted) {
          return false
        }
      } else {
        const includeDeleted = statusFilter.includes(UI_LICENSE_STATUS_DELETED)
        if (isSoftDeleted) {
          if (!includeDeleted) {
            return false
          }
        } else if (!statusFilter.includes(license.status)) {
          return false
        }
      }
      const tenantFilter = tableState.filters.tenantId
      if (tenantFilter && license.vendorId !== tenantFilter) {
        return false
      }
      const productFilter = tableState.filters.productSlug
      if (productFilter && license.productSlug !== productFilter) {
        return false
      }
      return true
    },
    sortComparators,
  })

  const canView = canViewLicenses(currentUser ?? null)
  const { setFilterAndReset, setFiltersAndReset } = usePagedFilters<LicenseFilters>(
    tableState.setFilter,
    licenseTable.goToPage
  )

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
          licenses={licenseTable.rows}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
          searchTerm={licenseTable.searchTerm}
          onSearchChange={licenseTable.setSearchTerm}
          statusFilter={tableState.filters.status}
          onStatusFilterChange={(value) => setFilterAndReset('status', value)}
          selectedTenantId={selectedTenantId}
          tenantOptions={tenantOptions}
          showTenantFilter={showTenantFilter}
          onTenantFilterChange={(value) => setFiltersAndReset({ tenantId: value, productSlug: '' })}
          selectedProductSlug={selectedProductSlug}
          onProductFilterChange={(value) => setFilterAndReset('productSlug', value)}
          page={licenseTable.page}
          totalPages={licenseTable.totalPages}
          onPageChange={licenseTable.goToPage}
          pageSize={licenseTable.pageSize}
          onPageSizeChange={licenseTable.setPageSize}
          sortState={licenseTable.sortState}
          onSortChange={licenseTable.onSort}
          productOptions={filteredProductOptions}
          tierOptions={tierOptions}
        />
      ) : null}
    </Page>
  )
}
