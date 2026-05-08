import { useCallback, useMemo } from 'react'

import type { PluginRelease } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canDeleteRelease, isProductOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import { useAdminProducts, useAdminReleases, useAdminTenants } from '../../simpleLicense/hooks'
import {
  UI_PAGE_SUBTITLE_RELEASES,
  UI_PAGE_TITLE_RELEASES,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_RELEASE_COLUMN_ID_CREATED,
  UI_RELEASE_COLUMN_ID_FILE,
  UI_RELEASE_COLUMN_ID_SIZE,
  UI_RELEASE_COLUMN_ID_STATUS,
  UI_RELEASE_COLUMN_ID_VERSION,
  UI_RELEASE_FILTER_VALUE_ALL,
  UI_RELEASE_FILTER_VALUE_PRERELEASE,
  UI_RELEASE_FILTER_VALUE_STABLE,
  UI_RELEASE_TENANT_FILTER_ALL,
  UI_SORT_DESC,
} from '../../ui/constants'
import { useDataTableState } from '../../ui/data/useDataTableState'
import { useTableState } from '../../ui/data/useTableState'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiSelectOption } from '../../ui/types'
import type { ReleaseListItem } from '../../ui/workflows/ReleasesPanel'
import { ReleasesPanel } from '../../ui/workflows/ReleasesPanel'

type ReleaseFilters = {
  tenantId: string
  productId: string
  channel: string
}

export function ReleasesRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data: productsData } = useAdminProducts(client)
  const { data: tenantsData } = useAdminTenants(client)

  const tableState = useTableState<ReleaseFilters>({
    initialFilters: { tenantId: '', productId: '', channel: UI_RELEASE_FILTER_VALUE_ALL },
  })

  const selectedTenantId = tableState.filters.tenantId
  const selectedProductId = tableState.filters.productId

  const visibleProducts = useMemo(() => {
    const list = Array.isArray(productsData) ? productsData : (productsData?.data ?? [])
    return currentUser && isVendorScopedUser(currentUser)
      ? list.filter((p) => isProductOwnedByUser(currentUser, p))
      : list
  }, [productsData, currentUser])

  const tenantMap = useMemo(() => {
    const tenants = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.data ?? [])
    return new Map(tenants.map((tenant) => [tenant.id, tenant.name]))
  }, [tenantsData])

  const tenantOptions = useMemo<UiSelectOption[]>(() => {
    const tenantIds = [...new Set(visibleProducts.map((product) => product.vendorId).filter(Boolean))]
    const options = tenantIds.map((tenantId) => ({
      value: tenantId,
      label: tenantMap.get(tenantId) ?? tenantId,
    }))
    options.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
    return [{ value: '', label: UI_RELEASE_TENANT_FILTER_ALL }, ...options]
  }, [tenantMap, visibleProducts])

  const showTenantFilter = tenantOptions.length > 2

  const productOptions = useMemo<UiSelectOption[]>(() => {
    const filteredProducts = selectedTenantId
      ? visibleProducts.filter((product) => product.vendorId === selectedTenantId)
      : visibleProducts
    return filteredProducts.map((product) => ({ value: product.id, label: `${product.name} (${product.slug})` }))
  }, [selectedTenantId, visibleProducts])

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

  const allowCreate = Boolean(selectedProductId)
  const allowPromote = Boolean(selectedProductId)
  const allowDelete = currentUser ? canDeleteRelease(currentUser) : false

  const handleRefresh = () => {
    void refetchReleases()
  }

  const handleProductChange = (productId: string) => {
    tableState.setFilter('productId', productId)
    releasesTable.goToPage(1)
  }

  const handleTenantChange = (tenantId: string) => {
    tableState.setFilter('tenantId', tenantId)
    tableState.setFilter('productId', '')
    releasesTable.goToPage(1)
  }

  const handleChannelChange = (value: string) => {
    tableState.setFilter('channel', value)
    releasesTable.goToPage(1)
  }

  const showLoading = Boolean(selectedProductId) && releasesLoading
  const showError = Boolean(selectedProductId) && releasesError

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_RELEASES} subtitle={UI_PAGE_SUBTITLE_RELEASES} />
      <ReleasesPanel
        client={client}
        releases={releasesTable.rows}
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
        sortState={releasesTable.sortState}
        onSortChange={releasesTable.onSort}
        allowCreate={allowCreate}
        allowPromote={allowPromote}
        allowDelete={allowDelete}
        releasesLoading={showLoading}
        releasesError={showError}
        onRefresh={handleRefresh}
      />
    </Page>
  )
}
