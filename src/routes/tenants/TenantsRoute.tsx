import { useCallback, useMemo } from 'react'
import type { Tenant } from '@/simpleLicense'
import { useAdminTenants } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canViewTenants, isTenantOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import {
  UI_PAGE_SUBTITLE_TENANTS,
  UI_PAGE_TITLE_TENANTS,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_SORT_DESC,
  UI_TENANT_COLUMN_ID_CREATED,
  UI_TENANT_COLUMN_ID_NAME,
  UI_TENANT_COLUMN_ID_STATUS,
  UI_TENANT_STATUS_ACTION_RETRY,
  UI_TENANT_STATUS_ERROR_BODY,
  UI_TENANT_STATUS_ERROR_TITLE,
  UI_TENANT_STATUS_LOADING_BODY,
  UI_TENANT_STATUS_LOADING_TITLE,
} from '../../ui/constants'
import { useDataTableState } from '../../ui/data/useDataTableState'
import { useTableState } from '../../ui/data/useTableState'
import { RouteStatus } from '../../ui/feedback/RouteStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { TenantListItem } from '../../ui/workflows/TenantManagementPanel'
import { TenantManagementPanel } from '../../ui/workflows/TenantManagementPanel'

export function TenantsRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminTenants(client)
  const tableState = useTableState({
    initialFilters: {
      status: '',
    },
  })

  const visibleTenants = useMemo<TenantListItem[]>(() => {
    let list: TenantListItem[] = Array.isArray(data) ? data : (data?.data ?? [])
    if (isVendorScopedUser(currentUser)) {
      list = list.filter((tenant) => isTenantOwnedByUser(currentUser, tenant as unknown as Tenant))
    }
    return list
  }, [currentUser, data])

  const searchTenants = useCallback(
    (tenant: TenantListItem, term: string) => tenant.name.toLowerCase().includes(term.toLowerCase()),
    []
  )

  const compareText = useCallback(
    (getValue: (tenant: TenantListItem) => string | null | undefined) => (a: TenantListItem, b: TenantListItem) =>
      (getValue(a) ?? '').localeCompare(getValue(b) ?? '', undefined, { numeric: true, sensitivity: 'base' }),
    []
  )

  const sortComparators = useMemo(
    () => ({
      [UI_TENANT_COLUMN_ID_NAME]: compareText((tenant) => tenant.name),
      [UI_TENANT_COLUMN_ID_STATUS]: compareText((tenant) => tenant.status),
      [UI_TENANT_COLUMN_ID_CREATED]: (a: TenantListItem, b: TenantListItem) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return aTime - bTime
      },
    }),
    [compareText]
  )

  const tenantTable = useDataTableState({
    data: visibleTenants,
    initialSort: { columnId: UI_TENANT_COLUMN_ID_CREATED, direction: UI_SORT_DESC },
    search: searchTenants,
    filter: (tenant) => !tableState.filters.status || tenant.status === tableState.filters.status,
    sortComparators,
  })

  const canView = canViewTenants(currentUser)

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_TENANTS} subtitle={UI_PAGE_SUBTITLE_TENANTS} />

      <RouteStatus
        isLoading={isLoading}
        isError={isError}
        loadingTitle={UI_TENANT_STATUS_LOADING_TITLE}
        loadingMessage={UI_TENANT_STATUS_LOADING_BODY}
        errorTitle={UI_TENANT_STATUS_ERROR_TITLE}
        errorMessage={UI_TENANT_STATUS_ERROR_BODY}
        retryLabel={UI_TENANT_STATUS_ACTION_RETRY}
        onRetry={handleRefresh}
      />

      {!isLoading && !isError && canView ? (
        <TenantManagementPanel
          client={client}
          tenants={tenantTable.rows}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
          searchTerm={tenantTable.searchTerm}
          onSearchChange={tenantTable.setSearchTerm}
          statusFilter={tableState.filters.status}
          onStatusFilterChange={(value) => {
            tableState.setFilter('status', value)
            tenantTable.goToPage(1)
          }}
          page={tenantTable.page}
          totalPages={tenantTable.totalPages}
          onPageChange={tenantTable.goToPage}
          sortState={tenantTable.sortState}
          onSortChange={tenantTable.onSort}
        />
      ) : null}
    </Page>
  )
}
