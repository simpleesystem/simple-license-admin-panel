import type { Client, Tenant, User } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'
import { useMemo, useState } from 'react'

import {
  UI_BUTTON_VARIANT_GHOST,
  UI_BUTTON_VARIANT_PRIMARY,
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
import { Stack } from '../layout/Stack'
import { canCreateTenant, canUpdateTenant, canViewTenants, isTenantOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import type { UiDataTableColumn } from '../types'
import { TenantFormFlow } from './TenantFormFlow'
import { TenantRowActions } from './TenantRowActions'

export type TenantListItem = Pick<Tenant, 'id' | 'name' | 'status' | 'createdAt' | 'vendorId'>

type TenantManagementExampleProps = {
  client: Client
  tenants: readonly TenantListItem[]
  currentUser?: User | null
  onRefresh?: () => void
}

export function TenantManagementExample({ client, tenants, currentUser, onRefresh }: TenantManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<TenantListItem | null>(null)
  const isVendorScoped = isVendorScopedUser(currentUser)
  const visibleTenants = useMemo(
    () => (isVendorScoped ? tenants.filter((tenant) => isTenantOwnedByUser(currentUser, tenant)) : tenants),
    [currentUser, isVendorScoped, tenants],
  )
  const allowCreate = canCreateTenant(currentUser)

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
        cell: (row) => new Date(row.createdAt).toLocaleDateString(),
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
    [client, currentUser, onRefresh],
  )

  const canView = canViewTenants(currentUser)

  return (
    <Stack direction="column" gap="medium">
      {allowCreate ? (
        <Stack direction="row" gap="small">
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreateModal(true)}>
            {UI_TENANT_BUTTON_CREATE}
          </Button>
        </Stack>
      ) : null}

      <DataTable
        data={canView ? visibleTenants : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_TENANT_EMPTY_STATE_MESSAGE}
      />

      {allowCreate ? (
        <TenantFormFlow
          client={client}
          mode="create"
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          submitLabel={UI_TENANT_FORM_SUBMIT_CREATE}
          onCompleted={onRefresh}
        />
      ) : null}

      {editingTenant ? (
        <TenantFormFlow
          client={client}
          mode="update"
          show
          onClose={() => setEditingTenant(null)}
          submitLabel={UI_TENANT_FORM_SUBMIT_UPDATE}
          tenantId={editingTenant.id}
          defaultValues={{
            name: editingTenant.name,
          }}
          onCompleted={onRefresh}
        />
      ) : null}
    </Stack>
  )
}


