import { useMemo, useState } from 'react'
import { useAdminLicenses } from '@simple-license/react-sdk'

import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { canViewLicenses, isLicenseOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import {
  UI_LICENSE_STATUS_ACTION_RETRY,
  UI_LICENSE_STATUS_ERROR_BODY,
  UI_LICENSE_STATUS_ERROR_TITLE,
  UI_LICENSE_STATUS_LOADING_BODY,
  UI_LICENSE_STATUS_LOADING_TITLE,
  UI_PAGE_SUBTITLE_LICENSES,
  UI_PAGE_TITLE_LICENSES,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { LicenseListItem } from '../../ui/workflows/LicensesPanel'
import { LicensesPanel } from '../../ui/workflows/LicensesPanel'

export function LicensesRouteComponent() {
  const client = useApiClient()
  const { currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminLicenses(client)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const licenses = useMemo<LicenseListItem[]>(() => {
    let list = Array.isArray(data) ? (data as LicenseListItem[]) : ((data?.data as LicenseListItem[]) ?? [])

    // Vendor Scoping
    if (isVendorScopedUser(currentUser)) {
      list = list.filter((license) => isLicenseOwnedByUser(currentUser, { vendorId: license.vendorId }))
    }

    // Search Filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter((license) =>
        license.customerEmail?.toLowerCase().includes(term) ||
        license.productSlug?.toLowerCase().includes(term)
      )
    }

    // Status Filtering
    if (statusFilter) {
      list = list.filter((license) => license.status === statusFilter)
    }

    return list
  }, [currentUser, data, searchTerm, statusFilter])

  const canView = canViewLicenses(currentUser ?? null)

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <Page>
      <PageHeader title={UI_PAGE_TITLE_LICENSES} subtitle={UI_PAGE_SUBTITLE_LICENSES} />

      {isLoading ? (
        <SectionStatus
          status={UI_SECTION_STATUS_LOADING}
          title={UI_LICENSE_STATUS_LOADING_TITLE}
          message={UI_LICENSE_STATUS_LOADING_BODY}
        />
      ) : null}

      {isError ? (
        <SectionStatus
          status={UI_SECTION_STATUS_ERROR}
          title={UI_LICENSE_STATUS_ERROR_TITLE}
          message={UI_LICENSE_STATUS_ERROR_BODY}
          actions={
            <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
              {UI_LICENSE_STATUS_ACTION_RETRY}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && canView ? (
        <LicensesPanel
          client={client}
          licenses={licenses}
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
