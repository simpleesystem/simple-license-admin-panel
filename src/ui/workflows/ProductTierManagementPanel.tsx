import type { Client, Product, ProductTier, User } from '@/simpleLicense'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import {
  canCreateProductTier,
  canUpdateProductTier,
  canViewProductTiers,
  isProductTierOwnedByUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/useNotificationBus'
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
  UI_SORT_ASC,
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
  vendorId: string
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
  const [searchTerm, setSearchTerm] = useState('')
  const [localSortState, setLocalSortState] = useState<UiDataTableSortState | undefined>(undefined)
  const notificationBus = useNotificationBus()

  const currentSortState = sortState ?? localSortState
  const handleSortChange = onSortChange ?? ((columnId, direction) => setLocalSortState({ columnId, direction }))

  const visibleTiers = useMemo(() => {
    let list = tiers
    const isSuperUser = currentUser?.role === 'SUPERUSER' || currentUser?.role === 'ADMIN'

    // Vendor filtering
    if (currentUser?.vendorId && !isSuperUser) {
      list = list.filter((tier) =>
        isProductTierOwnedByUser(currentUser ?? null, {
          ...tier,
          productId,
          slug: 'mock-slug',
          name: 'mock-name',
          description: undefined,
          isActive: true,
          suspendedAt: null,
          suspensionReason: null,
          defaultLicenseTermDays: null,
          defaultMaxActivations: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as Product)
      )
    }

    // Search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(
        (tier) => tier.tierName.toLowerCase().includes(term) || tier.tierCode.toLowerCase().includes(term)
      )
    }

    // Sorting
    if (currentSortState) {
      list = [...list].sort((a, b) => {
        const aValue = a[currentSortState.columnId as keyof ProductTierListItem]
        const bValue = b[currentSortState.columnId as keyof ProductTierListItem]

        if (aValue === bValue) {
          return 0
        }
        if (aValue === null || aValue === undefined) {
          return 1
        }
        if (bValue === null || bValue === undefined) {
          return -1
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const cmp = aValue.localeCompare(bValue)
          return currentSortState.direction === UI_SORT_ASC ? cmp : -cmp
        }

        const cmp = aValue < bValue ? -1 : 1
        return currentSortState.direction === UI_SORT_ASC ? cmp : -cmp
      })
    }

    return list
  }, [currentUser, tiers, searchTerm, currentSortState, productId])
  const allowCreate = canCreateProductTier(currentUser ?? null)
  const canView = canViewProductTiers(currentUser ?? null)

  const toolbar = (
    <TableToolbar
      start={
        <div className="d-flex align-items-center gap-3">
          <Form.Control
            type="search"
            placeholder="Search tiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '250px' }}
            size="sm"
          />
        </div>
      }
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
          if (!canUpdateProductTier(currentUser ?? null)) {
            return UI_VALUE_PLACEHOLDER
          }
          return (
            <ProductTierRowActions
              client={client}
              tier={row}
              onEdit={(tier) => setEditingTier({ ...tier, vendorId: row.vendorId })}
              onCompleted={onRefresh}
              currentUser={currentUser ?? null}
              vendorId={row.vendorId}
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
        sortState={currentSortState}
        onSort={handleSortChange}
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
            tier_name: editingTier.tierName,
            tier_code: editingTier.tierCode,
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
        />
      ) : null}
    </Stack>
  )
}
