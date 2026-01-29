import { useMemo, useState } from 'react'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import type { Client, Product, User } from '@/simpleLicense'
import {
  canCreateEntitlement,
  canUpdateEntitlement,
  canViewEntitlements,
  isEntitlementOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_ENTITLEMENT_BUTTON_CREATE,
  UI_ENTITLEMENT_COLUMN_HEADER_ACTIONS,
  UI_ENTITLEMENT_COLUMN_HEADER_DEFAULT_VALUE,
  UI_ENTITLEMENT_COLUMN_HEADER_KEY,
  UI_ENTITLEMENT_COLUMN_HEADER_VALUE_TYPE,
  UI_ENTITLEMENT_COLUMN_ID_ACTIONS,
  UI_ENTITLEMENT_COLUMN_ID_DEFAULT_VALUE,
  UI_ENTITLEMENT_COLUMN_ID_KEY,
  UI_ENTITLEMENT_COLUMN_ID_VALUE_TYPE,
  UI_ENTITLEMENT_EMPTY_STATE_MESSAGE,
  UI_ENTITLEMENT_FORM_SUBMIT_CREATE,
  UI_ENTITLEMENT_FORM_SUBMIT_UPDATE,
  UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN,
  UI_ENTITLEMENT_VALUE_LABEL_NUMBER,
  UI_ENTITLEMENT_VALUE_LABEL_STRING,
  UI_SORT_ASC,
  UI_TABLE_PAGINATION_LABEL,
  UI_TABLE_PAGINATION_NEXT,
  UI_TABLE_PAGINATION_PREVIOUS,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableToolbar } from '../data/TableToolbar'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSelectOption, UiSortDirection } from '../types'
import { notifyCrudError, notifyProductEntitlementSuccess } from './notifications'
import { ProductEntitlementFormFlow } from './ProductEntitlementFormFlow'
import { type ProductEntitlementListItem, ProductEntitlementRowActions } from './ProductEntitlementRowActions'

export type { ProductEntitlementListItem } from './ProductEntitlementRowActions'

type ProductEntitlementManagementPanelProps = {
  client: Client
  productId: string
  entitlements: readonly ProductEntitlementListItem[]
  currentUser?: User | null
  onRefresh?: () => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  sortState?: UiDataTableSortState
  onSortChange?: (columnId: string, direction: UiSortDirection) => void
  tierOptions?: readonly UiSelectOption[]
}

