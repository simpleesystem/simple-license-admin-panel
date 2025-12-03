import type { Client } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'
import { useMemo, useState } from 'react'

import type { UiDataTableColumn } from '../types'
import { Stack } from '../layout/Stack'
import { DataTable } from '../data/DataTable'
import { ProductFormFlow } from './ProductFormFlow'
import { ProductRowActions } from './ProductRowActions'

export type ProductListItem = {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
}

type ProductManagementExampleProps = {
  client: Client
  products: readonly ProductListItem[]
}

export function ProductManagementExample({ client, products }: ProductManagementExampleProps) {
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const columns: UiDataTableColumn<ProductListItem>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: (row) => row.name,
      },
      {
        id: 'slug',
        header: 'Slug',
        cell: (row) => row.slug,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => (row.isActive ? 'Active' : 'Suspended'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (row) => (
          <Stack direction="row" gap="small">
            <Button variant="link" onClick={() => setEditingProduct(row)}>
              Edit
            </Button>
            <ProductRowActions
              client={client}
              productId={row.id}
              isActive={row.isActive}
              onCompleted={() => {}}
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
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          Create Product
        </Button>
      </Stack>

      <DataTable
        data={products}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState="No products yet"
      />

      <ProductFormFlow
        client={client}
        mode="create"
        show={showCreate}
        onClose={() => setShowCreate(false)}
        submitLabel="Create product"
      />

      {editingProduct ? (
        <ProductFormFlow
          client={client}
          mode="update"
          productId={editingProduct.id}
          show
          onClose={() => setEditingProduct(null)}
          submitLabel="Save product"
          defaultValues={{
            name: editingProduct.name,
            slug: editingProduct.slug,
            description: editingProduct.description,
          }}
        />
      ) : null}
    </Stack>
  )
}


