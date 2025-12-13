import type { Client, LicenseStatus, User } from '@simple-license/react-sdk'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import {
  canCreateLicense,
  canUpdateLicense,
  canViewLicenses,
  isLicenseOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_LICENSE_BUTTON_CREATE,
  UI_LICENSE_BUTTON_EDIT,
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
  UI_LICENSE_FORM_SUBMIT_CREATE,
  UI_LICENSE_FORM_SUBMIT_UPDATE,
  UI_LICENSE_STATUS_ACTIVE,
  UI_LICENSE_STATUS_REVOKED,
  UI_LICENSE_STATUS_SUSPENDED,
  UI_TABLE_SEARCH_PLACEHOLDER,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableFilter } from '../data/TableFilter'
import { TableToolbar } from '../data/TableToolbar'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiSelectOption } from '../types'
import { LicenseFormFlow } from './LicenseFormFlow'
import { LicenseRowActions } from './LicenseRowActions'
import { notifyCrudError, notifyLicenseSuccess } from './notifications'

export type LicenseListItem = {
  id: string
  customerEmail?: string | null
  productSlug?: string | null
  tierCode?: string | null
  status?: string | null
  vendorId?: string | null
}

type LicensesPanelProps = {
  client: Client
  licenses: readonly LicenseListItem[]
  currentUser?: User | null
  onRefresh?: () => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
}

const VALID_LICENSE_STATUSES: readonly LicenseStatus[] = [
  UI_LICENSE_STATUS_ACTIVE,
  UI_LICENSE_STATUS_SUSPENDED,
  UI_LICENSE_STATUS_REVOKED,
]

const normalizeLicenseStatus = (status: unknown): LicenseStatus => {
  if (VALID_LICENSE_STATUSES.includes(status as LicenseStatus)) {
    return status as LicenseStatus
  }
  return UI_LICENSE_STATUS_ACTIVE
}

export function LicensesPanel({
  client,
  licenses,
  currentUser,
  onRefresh,
  searchTerm = '',
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: LicensesPanelProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingLicense, setEditingLicense] = useState<LicenseListItem | null>(null)
  const notificationBus = useNotificationBus()

  const isVendorScoped = isVendorScopedUser(currentUser)
  const visibleLicenses = useMemo(
    () => (isVendorScoped ? licenses.filter((license) => isLicenseOwnedByUser(currentUser, { vendorId: license.vendorId })) : licenses),
    [currentUser, isVendorScoped, licenses]
  )
  const allowCreate = canCreateLicense(currentUser)
  const canView = canViewLicenses(currentUser)

  const statusOptions: UiSelectOption[] = [
    { value: '', label: 'Filter by Status' },
    { value: UI_LICENSE_STATUS_ACTIVE, label: 'Active' },
    { value: UI_LICENSE_STATUS_SUSPENDED, label: 'Suspended' },
    { value: UI_LICENSE_STATUS_REVOKED, label: 'Revoked' },
  ]

  const toolbar = (
    <TableToolbar
      start={
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {onSearchChange ? (
            <Form.Control
              type="search"
              placeholder={UI_TABLE_SEARCH_PLACEHOLDER}
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              style={{ maxWidth: '300px' }}
            />
          ) : null}
          {onStatusFilterChange ? (
            <TableFilter
              value={statusFilter ?? ''}
              options={statusOptions}
              onChange={onStatusFilterChange}
              placeholder="All Statuses"
            />
          ) : null}
        </div>
      }
      end={
        allowCreate ? (
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreate(true)}>
            {UI_LICENSE_BUTTON_CREATE}
          </Button>
        ) : null
      }
    />
  )

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
          <Stack direction="row" gap="small">
            {canUpdateLicense(currentUser, { vendorId: row.vendorId }) ? (
              <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => setEditingLicense(row)}>
                {UI_LICENSE_BUTTON_EDIT}
              </Button>
            ) : null}
            <LicenseRowActions
              client={client}
              licenseId={row.id}
              licenseVendorId={row.vendorId}
              licenseStatus={normalizeLicenseStatus(row.status)}
              currentUser={currentUser}
              onCompleted={() => {
                onRefresh?.()
              }}
            />
          </Stack>
        ),
      },
    ],
    [client, currentUser, onRefresh]
  )

  const refreshWith = (action: 'create' | 'update' | 'delete' | 'suspend' | 'resume') => {
    onRefresh?.()
    notifyLicenseSuccess(notificationBus, action)
  }

  const handleMutationError = () => {
    notifyCrudError(notificationBus)
  }

  return (
    <Stack direction="column" gap="medium">
      <DataTable
        data={canView ? visibleLicenses : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_LICENSE_EMPTY_STATE_MESSAGE}
        toolbar={toolbar}
      />

      {allowCreate ? (
        <LicenseFormFlow
          client={client}
          mode="create"
          show={showCreate}
          onClose={() => setShowCreate(false)}
          submitLabel={UI_LICENSE_FORM_SUBMIT_CREATE}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('create')}
          onError={handleMutationError}
        />
      ) : null}

      {editingLicense ? (
        <LicenseFormFlow
          client={client}
          mode="update"
          show={Boolean(editingLicense)}
          onClose={() => setEditingLicense(null)}
          submitLabel={UI_LICENSE_FORM_SUBMIT_UPDATE}
          licenseId={editingLicense.id}
          licenseVendorId={editingLicense.vendorId}
          defaultValues={{
            customer_email: editingLicense.customerEmail ?? undefined,
            tier_code: editingLicense.tierCode ?? undefined,
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
        />
      ) : null}
    </Stack>
  )
}