export function ProductEntitlementManagementPanel({
  client,
  productId,
  entitlements,
  currentUser,
  onRefresh,
  page,
  totalPages,
  onPageChange,
  sortState,
  onSortChange,
  tierOptions,
}: ProductEntitlementManagementPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEntitlement, setEditingEntitlement] = useState<ProductEntitlementListItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [localSortState, setLocalSortState] = useState<UiDataTableSortState | undefined>(undefined)
  const notificationBus = useNotificationBus()

  const currentSortState = sortState ?? localSortState
  const handleSortChange = onSortChange ?? ((columnId, direction) => setLocalSortState({ columnId, direction }))

  const isVendorScoped = isVendorScopedUser(currentUser ?? null)
  const visibleEntitlements = useMemo(() => {
    let list = entitlements

    // Vendor filtering
    if (isVendorScoped) {
      list = list.filter((entitlement) =>
        isEntitlementOwnedByUser(currentUser ?? null, entitlement as unknown as Product)
      )
    }

    // Search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter((entitlement) => entitlement.key.toLowerCase().includes(term))
    }

    // Sorting
    if (currentSortState) {
      list = [...list].sort((a, b) => {
        const aValue = a[currentSortState.columnId as keyof ProductEntitlementListItem]
        const bValue = b[currentSortState.columnId as keyof ProductEntitlementListItem]

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
  }, [currentUser, entitlements, isVendorScoped, searchTerm, currentSortState])
  const allowCreate = canCreateEntitlement(currentUser ?? null)
  const canView = canViewEntitlements(currentUser ?? null)

  const refreshWith = (action: 'create' | 'update' | 'delete') => {
    onRefresh?.()
    notifyProductEntitlementSuccess(notificationBus, action)
  }

  const handleMutationError = () => {
    notifyCrudError(notificationBus)
  }

  const toolbar = (
    <TableToolbar
      start={
        <div className="d-flex align-items-center gap-3">
          <Form.Control
            type="search"
            placeholder="Search entitlements..."
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
            {UI_ENTITLEMENT_BUTTON_CREATE}
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

  const columns: UiDataTableColumn<ProductEntitlementListItem>[] = useMemo(
    () => [
      {
        id: UI_ENTITLEMENT_COLUMN_ID_KEY,
        header: UI_ENTITLEMENT_COLUMN_HEADER_KEY,
        cell: (row) => row.key,
        sortable: true,
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_VALUE_TYPE,
        header: UI_ENTITLEMENT_COLUMN_HEADER_VALUE_TYPE,
        cell: (row) => {
          const types = []
          if (row.number_value !== null && row.number_value !== undefined) {
            types.push(UI_ENTITLEMENT_VALUE_LABEL_NUMBER)
          }
          if (row.boolean_value !== null && row.boolean_value !== undefined) {
            types.push(UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN)
          }
          if (row.string_value !== null && row.string_value !== undefined) {
            types.push(UI_ENTITLEMENT_VALUE_LABEL_STRING)
          }
          return types.join(', ') || UI_VALUE_PLACEHOLDER
        },
        sortable: false,
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_DEFAULT_VALUE,
        header: UI_ENTITLEMENT_COLUMN_HEADER_DEFAULT_VALUE,
        cell: (row) => {
          const values = []
          if (row.number_value !== null && row.number_value !== undefined) {
            values.push(row.number_value)
          }
          if (row.boolean_value !== null && row.boolean_value !== undefined) {
            values.push(String(row.boolean_value))
          }
          if (row.string_value !== null && row.string_value !== undefined) {
            values.push(row.string_value)
          }
          return values.join(', ') || UI_VALUE_PLACEHOLDER
        },
        sortable: false,
      },
      {
        id: 'tiers',
        header: 'Tiers',
        cell: (row) => {
          if (!row.productTiers || row.productTiers.length === 0) {
            return UI_VALUE_PLACEHOLDER
          }
          return (
            <div className="d-flex flex-wrap gap-1">
              {row.productTiers.map((t) => (
                <Badge key={t.id} bg="light" text="dark" className="border">
                  {t.tierCode}
                </Badge>
              ))}
            </div>
          )
        },
        sortable: false,
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_ACTIONS,
        header: UI_ENTITLEMENT_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateEntitlement(currentUser ?? null, row)) {
            return UI_VALUE_PLACEHOLDER
          }
          return (
            <ProductEntitlementRowActions
              client={client}
              entitlement={row}
              onEdit={setEditingEntitlement}
              onCompleted={onRefresh}
              currentUser={currentUser ?? null}
            />
          )
        },
      },
    ],
    [client, currentUser, onRefresh]
  )

  return (
    <Stack direction="column" gap="medium">
      <DataTable
        data={canView ? visibleEntitlements : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_ENTITLEMENT_EMPTY_STATE_MESSAGE}
        sortState={currentSortState}
        onSort={handleSortChange}
        toolbar={toolbar}
        footer={pagination}
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
          onSuccess={() => refreshWith('create')}
          onError={handleMutationError}
          tierOptions={tierOptions}
        />
      ) : null}

      {editingEntitlement ? (
        <ProductEntitlementFormFlow
          client={client}
          mode="update"
          show={Boolean(editingEntitlement)}
          onClose={() => setEditingEntitlement(null)}
          submitLabel={UI_ENTITLEMENT_FORM_SUBMIT_UPDATE}
          entitlementId={editingEntitlement.id}
          defaultValues={{
            key: editingEntitlement.key,
            number_value:
              editingEntitlement.number_value !== null ? String(editingEntitlement.number_value) : undefined,
            boolean_value:
              editingEntitlement.boolean_value !== null ? String(editingEntitlement.boolean_value) : undefined,
            string_value: editingEntitlement.string_value ?? undefined,
            tier_ids: editingEntitlement.productTiers ? editingEntitlement.productTiers.map((pt) => pt.id) : [],
            metadata: editingEntitlement.metadata ? JSON.stringify(editingEntitlement.metadata, null, 2) : '',
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
          tierOptions={tierOptions}
        />
      ) : null}
    </Stack>
  )
}
