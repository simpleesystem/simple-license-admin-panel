import type { Client, User } from '@simple-license/react-sdk'
import { useAdminTenants } from '@simple-license/react-sdk'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { canCreateUser, canDeleteUser, canUpdateUser } from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_TABLE_PAGINATION_LABEL,
  UI_TABLE_PAGINATION_NEXT,
  UI_TABLE_PAGINATION_PREVIOUS,
  UI_TABLE_SEARCH_PLACEHOLDER,
  UI_USER_BUTTON_CREATE,
  UI_USER_COLUMN_HEADER_ACTIONS,
  UI_USER_COLUMN_HEADER_EMAIL,
  UI_USER_COLUMN_HEADER_ROLE,
  UI_USER_COLUMN_HEADER_STATUS,
  UI_USER_COLUMN_HEADER_USERNAME,
  UI_USER_COLUMN_HEADER_VENDOR,
  UI_USER_COLUMN_ID_ACTIONS,
  UI_USER_COLUMN_ID_EMAIL,
  UI_USER_COLUMN_ID_ROLE,
  UI_USER_COLUMN_ID_STATUS,
  UI_USER_COLUMN_ID_USERNAME,
  UI_USER_COLUMN_ID_VENDOR,
  UI_USER_EMPTY_STATE_MESSAGE,
  UI_USER_FORM_SUBMIT_CREATE,
  UI_USER_FORM_SUBMIT_UPDATE,
  UI_USER_STATUS_DELETED,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableToolbar } from '../data/TableToolbar'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSortDirection } from '../types'
import { notifyCrudError, notifyUserSuccess } from './notifications'
import { UserFormFlow } from './UserFormFlow'
import { UserRowActions } from './UserRowActions'

export type UserListItem = Pick<User, 'id' | 'username' | 'email' | 'role' | 'vendorId'> & {
  status?: string
}

type UserManagementPanelProps = {
  client: Client
  users: readonly UserListItem[]
  currentUser?: Pick<User, 'id' | 'role' | 'vendorId'>
  onRefresh?: () => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  sortState?: UiDataTableSortState
  onSortChange?: (columnId: string, direction: UiSortDirection) => void
}

export function UserManagementPanel({
  client,
  users,
  currentUser,
  onRefresh,
  page,
  totalPages,
  onPageChange,
  searchTerm,
  onSearchChange,
  sortState,
  onSortChange,
}: UserManagementPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const notificationBus = useNotificationBus()
  const canCreate = useMemo(() => canCreateUser(currentUser), [currentUser])
  const tenantsQuery = useAdminTenants(client)
  const tenantNameById = useMemo(() => {
    const tenantList = Array.isArray(tenantsQuery.data) ? tenantsQuery.data : (tenantsQuery.data?.data ?? [])
    return tenantList.reduce<Record<string, string>>((acc, tenant) => {
      acc[String(tenant.id)] = tenant.name
      return acc
    }, {})
  }, [tenantsQuery.data])

  const toolbar = (
    <TableToolbar
      start={
        <Form.Control
          type="search"
          placeholder={UI_TABLE_SEARCH_PLACEHOLDER}
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      }
      end={
        <Stack direction="row" gap="small" aria-label={UI_TABLE_PAGINATION_LABEL}>
          <Button variant={UI_BUTTON_VARIANT_SECONDARY} onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            {UI_TABLE_PAGINATION_PREVIOUS}
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant={UI_BUTTON_VARIANT_SECONDARY}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            {UI_TABLE_PAGINATION_NEXT}
          </Button>
        </Stack>
      }
    />
  )

  const columns: UiDataTableColumn<UserListItem>[] = useMemo(
    () => [
      {
        id: UI_USER_COLUMN_ID_USERNAME,
        header: UI_USER_COLUMN_HEADER_USERNAME,
        cell: (row) => row.username,
        sortable: true,
      },
      {
        id: UI_USER_COLUMN_ID_EMAIL,
        header: UI_USER_COLUMN_HEADER_EMAIL,
        cell: (row) => row.email,
        sortable: true,
      },
      {
        id: UI_USER_COLUMN_ID_ROLE,
        header: UI_USER_COLUMN_HEADER_ROLE,
        cell: (row) => row.role ?? UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_USER_COLUMN_ID_STATUS,
        header: UI_USER_COLUMN_HEADER_STATUS,
        cell: (row) => row.status ?? UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_USER_COLUMN_ID_VENDOR,
        header: UI_USER_COLUMN_HEADER_VENDOR,
        cell: (row) => tenantNameById[row.vendorId ?? ''] ?? UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_USER_COLUMN_ID_ACTIONS,
        header: UI_USER_COLUMN_HEADER_ACTIONS,
        cell: (row) => (
          <Stack direction="row" gap="small">
            {(() => {
              const allowUpdate = canUpdateUser(currentUser, row) && currentUser?.id !== row.id
              const allowDelete =
                canDeleteUser(currentUser, row) && currentUser?.id !== row.id && row.status !== UI_USER_STATUS_DELETED
              const hasActions = allowUpdate || allowDelete
              return (
                <>
                  <UserRowActions
                    client={client}
                    user={row}
                    onEdit={(selected) => setEditingUser(selected)}
                    onCompleted={onRefresh}
                    allowUpdate={allowUpdate}
                    allowDelete={allowDelete}
                    currentUserId={currentUser?.id}
                  />
                  {hasActions ? null : UI_VALUE_PLACEHOLDER}
                </>
              )
            })()}
          </Stack>
        ),
      },
    ],
    [client, currentUser, onRefresh, tenantNameById]
  )

  const refreshWith = (action: 'create' | 'update' | 'delete') => {
    onRefresh?.()
    notifyUserSuccess(notificationBus, action)
  }

  const handleMutationError = () => {
    notifyCrudError(notificationBus)
  }

  return (
    <Stack direction="column" gap="medium">
      {canCreate ? (
        <Stack direction="row" gap="small">
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreateModal(true)}>
            {UI_USER_BUTTON_CREATE}
          </Button>
        </Stack>
      ) : null}

      <DataTable
        data={users}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_USER_EMPTY_STATE_MESSAGE}
        sortState={sortState}
        onSort={onSortChange}
        toolbar={toolbar}
      />

      <UserFormFlow
        client={client}
        mode="create"
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        submitLabel={UI_USER_FORM_SUBMIT_CREATE}
        onCompleted={onRefresh}
        onSuccess={() => refreshWith('create')}
        onError={handleMutationError}
      />

      {editingUser ? (
        <UserFormFlow
          client={client}
          mode="update"
          show={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          submitLabel={UI_USER_FORM_SUBMIT_UPDATE}
          userId={editingUser.id}
          defaultValues={{
            username: editingUser.username,
            email: editingUser.email,
            role: editingUser.role ?? undefined,
            vendor_id: editingUser.vendorId ?? undefined,
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
        />
      ) : null}
    </Stack>
  )
}
