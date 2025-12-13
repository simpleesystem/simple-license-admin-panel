import { useMemo, useState } from 'react'
import { useAdminTenants } from '@simple-license/react-sdk'

import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { canViewTenants, isTenantOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import {
  UI_PAGE_SUBTITLE_TENANTS,
  UI_PAGE_TITLE_TENANTS,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_TENANT_STATUS_ACTION_RETRY,
  UI_TENANT_STATUS_ERROR_BODY,
  UI_TENANT_STATUS_ERROR_TITLE,
  UI_TENANT_STATUS_LOADING_BODY,
  UI_TENANT_STATUS_LOADING_TITLE,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { TenantManagementExample } from '../../ui/workflows/TenantManagementExample'

export function TenantsRouteComponent() {
  const client = useApiClient()
  const { currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminTenants(client)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const tenants = useMemo(() => {
    let list = Array.isArray(data) ? data : data?.data ?? []

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

    return list
  }, [currentUser, data, searchTerm, statusFilter])

  const canView = canViewTenants(currentUser)

  const handleRefresh = () => {
    void refetch()
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
        <TenantManagementExample
          client={client}
          tenants={tenants}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      ) : null}
    </Page>
  )
}

