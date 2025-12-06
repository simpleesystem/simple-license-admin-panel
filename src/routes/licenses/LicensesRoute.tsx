import { useMemo } from 'react'
import { useAdminLicenses } from '@simple-license/react-sdk'

import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { canViewLicenses, isLicenseOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import {
  UI_LICENSE_ACTIONS_COLUMN,
  UI_LICENSE_COLUMN_HEADER_CUSTOMER,
  UI_LICENSE_COLUMN_HEADER_PRODUCT,
  UI_LICENSE_COLUMN_HEADER_STATUS,
  UI_LICENSE_COLUMN_HEADER_TIER,
  UI_LICENSE_EMPTY_STATE_MESSAGE,
  UI_LICENSE_STATUS_ACTION_RETRY,
  UI_LICENSE_STATUS_ERROR_BODY,
  UI_LICENSE_STATUS_ERROR_TITLE,
  UI_LICENSE_STATUS_LOADING_BODY,
  UI_LICENSE_STATUS_LOADING_TITLE,
  UI_PAGE_SUBTITLE_LICENSES,
  UI_PAGE_TITLE_LICENSES,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_VALUE_PLACEHOLDER,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { DataTable } from '../../ui/data/DataTable'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { LicenseRowActions } from '../../ui/workflows/LicenseRowActions'
import type { UiDataTableColumn } from '../../ui/types'

type LicenseListItem = {
  id: string
  customerEmail?: string | null
  productSlug?: string | null
  tierCode?: string | null
  status?: string | null
  vendorId?: string | null
}

export function LicensesRouteComponent() {
  const client = useApiClient()
  const { currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminLicenses(client)

  const licenses = useMemo<LicenseListItem[]>(() => {
    const list = Array.isArray(data) ? (data as LicenseListItem[]) : (data?.data as LicenseListItem[]) ?? []
    if (!isVendorScopedUser(currentUser)) {
      return list
    }
    return list.filter((license) => isLicenseOwnedByUser(currentUser, { vendorId: license.vendorId }))
  }, [currentUser, data])

  const canView = canViewLicenses(currentUser ?? null)

  const columns: UiDataTableColumn<LicenseListItem>[] = useMemo(
    () => [
      {
        id: UI_LICENSE_COLUMN_HEADER_CUSTOMER,
        header: UI_LICENSE_COLUMN_HEADER_CUSTOMER,
        cell: (row) => row.customerEmail ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_LICENSE_COLUMN_HEADER_PRODUCT,
        header: UI_LICENSE_COLUMN_HEADER_PRODUCT,
        cell: (row) => row.productSlug ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_LICENSE_COLUMN_HEADER_TIER,
        header: UI_LICENSE_COLUMN_HEADER_TIER,
        cell: (row) => row.tierCode ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_LICENSE_COLUMN_HEADER_STATUS,
        header: UI_LICENSE_COLUMN_HEADER_STATUS,
        cell: (row) => row.status ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_LICENSE_ACTIONS_COLUMN,
        header: UI_LICENSE_ACTIONS_COLUMN,
        cell: (row) => (
          <LicenseRowActions
            client={client}
            licenseId={row.id}
            licenseVendorId={row.vendorId}
            licenseStatus={(row.status as never) ?? 'ACTIVE'}
            currentUser={currentUser}
            onCompleted={() => {
              void refetch()
            }}
          />
        ),
      },
    ],
    [client, currentUser, refetch],
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

