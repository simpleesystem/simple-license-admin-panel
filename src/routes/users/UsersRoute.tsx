import { useMemo } from 'react'
import { useAdminUsers } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canViewUsers, isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import {
  UI_PAGE_SUBTITLE_USERS,
  UI_PAGE_TITLE_USERS,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_TABLE_PAGE_SIZE_DEFAULT,
  UI_USER_STATUS_ACTION_RETRY,
  UI_USER_STATUS_ERROR_BODY,
  UI_USER_STATUS_ERROR_TITLE,
  UI_USER_STATUS_LOADING_BODY,
  UI_USER_STATUS_LOADING_TITLE,
} from '../../ui/constants'
import { useTableState } from '../../ui/data/useTableState'
import { RouteStatus } from '../../ui/feedback/RouteStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { UserManagementPanel } from '../../ui/workflows/UserManagementPanel'

export function UsersRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const tableState = useTableState({
    initialFilters: {
      role: '',
      status: '',
      vendorId: '',
    },
  })

  const filters = useMemo(() => {
    const baseParams = {
      page: tableState.page,
      limit: UI_TABLE_PAGE_SIZE_DEFAULT,
      search: tableState.searchTerm || undefined,
      role: tableState.filters.role || undefined,
      status: tableState.filters.status || undefined,
    }
    if (isVendorScopedUser(currentUser) && currentUser?.vendorId) {
      return { ...baseParams, vendor_id: currentUser.vendorId }
    }
    return { ...baseParams, vendor_id: tableState.filters.vendorId || undefined }
  }, [currentUser, tableState.filters, tableState.page, tableState.searchTerm])

  const { data, isLoading, isError, refetch } = useAdminUsers(client, filters)

  const users = useMemo(() => {
    const list = Array.isArray(data) ? data : (data?.data ?? [])
    return list
  }, [data])

  const totalPages = useMemo(() => {
    if (Array.isArray(data)) {
      return 1
    }
    return data?.pagination?.totalPages ?? 1
  }, [data])

  const canView = canViewUsers(currentUser)

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_USERS} subtitle={UI_PAGE_SUBTITLE_USERS} />

      <RouteStatus
        isLoading={isLoading}
        isError={isError}
        loadingTitle={UI_USER_STATUS_LOADING_TITLE}
        loadingMessage={UI_USER_STATUS_LOADING_BODY}
        errorTitle={UI_USER_STATUS_ERROR_TITLE}
        errorMessage={UI_USER_STATUS_ERROR_BODY}
        retryLabel={UI_USER_STATUS_ACTION_RETRY}
        onRetry={handleRefresh}
      />

      {!isLoading && !isError && canView ? (
        <UserManagementPanel
          client={client}
          users={users}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
          page={tableState.page}
          totalPages={totalPages}
          onPageChange={tableState.setPage}
          searchTerm={tableState.searchTerm}
          onSearchChange={tableState.setSearchTerm}
          sortState={tableState.sortState}
          onSortChange={tableState.setSortState}
          roleFilter={tableState.filters.role}
          statusFilter={tableState.filters.status}
          vendorFilter={tableState.filters.vendorId}
          onRoleFilterChange={(value) => tableState.setFilter('role', value)}
          onStatusFilterChange={(value) => tableState.setFilter('status', value)}
          onVendorFilterChange={(value) => tableState.setFilter('vendorId', value)}
        />
      ) : null}
    </Page>
  )
}
