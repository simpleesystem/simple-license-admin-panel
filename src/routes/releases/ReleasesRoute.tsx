import { useCallback, useEffect, useMemo } from 'react'

import type { PluginRelease } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canDeleteRelease, canUpdateProduct, canViewProducts } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import { useAdminProducts, useAdminReleases, useAdminTenants } from '../../simpleLicense/hooks'
import {
  UI_PAGE_SUBTITLE_RELEASES,
  UI_PAGE_TITLE_RELEASES,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_RELEASE_AUTO_REFRESH_INTERVAL_MS,
  UI_RELEASE_COLUMN_ID_CREATED,
  UI_RELEASE_COLUMN_ID_FILE,
  UI_RELEASE_COLUMN_ID_SIZE,
  UI_RELEASE_COLUMN_ID_STATUS,
  UI_RELEASE_COLUMN_ID_VERSION,
  UI_RELEASE_FILTER_VALUE_ALL,
  UI_RELEASE_FILTER_VALUE_PRERELEASE,
  UI_RELEASE_FILTER_VALUE_STABLE,
  UI_RELEASE_ROUTE_STATUS_ERROR_BODY,
  UI_RELEASE_ROUTE_STATUS_ERROR_TITLE,
  UI_RELEASE_ROUTE_STATUS_LOADING_BODY,
  UI_RELEASE_ROUTE_STATUS_LOADING_TITLE,
  UI_RELEASE_STATUS_ACTION_RETRY,
  UI_SORT_DESC,
  UI_TABLE_PAGE_SIZE_OPTIONS,
  UI_TENANT_FILTER_ALL,
} from '../../ui/constants'
import { useDataTableState } from '../../ui/data/useDataTableState'
import { useTableState } from '../../ui/data/useTableState'
import { RouteStatus } from '../../ui/feedback/RouteStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiSelectOption } from '../../ui/types'
import type { ReleaseListItem } from '../../ui/workflows/ReleasesPanel'
import { ReleasesPanel } from '../../ui/workflows/ReleasesPanel'
import { buildRouteStatusState } from '../shared/routeStatus'
import { usePagedFilters } from '../shared/usePagedFilters'
import { useTenantScopedProducts } from '../shared/useTenantScopedProducts'

type ReleaseFilters = {
  tenantId: string
  productId: string
  channel: string
}

