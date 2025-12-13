import { useMemo, useState } from 'react'
import { useAdminUsers } from '@simple-license/react-sdk'

import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { canViewUsers, isVendorScopedUser } from '../../app/auth/permissions'
import {
  UI_PAGE_SUBTITLE_USERS,
  UI_PAGE_TITLE_USERS,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_TABLE_PAGE_SIZE_DEFAULT,
  UI_USER_STATUS_ACTION_RETRY,
  UI_USER_STATUS_ERROR_BODY,
  UI_USER_STATUS_ERROR_TITLE,
  UI_USER_STATUS_LOADING_BODY,
  UI_USER_STATUS_LOADING_TITLE,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { UserManagementPanel } from '../../ui/workflows/UserManagementPanel'
import type { UiDataTableSortState, UiSortDirection } from '../../ui/types'

export function UsersRouteComponent() {
  const client = useApiClient()
  const { currentUser } = useAuth()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortState, setSortState] = useState<UiDataTableSortState | undefined>()
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')

  const filters = useMemo(() => {
    const baseParams = {
      page,
      limit: UI_TABLE_PAGE_SIZE_DEFAULT,
      search: searchTerm || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
    }
    if (isVendorScopedUser(currentUser) && currentUser?.vendorId) {
      return { ...baseParams, vendor_id: currentUser.vendorId }
    }
    return { ...baseParams, vendor_id: vendorFilter || undefined }
  }, [currentUser, page, searchTerm, roleFilter, statusFilter, vendorFilter])

  const { data, isLoading, isError, refetch } = useAdminUsers(client, filters)

  const users = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list
  }, [data])

  const totalPages = useMemo(() => {
    if (Array.isArray(data)) return 1
    return data?.pagination?.totalPages ?? 1
  }, [data])

  const canView = canViewUsers(currentUser)

  const handleRefresh = () => {
    void refetch()
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPage(1)
  }

  const handleFilterChange = (setter: (val: string) => void) => (val: string) => {
    setter(val)
    setPage(1)
  }

  const handleSort = (columnId: string, direction: UiSortDirection) => {
    setSortState({ columnId, direction })
    // TODO: Pass sort params to API when supported
  }

  return (
    <Page>
      <PageHeader title={UI_PAGE_TITLE_USERS} subtitle={UI_PAGE_SUBTITLE_USERS} />

      {isLoading ? (
        <SectionStatus
          status={UI_SECTION_STATUS_LOADING}
          title={UI_USER_STATUS_LOADING_TITLE}
          message={UI_USER_STATUS_LOADING_BODY}
        />
      ) : null}

      {isError ? (
        <SectionStatus
          status={UI_SECTION_STATUS_ERROR}
          title={UI_USER_STATUS_ERROR_TITLE}
          message={UI_USER_STATUS_ERROR_BODY}
          actions={
            <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
              {UI_USER_STATUS_ACTION_RETRY}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && canView ? (
        <UserManagementPanel
          client={client}
          users={users}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          sortState={sortState}
          onSortChange={handleSort}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          vendorFilter={vendorFilter}
          onRoleFilterChange={handleFilterChange(setRoleFilter)}
          onStatusFilterChange={handleFilterChange(setStatusFilter)}
          onVendorFilterChange={handleFilterChange(setVendorFilter)}
        />
      ) : null}
    </Page>
  )
}
