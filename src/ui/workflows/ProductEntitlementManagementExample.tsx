import type { Client, User } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'
import { useMemo, useState } from 'react'

import {
  UI_BUTTON_VARIANT_GHOST,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_ENTITLEMENT_BUTTON_CREATE,
  UI_ENTITLEMENT_BUTTON_EDIT,
  UI_ENTITLEMENT_COLUMN_HEADER_ACTIONS,
  UI_ENTITLEMENT_COLUMN_HEADER_DEFAULT_VALUE,
  UI_ENTITLEMENT_COLUMN_HEADER_KEY,
  UI_ENTITLEMENT_COLUMN_HEADER_USAGE_LIMIT,
  UI_ENTITLEMENT_COLUMN_HEADER_VALUE_TYPE,
  UI_ENTITLEMENT_COLUMN_ID_ACTIONS,
  UI_ENTITLEMENT_COLUMN_ID_DEFAULT_VALUE,
  UI_ENTITLEMENT_COLUMN_ID_KEY,
  UI_ENTITLEMENT_COLUMN_ID_USAGE_LIMIT,
  UI_ENTITLEMENT_COLUMN_ID_VALUE_TYPE,
  UI_ENTITLEMENT_EMPTY_STATE_MESSAGE,
  UI_ENTITLEMENT_FORM_SUBMIT_CREATE,
  UI_ENTITLEMENT_FORM_SUBMIT_UPDATE,
  UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN,
  UI_ENTITLEMENT_VALUE_LABEL_NUMBER,
  UI_ENTITLEMENT_VALUE_LABEL_STRING,
  UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN,
  UI_ENTITLEMENT_VALUE_TYPE_NUMBER,
  UI_ENTITLEMENT_VALUE_TYPE_STRING,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { Stack } from '../layout/Stack'
import {
  canCreateEntitlement,
  canUpdateEntitlement,
  canViewEntitlements,
  isEntitlementOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import type { UiDataTableColumn } from '../types'
import { ProductEntitlementFormFlow } from './ProductEntitlementFormFlow'
import {
  ProductEntitlementRowActions,
  type ProductEntitlementListItem,
} from './ProductEntitlementRowActions'
export type { ProductEntitlementListItem } from './ProductEntitlementRowActions'

type ProductEntitlementManagementExampleProps = {
  client: Client
  productId: string
  entitlements: readonly ProductEntitlementListItem[]
  currentUser?: User | null
  onRefresh?: () => void
}

const VALUE_TYPE_LABEL_MAP: Record<ProductEntitlementListItem['valueType'], string> = {
  [UI_ENTITLEMENT_VALUE_TYPE_NUMBER]: UI_ENTITLEMENT_VALUE_LABEL_NUMBER,
  [UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN]: UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN,
  [UI_ENTITLEMENT_VALUE_TYPE_STRING]: UI_ENTITLEMENT_VALUE_LABEL_STRING,
}

export function ProductEntitlementManagementExample({
  client,
  productId,
  entitlements,
  currentUser,
  onRefresh,
}: ProductEntitlementManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEntitlement, setEditingEntitlement] = useState<ProductEntitlementListItem | null>(null)

  const isVendorScoped = isVendorScopedUser(currentUser)
  const visibleEntitlements = useMemo(
    () =>
      isVendorScoped ? entitlements.filter((entitlement) => isEntitlementOwnedByUser(currentUser, entitlement)) : entitlements,
    [currentUser, entitlements, isVendorScoped],
  )
  const allowCreate = canCreateEntitlement(currentUser)
  const canView = canViewEntitlements(currentUser)

  const columns: UiDataTableColumn<ProductEntitlementListItem>[] = useMemo(
    () => [
      {
        id: UI_ENTITLEMENT_COLUMN_ID_KEY,
        header: UI_ENTITLEMENT_COLUMN_HEADER_KEY,
        cell: (row) => row.key,
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_VALUE_TYPE,
        header: UI_ENTITLEMENT_COLUMN_HEADER_VALUE_TYPE,
        cell: (row) => VALUE_TYPE_LABEL_MAP[row.valueType],
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_DEFAULT_VALUE,
        header: UI_ENTITLEMENT_COLUMN_HEADER_DEFAULT_VALUE,
        cell: (row) => (row.defaultValue !== undefined ? String(row.defaultValue) : UI_VALUE_PLACEHOLDER),
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_USAGE_LIMIT,
        header: UI_ENTITLEMENT_COLUMN_HEADER_USAGE_LIMIT,
        cell: (row) => (typeof row.usageLimit === 'number' ? row.usageLimit : UI_VALUE_PLACEHOLDER),
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_ACTIONS,
        header: UI_ENTITLEMENT_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateEntitlement(currentUser, row)) {
            return null
          }
          return (
            <Stack direction="row" gap="small">
              <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => setEditingEntitlement(row)}>
                {UI_ENTITLEMENT_BUTTON_EDIT}
              </Button>
              <ProductEntitlementRowActions
                client={client}
                entitlement={row}
                onEdit={setEditingEntitlement}
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

  return (
    <Stack direction="column" gap="medium">
      {allowCreate ? (
        <Stack direction="row" gap="small">
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreateModal(true)}>
            {UI_ENTITLEMENT_BUTTON_CREATE}
          </Button>
        </Stack>
      ) : null}

      <DataTable
        data={canView ? visibleEntitlements : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_ENTITLEMENT_EMPTY_STATE_MESSAGE}
      />

      {allowCreate ? (
        <ProductEntitlementFormFlow
          client={client}
          productId={productId}
          mode="create"
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          submitLabel={UI_ENTITLEMENT_FORM_SUBMIT_CREATE}
          onCompleted={onRefresh}
        />
      ) : null}

      {editingEntitlement ? (
        <ProductEntitlementFormFlow
          client={client}
          mode="update"
          show
          onClose={() => setEditingEntitlement(null)}
          submitLabel={UI_ENTITLEMENT_FORM_SUBMIT_UPDATE}
          entitlementId={editingEntitlement.id}
          defaultValues={{
            key: editingEntitlement.key,
            value_type: editingEntitlement.valueType,
            default_value: editingEntitlement.defaultValue,
            usage_limit: editingEntitlement.usageLimit ?? undefined,
          }}
          onCompleted={onRefresh}
        />
      ) : null}
    </Stack>
  )
}


