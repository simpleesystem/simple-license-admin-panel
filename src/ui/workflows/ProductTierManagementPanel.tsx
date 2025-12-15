import type { Client, ProductTier, User } from '@simple-license/react-sdk'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import {
  canCreateProductTier,
  canUpdateProductTier,
  canViewProductTiers,
  isProductTierOwnedByUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_PRODUCT_TIER_BUTTON_CREATE,
  UI_PRODUCT_TIER_COLUMN_HEADER_ACTIONS,
  UI_PRODUCT_TIER_COLUMN_HEADER_CODE,
  UI_PRODUCT_TIER_COLUMN_HEADER_NAME,
  UI_PRODUCT_TIER_COLUMN_ID_ACTIONS,
  UI_PRODUCT_TIER_COLUMN_ID_CODE,
  UI_PRODUCT_TIER_COLUMN_ID_NAME,
  UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE,
  UI_PRODUCT_TIER_FORM_SUBMIT_CREATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE,
  UI_TABLE_PAGINATION_LABEL,
  UI_TABLE_PAGINATION_NEXT,
  UI_TABLE_PAGINATION_PREVIOUS,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableToolbar } from '../data/TableToolbar'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSortDirection } from '../types'
import { notifyCrudError, notifyProductTierSuccess } from './notifications'
import { ProductTierFormFlow } from './ProductTierFormFlow'
import { ProductTierRowActions } from './ProductTierRowActions'

export type ProductTierListItem = Pick<ProductTier, 'id' | 'tierCode' | 'tierName'> & {
  vendorId?: string | null
}

type ProductTierManagementPanelProps = {
  client: Client
  productId: string
  tiers: readonly ProductTierListItem[]
  currentUser?: User | null
  onRefresh?: () => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  sortState?: UiDataTableSortState
  onSortChange?: (columnId: string, direction: UiSortDirection) => void
}

export function ProductTierManagementPanel({
  client,
  productId,
  tiers,
  currentUser,
  onRefresh,
  page,
  totalPages,
  onPageChange,
  sortState,
  onSortChange,
}: ProductTierManagementPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTier, setEditingTier] = useState<ProductTierListItem | null>(null)
  const notificationBus = useNotificationBus()

  const visibleTiers = useMemo(() => {
    const isSuperUser = currentUser?.role === 'SUPERUSER' || currentUser?.role === 'ADMIN'
    if (!currentUser?.vendorId || isSuperUser) {
      return tiers
    }
    return tiers.filter((tier) => isProductTierOwnedByUser(currentUser, tier))
  }, [currentUser, tiers])
  const allowCreate = canCreateProductTier(currentUser)
  const canView = canViewProductTiers(currentUser)

  const toolbar = (
    <TableToolbar
      end={
        allowCreate ? (
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreateModal(true)}>
            {UI_PRODUCT_TIER_BUTTON_CREATE}
          </Button>
        ) : null
      }
    />
  )

  const pagination = (
    <Stack direction="row" gap="small" justify="end" aria-label={UI_TABLE_PAGINATION_LABEL}>
      <Button variant={UI_BUTTON_VARIANT_SECONDARY} onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        {UI_TABLE_PAGINATION_PREVIOUS}
      </Button>
      <div className="d-flex align-items-center px-2">
        <span>
          {page} / {totalPages}
        </span>
      </div>
      <Button
        variant={UI_BUTTON_VARIANT_SECONDARY}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        {UI_TABLE_PAGINATION_NEXT}
      </Button>
    </Stack>
  )

  const columns: UiDataTableColumn<ProductTierListItem>[] = useMemo(
    () => [
      {
        id: UI_PRODUCT_TIER_COLUMN_ID_NAME,
        header: UI_PRODUCT_TIER_COLUMN_HEADER_NAME,
        cell: (row) => row.tierName ?? UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_PRODUCT_TIER_COLUMN_ID_CODE,
        header: UI_PRODUCT_TIER_COLUMN_HEADER_CODE,
        cell: (row) => row.tierCode ?? UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_PRODUCT_TIER_COLUMN_ID_ACTIONS,
        header: UI_PRODUCT_TIER_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateProductTier(currentUser, row)) {
            return UI_VALUE_PLACEHOLDER
          }
          return (
            <ProductTierRowActions
              client={client}
              tier={row}
              onEdit={setEditingTier}
              onCompleted={onRefresh}
              currentUser={currentUser ?? null}
              vendorId={row.vendorId ?? null}
            />
          )
        },
      },
    ],
    [client, currentUser, onRefresh]
  )

  const refreshWith = (action: 'create' | 'update' | 'delete') => {
    onRefresh?.()
    notifyProductTierSuccess(notificationBus, action)
  }

  const handleMutationError = () => {
    notifyCrudError(notificationBus)
  }

  return (
    <Stack direction="column" gap="medium">
      <DataTable
        data={canView ? visibleTiers : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE}
        sortState={sortState}
        onSort={onSortChange}
        toolbar={toolbar}
        footer={pagination}
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
          onSuccess={() => refreshWith('create')}
          onError={handleMutationError}
        />
      ) : null}

      {editingTier ? (
        <ProductTierFormFlow
          client={client}
          mode="update"
          show={Boolean(editingTier)}
          onClose={() => setEditingTier(null)}
          submitLabel={UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE}
          tierId={editingTier.id}
          defaultValues={{
            name: editingTier.tierName,
            code: editingTier.tierCode,
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
        />
      ) : null}
    </Stack>
  )
}
