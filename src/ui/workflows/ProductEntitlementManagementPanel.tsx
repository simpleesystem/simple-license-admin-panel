import type { Client, User } from '@simple-license/react-sdk'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import {
  canCreateEntitlement,
  canUpdateEntitlement,
  canViewEntitlements,
  isEntitlementOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_ENTITLEMENT_BUTTON_CREATE,
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
  UI_TABLE_PAGINATION_LABEL,
  UI_TABLE_PAGINATION_NEXT,
  UI_TABLE_PAGINATION_PREVIOUS,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableToolbar } from '../data/TableToolbar'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSortDirection } from '../types'
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
}

const VALUE_TYPE_LABEL_MAP: Record<ProductEntitlementListItem['valueType'], string> = {
  [UI_ENTITLEMENT_VALUE_TYPE_NUMBER]: UI_ENTITLEMENT_VALUE_LABEL_NUMBER,
  [UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN]: UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN,
  [UI_ENTITLEMENT_VALUE_TYPE_STRING]: UI_ENTITLEMENT_VALUE_LABEL_STRING,
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
}: ProductEntitlementManagementPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEntitlement, setEditingEntitlement] = useState<ProductEntitlementListItem | null>(null)
  const notificationBus = useNotificationBus()

  const isVendorScoped = isVendorScopedUser(currentUser)
  const visibleEntitlements = useMemo(
    () =>
      isVendorScoped
        ? entitlements.filter((entitlement) => isEntitlementOwnedByUser(currentUser, entitlement))
        : entitlements,
    [currentUser, entitlements, isVendorScoped]
  )
  const allowCreate = canCreateEntitlement(currentUser)
  const canView = canViewEntitlements(currentUser)

  const refreshWith = (action: 'create' | 'update' | 'delete') => {
    onRefresh?.()
    notifyProductEntitlementSuccess(notificationBus, action)
  }

  const handleMutationError = () => {
    notifyCrudError(notificationBus)
  }

  const toolbar = (
    <TableToolbar
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
        cell: (row) => VALUE_TYPE_LABEL_MAP[row.valueType],
        sortable: true,
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_DEFAULT_VALUE,
        header: UI_ENTITLEMENT_COLUMN_HEADER_DEFAULT_VALUE,
        cell: (row) => (row.defaultValue !== undefined ? String(row.defaultValue) : UI_VALUE_PLACEHOLDER),
        sortable: true,
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_USAGE_LIMIT,
        header: UI_ENTITLEMENT_COLUMN_HEADER_USAGE_LIMIT,
        cell: (row) => (typeof row.usageLimit === 'number' ? row.usageLimit : UI_VALUE_PLACEHOLDER),
        sortable: true,
      },
      {
        id: UI_ENTITLEMENT_COLUMN_ID_ACTIONS,
        header: UI_ENTITLEMENT_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateEntitlement(currentUser, row)) {
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
        sortState={sortState}
        onSort={onSortChange}
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
            value_type: editingEntitlement.valueType,
            default_value: editingEntitlement.defaultValue,
            usage_limit: editingEntitlement.usageLimit ?? undefined,
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
        />
      ) : null}
    </Stack>
  )
}
