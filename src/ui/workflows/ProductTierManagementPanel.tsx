import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client, ProductTier, User } from '@/simpleLicense'
import {
  canCreateProductTier,
  canUpdateProductTier,
  canViewProductTiers,
  isProductTierOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_PRODUCT_TIER_BUTTON_CREATE,
  UI_PRODUCT_TIER_COLUMN_HEADER_ACTIONS,
  UI_PRODUCT_TIER_COLUMN_HEADER_CODE,
  UI_PRODUCT_TIER_COLUMN_HEADER_NAME,
  UI_PRODUCT_TIER_COLUMN_HEADER_STATUS,
  UI_PRODUCT_TIER_COLUMN_ID_ACTIONS,
  UI_PRODUCT_TIER_COLUMN_ID_CODE,
  UI_PRODUCT_TIER_COLUMN_ID_NAME,
  UI_PRODUCT_TIER_COLUMN_ID_STATUS,
  UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE,
  UI_PRODUCT_TIER_FILTER_PLACEHOLDER,
  UI_PRODUCT_TIER_FORM_SUBMIT_CREATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE,
  UI_PRODUCT_TIER_PANEL_DESCRIPTION,
  UI_PRODUCT_TIER_PANEL_TITLE,
  UI_PRODUCT_TIER_SEARCH_PLACEHOLDER,
  UI_PRODUCT_TIER_STATUS_ACTIVE,
  UI_PRODUCT_TIER_STATUS_DEACTIVATED,
  UI_SORT_ASC,
  UI_TABLE_FILTER_LABEL_STATUS,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableControls } from '../data/TableControls'
import { TableFilter } from '../data/TableFilter'
import { TablePaginationFooter } from '../data/TablePaginationFooter'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSelectOption, UiSortDirection } from '../types'
import { notifyCrudError, notifyProductTierSuccess } from './notifications'
import { ProductTierFormFlow } from './ProductTierFormFlow'
import { ProductTierRowActions } from './ProductTierRowActions'

export type ProductTierListItem = Pick<ProductTier, 'id' | 'tierCode' | 'tierName' | 'isActive'> & {
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
  const [statusFilter, setStatusFilter] = useState('true')
  const [localSortState, setLocalSortState] = useState<UiDataTableSortState | undefined>(undefined)
  const notificationBus = useNotificationBus()

  const currentSortState = sortState ?? localSortState
  const handleSortChange = onSortChange ?? ((columnId, direction) => setLocalSortState({ columnId, direction }))

  const isVendorScoped = isVendorScopedUser(currentUser ?? null)

  const visibleTiers = useMemo(() => {
    let list: readonly ProductTierListItem[] = tiers

    if (isVendorScoped) {
      list = list.filter((tier) => isProductTierOwnedByUser(currentUser ?? null, tier))
    }

    if (statusFilter) {
      const isActive = statusFilter === 'true'
      list = list.filter((tier) => (tier.isActive ?? true) === isActive)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(
        (tier) => tier.tierName.toLowerCase().includes(term) || tier.tierCode.toLowerCase().includes(term)
      )
    }

    if (currentSortState) {
      const sorted = [...list].sort((a, b) => {
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
      list = sorted
    }

    return list
  }, [currentUser, tiers, statusFilter, searchTerm, currentSortState, isVendorScoped])
  const allowCreate = canCreateProductTier(currentUser ?? null)
  const canView = canViewProductTiers(currentUser ?? null)
  const statusOptions: UiSelectOption[] = [
    { value: 'true', label: UI_PRODUCT_TIER_STATUS_ACTIVE },
    { value: 'false', label: UI_PRODUCT_TIER_STATUS_DEACTIVATED },
  ]

  const toolbar = (
    <TableControls
      search={{
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: UI_PRODUCT_TIER_SEARCH_PLACEHOLDER,
      }}
      filters={
        <TableFilter
          label={UI_TABLE_FILTER_LABEL_STATUS}
          value={statusFilter}
          options={statusOptions}
          onChange={setStatusFilter}
          placeholder={UI_PRODUCT_TIER_FILTER_PLACEHOLDER}
        />
      }
      actions={
        allowCreate ? (
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreateModal(true)}>
            {UI_PRODUCT_TIER_BUTTON_CREATE}
          </Button>
        ) : null
      }
    />
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
        id: UI_PRODUCT_TIER_COLUMN_ID_STATUS,
        header: UI_PRODUCT_TIER_COLUMN_HEADER_STATUS,
        cell: (row) => (row.isActive ? UI_PRODUCT_TIER_STATUS_ACTIVE : UI_PRODUCT_TIER_STATUS_DEACTIVATED),
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
              onEdit={(tier) => setEditingTier({ ...tier, vendorId: row.vendorId, isActive: row.isActive })}
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
      <PanelHeader title={UI_PRODUCT_TIER_PANEL_TITLE} description={UI_PRODUCT_TIER_PANEL_DESCRIPTION} />

      <DataTable
        data={canView ? visibleTiers : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE}
        sortState={currentSortState}
        onSort={handleSortChange}
        toolbar={toolbar}
        footer={<TablePaginationFooter page={page} totalPages={totalPages} onPageChange={onPageChange} />}
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
