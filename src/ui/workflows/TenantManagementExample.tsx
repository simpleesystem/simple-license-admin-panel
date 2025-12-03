import type { Client, Tenant } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'
import { useMemo, useState } from 'react'

import { Stack } from '../layout/Stack'
import { DataTable } from '../data/DataTable'
import type { UiDataTableColumn } from '../types'
import { TenantFormFlow } from './TenantFormFlow'
import { TenantRowActions } from './TenantRowActions'

export type TenantListItem = Pick<Tenant, 'id' | 'name' | 'status' | 'createdAt'>

type TenantManagementExampleProps = {
  client: Client
  tenants: readonly TenantListItem[]
}

export function TenantManagementExample({ client, tenants }: TenantManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<TenantListItem | null>(null)

  const columns: UiDataTableColumn<TenantListItem>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: (row) => row.name,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => row.status,
      },
      {
        id: 'createdAt',
        header: 'Created',
        cell: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (row) => (
          <Stack direction="row" gap="small">
            <Button variant="link" onClick={() => setEditingTenant(row)}>
              Edit
            </Button>
            <TenantRowActions client={client} tenant={row as Tenant} onEdit={setEditingTenant} />
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
          Create Tenant
        </Button>
      </Stack>

      <DataTable
        data={tenants}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState="No tenants yet"
      />

      <TenantFormFlow
        client={client}
        mode="create"
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        submitLabel="Create tenant"
      />

      {editingTenant ? (
        <TenantFormFlow
          client={client}
          mode="update"
          show
          onClose={() => setEditingTenant(null)}
          submitLabel="Save tenant"
          tenantId={editingTenant.id}
          defaultValues={{
            name: editingTenant.name,
          }}
        />
      ) : null}
    </Stack>
  )
}


