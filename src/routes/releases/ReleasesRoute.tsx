import { useCallback, useMemo } from 'react'

import type { PluginRelease } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canDeleteRelease, isProductOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import { useAdminProducts, useAdminReleases } from '../../simpleLicense/hooks'
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
  UI_RELEASE_STATUS_ACTION_RETRY,
  UI_RELEASE_STATUS_ERROR_BODY,
  UI_RELEASE_STATUS_ERROR_TITLE,
  UI_RELEASE_STATUS_LOADING_BODY,
  UI_RELEASE_STATUS_LOADING_TITLE,
  UI_SORT_DESC,
} from '../../ui/constants'
import { useDataTableState } from '../../ui/data/useDataTableState'
import { useTableState } from '../../ui/data/useTableState'
import { RouteStatus } from '../../ui/feedback/RouteStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiSelectOption } from '../../ui/types'
import type { ReleaseListItem } from '../../ui/workflows/ReleasesPanel'
import { ReleasesPanel } from '../../ui/workflows/ReleasesPanel'

type ReleaseFilters = {
  productId: string
  channel: string
}

export function ReleasesRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data: productsData } = useAdminProducts(client)

  const tableState = useTableState<ReleaseFilters>({
    initialFilters: { productId: '', channel: UI_RELEASE_FILTER_VALUE_ALL },
  })

  const selectedProductId = tableState.filters.productId

  const productOptions = useMemo<UiSelectOption[]>(() => {
    const list = Array.isArray(productsData) ? productsData : (productsData?.data ?? [])
    const filtered =
      currentUser && isVendorScopedUser(currentUser) ? list.filter((p) => isProductOwnedByUser(currentUser, p)) : list
    return filtered.map((p) => ({ value: p.id, label: `${p.name} (${p.slug})` }))
  }, [productsData, currentUser])

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

  const handleChannelChange = (value: string) => {
    tableState.setFilter('channel', value)
    releasesTable.goToPage(1)
  }

  const showLoading = Boolean(selectedProductId) && releasesLoading
  const showError = Boolean(selectedProductId) && releasesError

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_RELEASES} subtitle={UI_PAGE_SUBTITLE_RELEASES} />

      <RouteStatus
        isLoading={showLoading}
        isError={showError}
        loadingTitle={UI_RELEASE_STATUS_LOADING_TITLE}
        loadingMessage={UI_RELEASE_STATUS_LOADING_BODY}
        errorTitle={UI_RELEASE_STATUS_ERROR_TITLE}
        errorMessage={UI_RELEASE_STATUS_ERROR_BODY}
        retryLabel={UI_RELEASE_STATUS_ACTION_RETRY}
        onRetry={handleRefresh}
      />

      {!showLoading && !showError ? (
        <ReleasesPanel
          client={client}
          releases={releasesTable.rows}
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
          onRefresh={handleRefresh}
        />
      ) : null}
    </Page>
  )
}
