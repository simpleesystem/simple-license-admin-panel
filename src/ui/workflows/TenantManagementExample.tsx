import type { Client, Tenant, User } from '@simple-license/react-sdk'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import {
  canCreateTenant,
  canUpdateTenant,
  canViewTenants,
  isTenantOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_FORMAT_OPTIONS,
  UI_TABLE_SEARCH_PLACEHOLDER,
  UI_TENANT_BUTTON_CREATE,
  UI_TENANT_BUTTON_EDIT,
  UI_TENANT_COLUMN_HEADER_ACTIONS,
  UI_TENANT_COLUMN_HEADER_CREATED,
  UI_TENANT_COLUMN_HEADER_NAME,
  UI_TENANT_COLUMN_HEADER_STATUS,
  UI_TENANT_COLUMN_ID_ACTIONS,
  UI_TENANT_COLUMN_ID_CREATED,
  UI_TENANT_COLUMN_ID_NAME,
  UI_TENANT_COLUMN_ID_STATUS,
  UI_TENANT_EMPTY_STATE_MESSAGE,
  UI_TENANT_FORM_SUBMIT_CREATE,
  UI_TENANT_FORM_SUBMIT_UPDATE,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableFilter } from '../data/TableFilter'
import { TableToolbar } from '../data/TableToolbar'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiSelectOption } from '../types'
import { notifyCrudError, notifyTenantSuccess } from './notifications'
import { TenantFormFlow } from './TenantFormFlow'
import { TenantRowActions } from './TenantRowActions'

export type TenantListItem = Pick<Tenant, 'id' | 'name' | 'status' | 'createdAt' | 'vendorId'>

type TenantManagementExampleProps = {
  client: Client
  tenants: readonly TenantListItem[]
  currentUser?: User | null
  onRefresh?: () => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
}

export const formatTenantCreatedAt = (createdAt: TenantListItem['createdAt'] | undefined): string => {
  if (!createdAt) {
    return UI_VALUE_PLACEHOLDER
  }
  const parsedDate = new Date(createdAt)
  if (Number.isNaN(parsedDate.getTime())) {
    return UI_VALUE_PLACEHOLDER
  }
  return new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS).format(parsedDate)
}

export function TenantManagementExample({
  client,
  tenants,
  currentUser,
  onRefresh,
  searchTerm = '',
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: TenantManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<TenantListItem | null>(null)
  const notificationBus = useNotificationBus()
  const isVendorScoped = isVendorScopedUser(currentUser)
  const visibleTenants = useMemo(
    () => (isVendorScoped ? tenants.filter((tenant) => isTenantOwnedByUser(currentUser, tenant)) : tenants),
    [currentUser, isVendorScoped, tenants]
  )
  const allowCreate = canCreateTenant(currentUser)

  const statusOptions: UiSelectOption[] = [
    { value: '', label: 'Filter by Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
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
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreateModal(true)}>
            {UI_TENANT_BUTTON_CREATE}
          </Button>
        ) : null
      }
    />
  )

  const columns: UiDataTableColumn<TenantListItem>[] = useMemo(
    () => [
      {
        id: UI_TENANT_COLUMN_ID_NAME,
        header: UI_TENANT_COLUMN_HEADER_NAME,
        cell: (row) => row.name,
      },
      {
        id: UI_TENANT_COLUMN_ID_STATUS,
        header: UI_TENANT_COLUMN_HEADER_STATUS,
        cell: (row) => row.status ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_TENANT_COLUMN_ID_CREATED,
        header: UI_TENANT_COLUMN_HEADER_CREATED,
        cell: (row) => formatTenantCreatedAt(row.createdAt),
      },
      {
        id: UI_TENANT_COLUMN_ID_ACTIONS,
        header: UI_TENANT_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateTenant(currentUser, row)) {
            return null
          }
          return (
            <Stack direction="row" gap="small">
              <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => setEditingTenant(row)}>
                {UI_TENANT_BUTTON_EDIT}
              </Button>
              <TenantRowActions
                client={client}
                tenant={row as Tenant}
                onEdit={setEditingTenant}
                onCompleted={onRefresh}
                currentUser={currentUser ?? null}
              />
            </Stack>
          )
        },
      },
    ],
    [client, currentUser, onRefresh]
  )

  const canView = canViewTenants(currentUser)

  const refreshWith = (action: 'create' | 'update' | 'delete') => {
    onRefresh?.()
    notifyTenantSuccess(notificationBus, action)
  }

  const handleMutationError = () => {
    notifyCrudError(notificationBus)
  }

  return (
    <Stack direction="column" gap="medium">
      <DataTable
        data={canView ? visibleTenants : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_TENANT_EMPTY_STATE_MESSAGE}
        toolbar={toolbar}
      />

      {allowCreate ? (
        <TenantFormFlow
          client={client}
          mode="create"
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          submitLabel={UI_TENANT_FORM_SUBMIT_CREATE}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('create')}
          onError={handleMutationError}
        />
      ) : null}

      {editingTenant ? (
        <TenantFormFlow
          client={client}
          mode="update"
          show={Boolean(editingTenant)}
          onClose={() => setEditingTenant(null)}
          submitLabel={UI_TENANT_FORM_SUBMIT_UPDATE}
          tenantId={editingTenant.id}
          defaultValues={{
            name: editingTenant.name,
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
        />
      ) : null}
    </Stack>
  )
}
