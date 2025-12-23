import { useAdminTenants } from '@/simpleLicense'
import { useMemo, useState } from 'react'

import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/useAuth'
import { canViewTenants, isTenantOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import {
  UI_PAGE_SUBTITLE_TENANTS,
  UI_PAGE_TITLE_TENANTS,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_SORT_ASC,
  UI_TABLE_PAGE_SIZE_DEFAULT,
  UI_TENANT_STATUS_ACTION_RETRY,
  UI_TENANT_STATUS_ERROR_BODY,
  UI_TENANT_STATUS_ERROR_TITLE,
  UI_TENANT_STATUS_LOADING_BODY,
  UI_TENANT_STATUS_LOADING_TITLE,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiDataTableSortState, UiSortDirection } from '../../ui/types'
import { TenantManagementPanel } from '../../ui/workflows/TenantManagementPanel'

export function TenantsRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminTenants(client)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sortState, setSortState] = useState<UiDataTableSortState | undefined>()

  const allFilteredTenants = useMemo(() => {
    let list = Array.isArray(data) ? data : (data?.data ?? [])

    // Vendor Scoping
    if (isVendorScopedUser(currentUser)) {
      list = list.filter((tenant) => isTenantOwnedByUser(currentUser, tenant))
    }

    // Search Filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter((tenant) => tenant.name.toLowerCase().includes(term))
    }

    // Status Filtering
    if (statusFilter) {
      list = list.filter((tenant) => tenant.status === statusFilter)
    }

    // Sorting
    if (sortState) {
      list = [...list].sort((a, b) => {
        const aValue = a[sortState.columnId as keyof typeof a]
        const bValue = b[sortState.columnId as keyof typeof b]

        if (aValue === bValue) {
          return 0
        }

        // Handle null/undefined
        if (aValue === null || aValue === undefined) {
          return 1
        }
        if (bValue === null || bValue === undefined) {
          return -1
        }

        const compareResult = aValue < bValue ? -1 : 1
        return sortState.direction === UI_SORT_ASC ? compareResult : -compareResult
      })
    } else {
      // Default sort by createdAt desc if available, otherwise name asc
      list = [...list].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return a.name.localeCompare(b.name)
      })
    }

    return list
  }, [currentUser, data, searchTerm, statusFilter, sortState])

  const paginatedTenants = useMemo(() => {
    const startIndex = (page - 1) * UI_TABLE_PAGE_SIZE_DEFAULT
    return allFilteredTenants.slice(startIndex, startIndex + UI_TABLE_PAGE_SIZE_DEFAULT)
  }, [allFilteredTenants, page])

  const totalPages = Math.max(1, Math.ceil(allFilteredTenants.length / UI_TABLE_PAGE_SIZE_DEFAULT))

  const canView = canViewTenants(currentUser)

  const handleRefresh = () => {
    void refetch()
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPage(1)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const handleSort = (columnId: string, direction: UiSortDirection) => {
    setSortState({ columnId, direction })
  }

  return (
    <Page>
      <PageHeader title={UI_PAGE_TITLE_TENANTS} subtitle={UI_PAGE_SUBTITLE_TENANTS} />

      {isLoading ? (
        <SectionStatus
          status={UI_SECTION_STATUS_LOADING}
          title={UI_TENANT_STATUS_LOADING_TITLE}
          message={UI_TENANT_STATUS_LOADING_BODY}
        />
      ) : null}

      {isError ? (
        <SectionStatus
          status={UI_SECTION_STATUS_ERROR}
          title={UI_TENANT_STATUS_ERROR_TITLE}
          message={UI_TENANT_STATUS_ERROR_BODY}
          actions={
            <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
              {UI_TENANT_STATUS_ACTION_RETRY}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && canView ? (
        <TenantManagementPanel
          client={client}
          tenants={paginatedTenants}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          sortState={sortState}
          onSortChange={handleSort}
        />
      ) : null}
    </Page>
  )
}
