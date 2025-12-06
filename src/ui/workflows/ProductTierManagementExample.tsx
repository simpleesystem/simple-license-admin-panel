import type { Client, ProductTier, User } from '@simple-license/react-sdk'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import {
  canCreateProductTier,
  canUpdateProductTier,
  canViewProductTiers,
  isProductTierOwnedByUser,
} from '../../app/auth/permissions'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_PRODUCT_TIER_BUTTON_CREATE,
  UI_PRODUCT_TIER_BUTTON_EDIT,
  UI_PRODUCT_TIER_COLUMN_HEADER_ACTIONS,
  UI_PRODUCT_TIER_COLUMN_HEADER_CODE,
  UI_PRODUCT_TIER_COLUMN_HEADER_NAME,
  UI_PRODUCT_TIER_COLUMN_ID_ACTIONS,
  UI_PRODUCT_TIER_COLUMN_ID_CODE,
  UI_PRODUCT_TIER_COLUMN_ID_NAME,
  UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE,
  UI_PRODUCT_TIER_FORM_SUBMIT_CREATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'
import { ProductTierFormFlow } from './ProductTierFormFlow'
import { ProductTierRowActions } from './ProductTierRowActions'

export type ProductTierListItem = Pick<ProductTier, 'id' | 'tierCode' | 'tierName'> & {
  vendorId?: string | null
}

type ProductTierManagementExampleProps = {
  client: Client
  productId: string
  tiers: readonly ProductTierListItem[]
  currentUser?: User | null
  onRefresh?: () => void
}

export function ProductTierManagementExample({
  client,
  productId,
  tiers,
  currentUser,
  onRefresh,
}: ProductTierManagementExampleProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTier, setEditingTier] = useState<ProductTierListItem | null>(null)

  const visibleTiers = useMemo(() => {
    const isSuperUser = currentUser?.role === 'SUPERUSER' || currentUser?.role === 'ADMIN'
    if (!currentUser?.vendorId || isSuperUser) {
      return tiers
    }
    return tiers.filter((tier) => isProductTierOwnedByUser(currentUser, tier))
  }, [currentUser, tiers])
  const allowCreate = canCreateProductTier(currentUser)
  const canView = canViewProductTiers(currentUser)

  const columns: UiDataTableColumn<ProductTierListItem>[] = useMemo(
    () => [
      {
        id: UI_PRODUCT_TIER_COLUMN_ID_NAME,
        header: UI_PRODUCT_TIER_COLUMN_HEADER_NAME,
        cell: (row) => row.tierName ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_PRODUCT_TIER_COLUMN_ID_CODE,
        header: UI_PRODUCT_TIER_COLUMN_HEADER_CODE,
        cell: (row) => row.tierCode ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_PRODUCT_TIER_COLUMN_ID_ACTIONS,
        header: UI_PRODUCT_TIER_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateProductTier(currentUser, row)) {
            return null
          }
          return (
            <Stack direction="row" gap="small">
              <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => setEditingTier(row)}>
                {UI_PRODUCT_TIER_BUTTON_EDIT}
              </Button>
              <ProductTierRowActions
                client={client}
                tier={row}
                onEdit={setEditingTier}
                onCompleted={onRefresh}
                currentUser={currentUser ?? null}
                vendorId={row.vendorId ?? null}
              />
            </Stack>
          )
        },
      },
    ],
    [client, currentUser, onRefresh]
  )

  return (
    <Stack direction="column" gap="medium">
      {allowCreate ? (
        <Stack direction="row" gap="small">
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreateModal(true)}>
            {UI_PRODUCT_TIER_BUTTON_CREATE}
          </Button>
        </Stack>
      ) : null}

      <DataTable
        data={canView ? visibleTiers : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE}
      />

      {allowCreate ? (
        <ProductTierFormFlow
          client={client}
          mode="create"
          productId={productId}
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          submitLabel={UI_PRODUCT_TIER_FORM_SUBMIT_CREATE}
          onCompleted={onRefresh}
        />
      ) : null}

      {editingTier ? (
        <ProductTierFormFlow
          client={client}
          mode="update"
          show={true}
          onClose={() => setEditingTier(null)}
          submitLabel={UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE}
          tierId={editingTier.id}
          defaultValues={{
            name: editingTier.tierName,
            code: editingTier.tierCode,
          }}
          onCompleted={onRefresh}
        />
      ) : null}
    </Stack>
  )
}