export function ReleasesRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useAdminProducts(client)
  const {
    data: tenantsData,
    isLoading: tenantsLoading,
    isError: tenantsError,
    refetch: refetchTenants,
  } = useAdminTenants(client)

  const tableState = useTableState<ReleaseFilters>({
    initialFilters: { tenantId: '', productId: '', channel: UI_RELEASE_FILTER_VALUE_ALL },
  })

  const selectedTenantId = tableState.filters.tenantId
  const selectedProductId = tableState.filters.productId

  const { filteredProducts, tenantOptions, showTenantFilter } = useTenantScopedProducts({
    currentUser,
    products: productsData,
    tenants: tenantsData,
    selectedTenantId,
    allOptionLabel: UI_TENANT_FILTER_ALL,
  })

  const productOptions = useMemo<UiSelectOption[]>(() => {
    return filteredProducts.map((product) => ({ value: product.id, label: `${product.name} (${product.slug})` }))
  }, [filteredProducts])

  const {
    data: releasesData,
    isLoading: releasesLoading,
    isError: releasesError,
    refetch: refetchReleases,
  } = useAdminReleases(client, selectedProductId, {
    enabled: Boolean(selectedProductId),
  })

  const releases = useMemo<ReleaseListItem[]>(
    () => (Array.isArray(releasesData) ? (releasesData as PluginRelease[]) : []),
    [releasesData]
  )

  const searchReleases = useCallback((release: ReleaseListItem, term: string) => {
    const needle = term.toLowerCase()
    return release.version.toLowerCase().includes(needle) || release.fileName.toLowerCase().includes(needle)
  }, [])

  const compareText = useCallback(
    (getValue: (release: ReleaseListItem) => string | null | undefined) => (a: ReleaseListItem, b: ReleaseListItem) =>
      (getValue(a) ?? '').localeCompare(getValue(b) ?? '', undefined, { numeric: true, sensitivity: 'base' }),
    []
  )

  const sortComparators = useMemo(
    () => ({
      [UI_RELEASE_COLUMN_ID_VERSION]: compareText((release) => release.version),
      [UI_RELEASE_COLUMN_ID_FILE]: compareText((release) => release.fileName),
      [UI_RELEASE_COLUMN_ID_SIZE]: (a: ReleaseListItem, b: ReleaseListItem) =>
        Number(a.sizeBytes ?? 0) - Number(b.sizeBytes ?? 0),
      [UI_RELEASE_COLUMN_ID_CREATED]: compareText((release) => release.createdAt),
      [UI_RELEASE_COLUMN_ID_STATUS]: (a: ReleaseListItem, b: ReleaseListItem) =>
        Number(Boolean(a.isPromoted)) - Number(Boolean(b.isPromoted)),
    }),
    [compareText]
  )

  const channelFilter = tableState.filters.channel

  const releasesTable = useDataTableState<ReleaseListItem>({
    data: releases,
    pageSize: UI_TABLE_PAGE_SIZE_OPTIONS[0],
    initialSort: { columnId: UI_RELEASE_COLUMN_ID_CREATED, direction: UI_SORT_DESC },
    search: searchReleases,
    filter: (release) => {
      if (channelFilter === UI_RELEASE_FILTER_VALUE_PRERELEASE) {
        return Boolean(release.isPrerelease)
      }
      if (channelFilter === UI_RELEASE_FILTER_VALUE_STABLE) {
        return !release.isPrerelease
      }
      return true
    },
    sortComparators,
  })

  const canManageReleases = canUpdateProduct(currentUser ?? null)
  const allowCreate = Boolean(selectedProductId) && canManageReleases
  const allowPromote = Boolean(selectedProductId) && canManageReleases
  const allowDelete = currentUser ? canDeleteRelease(currentUser) : false
  const canView = canViewProducts(currentUser ?? null)
  const { setFilterAndReset, setFiltersAndReset } = usePagedFilters<ReleaseFilters>(
    tableState.setFilter,
    releasesTable.goToPage
  )

  const handleRefresh = useCallback(() => {
    if (!selectedProductId) {
      return
    }
    void refetchReleases()
  }, [refetchReleases, selectedProductId])

  useEffect(() => {
    if (!selectedProductId) {
      return
    }
    const intervalId = window.setInterval(() => {
      handleRefresh()
    }, UI_RELEASE_AUTO_REFRESH_INTERVAL_MS)
    return () => {
      window.clearInterval(intervalId)
    }
  }, [handleRefresh, selectedProductId])

  const handleProductChange = (productId: string) => {
    setFilterAndReset('productId', productId)
  }

  const handleTenantChange = (tenantId: string) => {
    setFiltersAndReset({ tenantId, productId: '' })
  }

  const handleChannelChange = (value: string) => {
    setFilterAndReset('channel', value)
  }

  const showLoading = Boolean(selectedProductId) && releasesLoading
  const showError = Boolean(selectedProductId) && releasesError
  const isRouteLoading = productsLoading || tenantsLoading
  const isRouteError = productsError || tenantsError

  const handleRouteRetry = () => {
    void Promise.all([refetchProducts(), refetchTenants(), selectedProductId ? refetchReleases() : Promise.resolve()])
  }

  const routeStatus = buildRouteStatusState({
    isLoading: isRouteLoading,
    isError: isRouteError,
    canView,
    loadingTitle: UI_RELEASE_ROUTE_STATUS_LOADING_TITLE,
    loadingMessage: UI_RELEASE_ROUTE_STATUS_LOADING_BODY,
    errorTitle: UI_RELEASE_ROUTE_STATUS_ERROR_TITLE,
    errorMessage: UI_RELEASE_ROUTE_STATUS_ERROR_BODY,
    retryLabel: UI_RELEASE_STATUS_ACTION_RETRY,
    onRetry: handleRouteRetry,
  })

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_RELEASES} subtitle={UI_PAGE_SUBTITLE_RELEASES} />
      <RouteStatus {...routeStatus.routeStatusProps} />
      {routeStatus.canRenderContent ? (
        <ReleasesPanel
          client={client}
          releases={releasesTable.rows}
          showPanelHeader={false}
          selectedTenantId={selectedTenantId}
          tenantOptions={tenantOptions}
          showTenantFilter={showTenantFilter}
          onTenantChange={handleTenantChange}
          selectedProductId={selectedProductId}
          productOptions={productOptions}
          onProductChange={handleProductChange}
          searchTerm={releasesTable.searchTerm}
          onSearchChange={releasesTable.setSearchTerm}
          channelFilter={channelFilter}
          onChannelFilterChange={handleChannelChange}
          page={releasesTable.page}
          totalPages={releasesTable.totalPages}
          onPageChange={releasesTable.goToPage}
          pageSize={releasesTable.pageSize}
          onPageSizeChange={releasesTable.setPageSize}
          sortState={releasesTable.sortState}
          onSortChange={releasesTable.onSort}
          allowCreate={allowCreate}
          allowPromote={allowPromote}
          allowDelete={allowDelete}
          releasesLoading={showLoading}
          releasesError={showError}
          onRefresh={handleRefresh}
        />
      ) : null}
    </Page>
  )
}
