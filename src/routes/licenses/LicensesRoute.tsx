import { useAdminLicenses } from '@simple-license/react-sdk'
import type { LicenseStatus } from '@simple-license/react-sdk'
import { useMemo } from 'react'

import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { canViewLicenses, isLicenseOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import {
  UI_LICENSE_COLUMN_HEADER_ACTIONS,
  UI_LICENSE_COLUMN_HEADER_CUSTOMER,
  UI_LICENSE_COLUMN_HEADER_PRODUCT,
  UI_LICENSE_COLUMN_HEADER_STATUS,
  UI_LICENSE_COLUMN_HEADER_TIER,
  UI_LICENSE_COLUMN_ID_ACTIONS,
  UI_LICENSE_COLUMN_ID_CUSTOMER,
  UI_LICENSE_COLUMN_ID_PRODUCT,
  UI_LICENSE_COLUMN_ID_STATUS,
  UI_LICENSE_COLUMN_ID_TIER,
  UI_LICENSE_EMPTY_STATE_MESSAGE,
  UI_LICENSE_STATUS_ACTION_RETRY,
  UI_LICENSE_STATUS_ERROR_BODY,
  UI_LICENSE_STATUS_ERROR_TITLE,
  UI_LICENSE_STATUS_LOADING_BODY,
  UI_LICENSE_STATUS_LOADING_TITLE,
  UI_LICENSE_STATUS_ACTIVE,
  UI_LICENSE_STATUS_SUSPENDED,
  UI_LICENSE_STATUS_REVOKED,
  UI_PAGE_SUBTITLE_LICENSES,
  UI_PAGE_TITLE_LICENSES,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_VALUE_PLACEHOLDER,
} from '../../ui/constants'
import { DataTable } from '../../ui/data/DataTable'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiDataTableColumn } from '../../ui/types'
import { LicenseRowActions } from '../../ui/workflows/LicenseRowActions'

type LicenseListItem = {
  id: string
  customerEmail?: string | null
  productSlug?: string | null
  tierCode?: string | null
  status?: string | null
  vendorId?: string | null
}

const VALID_LICENSE_STATUSES: readonly LicenseStatus[] = [
  UI_LICENSE_STATUS_ACTIVE,
  UI_LICENSE_STATUS_SUSPENDED,
  UI_LICENSE_STATUS_REVOKED,
]

export const normalizeLicenseStatus = (status: unknown): LicenseStatus => {
  if (VALID_LICENSE_STATUSES.includes(status as LicenseStatus)) {
    return status as LicenseStatus
  }
  return UI_LICENSE_STATUS_ACTIVE
}

export function LicensesRouteComponent() {
  const client = useApiClient()
  const { currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminLicenses(client)

  const licenses = useMemo<LicenseListItem[]>(() => {
    const list = Array.isArray(data) ? (data as LicenseListItem[]) : ((data?.data as LicenseListItem[]) ?? [])
    if (!isVendorScopedUser(currentUser)) {
      return list
    }
    return list.filter((license) => isLicenseOwnedByUser(currentUser, { vendorId: license.vendorId }))
  }, [currentUser, data])

  const canView = canViewLicenses(currentUser ?? null)

  const columns: UiDataTableColumn<LicenseListItem>[] = useMemo(
    () => [
      {
        id: UI_LICENSE_COLUMN_ID_CUSTOMER,
        header: UI_LICENSE_COLUMN_HEADER_CUSTOMER,
        cell: (row) => row.customerEmail ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_LICENSE_COLUMN_ID_PRODUCT,
        header: UI_LICENSE_COLUMN_HEADER_PRODUCT,
        cell: (row) => row.productSlug ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_LICENSE_COLUMN_ID_TIER,
        header: UI_LICENSE_COLUMN_HEADER_TIER,
        cell: (row) => row.tierCode ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_LICENSE_COLUMN_ID_STATUS,
        header: UI_LICENSE_COLUMN_HEADER_STATUS,
        cell: (row) => row.status ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_LICENSE_COLUMN_ID_ACTIONS,
        header: UI_LICENSE_COLUMN_HEADER_ACTIONS,
        cell: (row) => (
          <LicenseRowActions
            client={client}
            licenseId={row.id}
            licenseVendorId={row.vendorId}
            licenseStatus={normalizeLicenseStatus(row.status)}
            currentUser={currentUser}
            onCompleted={() => {
              void refetch()
            }}
          />
        ),
      },
    ],
    [client, currentUser, refetch]
  )

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
        <DataTable
          data={licenses}
          columns={columns}
          rowKey={(row) => row.id}
          emptyState={UI_LICENSE_EMPTY_STATE_MESSAGE}
        />
      ) : null}
    </Page>
  )
}
