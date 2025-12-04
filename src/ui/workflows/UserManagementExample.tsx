import type { Client, User } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'
import { useMemo, useState } from 'react'

import {
  UI_BUTTON_VARIANT_GHOST,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_USER_BUTTON_CREATE,
  UI_USER_BUTTON_EDIT,
  UI_USER_COLUMN_HEADER_ACTIONS,
  UI_USER_COLUMN_HEADER_EMAIL,
  UI_USER_COLUMN_HEADER_ROLE,
  UI_USER_COLUMN_HEADER_USERNAME,
  UI_USER_COLUMN_HEADER_VENDOR,
  UI_USER_COLUMN_ID_ACTIONS,
  UI_USER_COLUMN_ID_EMAIL,
  UI_USER_COLUMN_ID_ROLE,
  UI_USER_COLUMN_ID_USERNAME,
  UI_USER_COLUMN_ID_VENDOR,
  UI_USER_EMPTY_STATE_MESSAGE,
  UI_USER_FORM_SUBMIT_CREATE,
  UI_USER_FORM_SUBMIT_UPDATE,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'
import { UserFormFlow } from './UserFormFlow'
import { UserRowActions } from './UserRowActions'

export type UserListItem = Pick<User, 'id' | 'username' | 'email' | 'role' | 'vendorId'>

type UserManagementExampleProps = {
  client: Client
  users: readonly UserListItem[]
  onRefresh?: () => void
}

export function UserManagementExample({ client, users, onRefresh }: UserManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)

  const columns: UiDataTableColumn<UserListItem>[] = useMemo(
    () => [
      {
        id: UI_USER_COLUMN_ID_USERNAME,
        header: UI_USER_COLUMN_HEADER_USERNAME,
        cell: (row) => row.username,
      },
      {
        id: UI_USER_COLUMN_ID_EMAIL,
        header: UI_USER_COLUMN_HEADER_EMAIL,
        cell: (row) => row.email,
      },
      {
        id: UI_USER_COLUMN_ID_ROLE,
        header: UI_USER_COLUMN_HEADER_ROLE,
        cell: (row) => row.role ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_USER_COLUMN_ID_VENDOR,
        header: UI_USER_COLUMN_HEADER_VENDOR,
        cell: (row) => row.vendorId ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_USER_COLUMN_ID_ACTIONS,
        header: UI_USER_COLUMN_HEADER_ACTIONS,
        cell: (row) => (
          <Stack direction="row" gap="small">
            <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => setEditingUser(row)}>
              {UI_USER_BUTTON_EDIT}
            </Button>
            <UserRowActions
              client={client}
              user={row}
              onEdit={(selected) => setEditingUser(selected)}
              onCompleted={onRefresh}
            />
          </Stack>
        ),
      },
    ],
    [client, onRefresh],
  )

  return (
    <Stack direction="column" gap="medium">
      <Stack direction="row" gap="small">
        <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreateModal(true)}>
          {UI_USER_BUTTON_CREATE}
        </Button>
      </Stack>

      <DataTable
        data={users}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_USER_EMPTY_STATE_MESSAGE}
      />

      <UserFormFlow
        client={client}
        mode="create"
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        submitLabel={UI_USER_FORM_SUBMIT_CREATE}
        onCompleted={onRefresh}
      />

      {editingUser ? (
        <UserFormFlow
          client={client}
          mode="update"
          show
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
        />
      ) : null}
    </Stack>
  )
}


