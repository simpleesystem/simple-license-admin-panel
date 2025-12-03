import type { Client } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'
import { useMemo, useState } from 'react'

import { Stack } from '../layout/Stack'
import { DataTable } from '../data/DataTable'
import type { UiDataTableColumn } from '../types'
import { ProductEntitlementFormFlow } from './ProductEntitlementFormFlow'
import {
  ProductEntitlementRowActions,
  type ProductEntitlementListItem,
} from './ProductEntitlementRowActions'
export type { ProductEntitlementListItem } from './ProductEntitlementRowActions'
import {
  UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN,
  UI_ENTITLEMENT_VALUE_LABEL_NUMBER,
  UI_ENTITLEMENT_VALUE_LABEL_STRING,
  UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN,
  UI_ENTITLEMENT_VALUE_TYPE_NUMBER,
  UI_ENTITLEMENT_VALUE_TYPE_STRING,
} from '../constants'

type ProductEntitlementManagementExampleProps = {
  client: Client
  productId: string
  entitlements: readonly ProductEntitlementListItem[]
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
}: ProductEntitlementManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEntitlement, setEditingEntitlement] = useState<ProductEntitlementListItem | null>(null)

  const columns: UiDataTableColumn<ProductEntitlementListItem>[] = useMemo(
    () => [
      {
        id: 'key',
        header: 'Key',
        cell: (row) => row.key,
      },
      {
        id: 'valueType',
        header: 'Value Type',
        cell: (row) => VALUE_TYPE_LABEL_MAP[row.valueType],
      },
      {
        id: 'defaultValue',
        header: 'Default Value',
        cell: (row) => String(row.defaultValue),
      },
      {
        id: 'usageLimit',
        header: 'Usage Limit',
        cell: (row) => (typeof row.usageLimit === 'number' ? row.usageLimit : '—'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (row) => (
          <Stack direction="row" gap="small">
            <Button variant="link" onClick={() => setEditingEntitlement(row)}>
              Edit
            </Button>
            <ProductEntitlementRowActions client={client} entitlement={row} onEdit={setEditingEntitlement} />
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
          Create Entitlement
        </Button>
      </Stack>

      <DataTable
        data={entitlements}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState="No entitlements defined"
      />

      <ProductEntitlementFormFlow
        client={client}
        productId={productId}
        mode="create"
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        submitLabel="Create entitlement"
      />

      {editingEntitlement ? (
        <ProductEntitlementFormFlow
          client={client}
          mode="update"
          show
          onClose={() => setEditingEntitlement(null)}
          submitLabel="Save entitlement"
          entitlementId={editingEntitlement.id}
          defaultValues={{
            key: editingEntitlement.key,
            value_type: editingEntitlement.valueType,
            default_value: editingEntitlement.defaultValue,
            usage_limit: editingEntitlement.usageLimit ?? undefined,
          }}
        />
      ) : null}
    </Stack>
  )
}


