import type { Client, ProductTier } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'
import { useMemo, useState } from 'react'

import { Stack } from '../layout/Stack'
import { DataTable } from '../data/DataTable'
import type { UiDataTableColumn } from '../types'
import { ProductTierFormFlow } from './ProductTierFormFlow'
import { ProductTierRowActions } from './ProductTierRowActions'

export type ProductTierListItem = Pick<ProductTier, 'id' | 'tierCode' | 'tierName'>

type ProductTierManagementExampleProps = {
  client: Client
  productId: string
  tiers: readonly ProductTierListItem[]
}

export function ProductTierManagementExample({ client, productId, tiers }: ProductTierManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTier, setEditingTier] = useState<ProductTierListItem | null>(null)

  const columns: UiDataTableColumn<ProductTierListItem>[] = useMemo(
    () => [
      {
        id: 'tierName',
        header: 'Name',
        cell: (row) => row.tierName,
      },
      {
        id: 'tierCode',
        header: 'Code',
        cell: (row) => row.tierCode,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (row) => (
          <Stack direction="row" gap="small">
            <Button variant="link" onClick={() => setEditingTier(row)}>
              Edit
            </Button>
            <ProductTierRowActions client={client} tier={row} onEdit={setEditingTier} />
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
          Create Tier
        </Button>
      </Stack>

      <DataTable
        data={tiers}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState="No tiers defined"
      />

      <ProductTierFormFlow
        client={client}
        mode="create"
        productId={productId}
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        submitLabel="Create tier"
      />

      {editingTier ? (
        <ProductTierFormFlow
          client={client}
          mode="update"
          show
          onClose={() => setEditingTier(null)}
          submitLabel="Save tier"
          tierId={editingTier.id}
          defaultValues={{
            name: editingTier.tierName,
            code: editingTier.tierCode,
          }}
        />
      ) : null}
    </Stack>
  )
}


