import type { Client, User } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'
import { useMemo, useState } from 'react'

import { Stack } from '../layout/Stack'
import { DataTable } from '../data/DataTable'
import type { UiDataTableColumn } from '../types'
import { UserFormFlow } from './UserFormFlow'
import { UserRowActions } from './UserRowActions'

export type UserListItem = Pick<User, 'id' | 'username' | 'email' | 'role' | 'vendorId'>

type UserManagementExampleProps = {
  client: Client
  users: readonly UserListItem[]
}

export function UserManagementExample({ client, users }: UserManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)

  const columns: UiDataTableColumn<UserListItem>[] = useMemo(
    () => [
      {
        id: 'username',
        header: 'Username',
        cell: (row) => row.username,
      },
      {
        id: 'email',
        header: 'Email',
        cell: (row) => row.email,
      },
      {
        id: 'role',
        header: 'Role',
        cell: (row) => row.role ?? '—',
      },
      {
        id: 'vendor',
        header: 'Vendor',
        cell: (row) => row.vendorId ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (row) => (
          <Stack direction="row" gap="small">
            <Button variant="link" onClick={() => setEditingUser(row)}>
              Edit
            </Button>
            <UserRowActions
              client={client}
              user={row}
              onEdit={(selected) => setEditingUser(selected)}
            />
          </Stack>
        ),
      },
    ],
    [client],
  )

  return (
    <Stack direction="column" gap="medium">
      <Stack direction="row" gap="small">
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Create User
        </Button>
      </Stack>

      <DataTable
        data={users}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState="No users yet"
      />

      <UserFormFlow
        client={client}
        mode="create"
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        submitLabel="Create user"
      />

      {editingUser ? (
        <UserFormFlow
          client={client}
          mode="update"
          show
          onClose={() => setEditingUser(null)}
          submitLabel="Save user"
          userId={editingUser.id}
          defaultValues={{
            username: editingUser.username,
            email: editingUser.email,
            role: editingUser.role ?? undefined,
            vendor_id: editingUser.vendorId ?? undefined,
          }}
        />
      ) : null}
    </Stack>
  )
}


