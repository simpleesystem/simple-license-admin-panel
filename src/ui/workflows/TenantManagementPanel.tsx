import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client, Tenant, User } from '@/simpleLicense'
import {
  canCreateTenant,
  canUpdateTenant,
  canViewTenants,
  isTenantOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_STACK_GAP_MEDIUM,
  UI_TABLE_FILTER_LABEL_STATUS,
  UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES,
  UI_TABLE_SEARCH_PLACEHOLDER,
  UI_TENANT_BUTTON_CREATE,
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
  UI_TENANT_PANEL_DESCRIPTION,
  UI_TENANT_PANEL_TITLE,
  UI_TENANT_STATUS_ACTIVE,
  UI_TENANT_STATUS_LABEL_ACTIVE,
  UI_TENANT_STATUS_LABEL_SUSPENDED,
  UI_TENANT_STATUS_SUSPENDED,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableControls } from '../data/TableControls'
import { TableFilter } from '../data/TableFilter'
import { TablePaginationFooter } from '../data/TablePaginationFooter'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSelectOption, UiSortDirection } from '../types'
import { formatTenantCreatedAt } from '../utils/formatUtils'
import { notifyCrudError, notifyTenantSuccess } from './notifications'
import { TenantFormFlow } from './TenantFormFlow'
import { TenantRowActions } from './TenantRowActions'

export type TenantListItem = Pick<Tenant, 'id' | 'name' | 'status' | 'createdAt' | 'vendorId'>

type TenantManagementPanelProps = {
  client: Client
  tenants: readonly TenantListItem[]
  currentUser?: User | null
  onRefresh?: () => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
  sortState?: UiDataTableSortState
  onSortChange?: (columnId: string, direction: UiSortDirection) => void
}

export function TenantManagementPanel({
  client,
  tenants,
  currentUser,
  onRefresh,
  page,
  totalPages,
  onPageChange,
  searchTerm = '',
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortState,
  onSortChange,
}: TenantManagementPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<TenantListItem | null>(null)
  const notificationBus = useNotificationBus()
  const isVendorScoped = isVendorScopedUser(currentUser ?? null)
  const visibleTenants = useMemo(
    () =>
      isVendorScoped
        ? tenants.filter((tenant) => isTenantOwnedByUser(currentUser ?? null, tenant as unknown as Tenant))
        : tenants,
    [currentUser, isVendorScoped, tenants]
  )
  const allowCreate = canCreateTenant(currentUser ?? null)
  const canView = canViewTenants(currentUser ?? null)

  const statusOptions: UiSelectOption[] = [
    { value: '', label: UI_TABLE_FILTER_LABEL_STATUS },
    { value: UI_TENANT_STATUS_ACTIVE, label: UI_TENANT_STATUS_LABEL_ACTIVE },
    { value: UI_TENANT_STATUS_SUSPENDED, label: UI_TENANT_STATUS_LABEL_SUSPENDED },
  ]

  const toolbar = (
    <TableControls
      search={
        onSearchChange
          ? {
              value: searchTerm,
              onChange: onSearchChange,
              placeholder: UI_TABLE_SEARCH_PLACEHOLDER,
            }
          : undefined
      }
      filters={
        onStatusFilterChange ? (
          <TableFilter
            value={statusFilter ?? ''}
            options={statusOptions}
            onChange={onStatusFilterChange}
            placeholder={UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES}
          />
        ) : null
      }
      actions={
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
        sortable: true,
      },
      {
        id: UI_TENANT_COLUMN_ID_STATUS,
        header: UI_TENANT_COLUMN_HEADER_STATUS,
        cell: (row) => row.status ?? UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_TENANT_COLUMN_ID_CREATED,
        header: UI_TENANT_COLUMN_HEADER_CREATED,
        cell: (row) => formatTenantCreatedAt(row.createdAt),
        sortable: true,
      },
      {
        id: UI_TENANT_COLUMN_ID_ACTIONS,
        header: UI_TENANT_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateTenant(currentUser ?? null, row as unknown as Tenant)) {
            return UI_VALUE_PLACEHOLDER
          }
          return (
            <TenantRowActions
              client={client}
              tenant={row as Tenant}
              onEdit={setEditingTenant}
              onCompleted={onRefresh}
              currentUser={currentUser ?? null}
            />
          )
        },
      },
    ],
    [client, currentUser, onRefresh]
  )

  const refreshWith = (action: 'create' | 'update' | 'delete') => {
    onRefresh?.()
    notifyTenantSuccess(notificationBus, action)
  }

  const handleMutationError = () => {
    notifyCrudError(notificationBus)
  }

  return (
    <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
      <PanelHeader title={UI_TENANT_PANEL_TITLE} description={UI_TENANT_PANEL_DESCRIPTION} />

      <DataTable
        data={canView ? visibleTenants : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_TENANT_EMPTY_STATE_MESSAGE}
        sortState={sortState}
        onSort={onSortChange}
        toolbar={toolbar}
        footer={<TablePaginationFooter page={page} totalPages={totalPages} onPageChange={onPageChange} />}
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
