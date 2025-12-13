import type { Client, User } from '@simple-license/react-sdk'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import {
  canCreateProduct,
  canUpdateProduct,
  canViewProducts,
  isProductOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_BUTTON_EDIT,
  UI_PRODUCT_COLUMN_HEADER_ACTIONS,
  UI_PRODUCT_COLUMN_HEADER_NAME,
  UI_PRODUCT_COLUMN_HEADER_SLUG,
  UI_PRODUCT_COLUMN_HEADER_STATUS,
  UI_PRODUCT_COLUMN_HEADER_VENDOR,
  UI_PRODUCT_COLUMN_ID_ACTIONS,
  UI_PRODUCT_COLUMN_ID_NAME,
  UI_PRODUCT_COLUMN_ID_SLUG,
  UI_PRODUCT_COLUMN_ID_STATUS,
  UI_PRODUCT_COLUMN_ID_VENDOR,
  UI_PRODUCT_EMPTY_STATE_MESSAGE,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
  UI_PRODUCT_STATUS_ACTIVE,
  UI_PRODUCT_STATUS_SUSPENDED,
  UI_TABLE_SEARCH_PLACEHOLDER,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableFilter } from '../data/TableFilter'
import { TableToolbar } from '../data/TableToolbar'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiSelectOption } from '../types'
import { notifyCrudError, notifyProductSuccess } from './notifications'
import { ProductFormFlow } from './ProductFormFlow'
import { ProductRowActions } from './ProductRowActions'

export type ProductListItem = {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  vendorId?: string | null
}

type ProductManagementExampleProps = {
  client: Client
  products: readonly ProductListItem[]
  currentUser?: User | null
  onRefresh?: () => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
}

export function ProductManagementExample({
  client,
  products,
  currentUser,
  onRefresh,
  searchTerm = '',
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ProductManagementExampleProps) {
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const notificationBus = useNotificationBus()

  const isVendorScoped = isVendorScopedUser(currentUser)
  const visibleProducts = useMemo(
    () => (isVendorScoped ? products.filter((product) => isProductOwnedByUser(currentUser, product)) : products),
    [currentUser, isVendorScoped, products]
  )
  const allowCreate = canCreateProduct(currentUser)
  const canView = canViewProducts(currentUser)

  const statusOptions: UiSelectOption[] = [
    { value: '', label: 'Filter by Status' },
    { value: 'true', label: UI_PRODUCT_STATUS_ACTIVE },
    { value: 'false', label: UI_PRODUCT_STATUS_SUSPENDED },
  ]

  const toolbar = (
    <TableToolbar
      start={
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {onSearchChange ? (
            <Form.Control
              type="search"
              placeholder={UI_TABLE_SEARCH_PLACEHOLDER}
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              style={{ maxWidth: '300px' }}
            />
          ) : null}
          {onStatusFilterChange ? (
            <TableFilter
              value={statusFilter ?? ''}
              options={statusOptions}
              onChange={onStatusFilterChange}
              placeholder="All Statuses"
            />
          ) : null}
        </div>
      }
      end={
        allowCreate ? (
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreate(true)}>
            {UI_PRODUCT_BUTTON_CREATE}
          </Button>
        ) : null
      }
    />
  )

  const columns: UiDataTableColumn<ProductListItem>[] = useMemo(
    () => [
      {
        id: UI_PRODUCT_COLUMN_ID_NAME,
        header: UI_PRODUCT_COLUMN_HEADER_NAME,
        cell: (row) => row.name,
      },
      {
        id: UI_PRODUCT_COLUMN_ID_SLUG,
        header: UI_PRODUCT_COLUMN_HEADER_SLUG,
        cell: (row) => row.slug,
      },
      {
        id: UI_PRODUCT_COLUMN_ID_STATUS,
        header: UI_PRODUCT_COLUMN_HEADER_STATUS,
        cell: (row) => (row.isActive ? UI_PRODUCT_STATUS_ACTIVE : UI_PRODUCT_STATUS_SUSPENDED),
      },
      {
        id: UI_PRODUCT_COLUMN_ID_VENDOR,
        header: UI_PRODUCT_COLUMN_HEADER_VENDOR,
        cell: (row) => row.vendorId ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_PRODUCT_COLUMN_ID_ACTIONS,
        header: UI_PRODUCT_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateProduct(currentUser, row)) {
            return null
          }
          return (
            <Stack direction="row" gap="small">
              <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => setEditingProduct(row)}>
                {UI_PRODUCT_BUTTON_EDIT}
              </Button>
              <ProductRowActions
                client={client}
                productId={row.id}
                isActive={row.isActive}
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

  const refreshWith = (action: 'create' | 'update' | 'delete' | 'suspend' | 'resume') => {
    onRefresh?.()
    notifyProductSuccess(notificationBus, action)
  }

  const handleMutationError = () => {
    notifyCrudError(notificationBus)
  }

  return (
    <Stack direction="column" gap="medium">
      <DataTable
        data={canView ? visibleProducts : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_PRODUCT_EMPTY_STATE_MESSAGE}
        toolbar={toolbar}
      />

      {allowCreate ? (
        <ProductFormFlow
          client={client}
          mode="create"
          show={showCreate}
          onClose={() => setShowCreate(false)}
          submitLabel={UI_PRODUCT_FORM_SUBMIT_CREATE}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('create')}
          onError={handleMutationError}
        />
      ) : null}

      {editingProduct ? (
        <ProductFormFlow
          client={client}
          mode="update"
          productId={editingProduct.id}
          show={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          submitLabel={UI_PRODUCT_FORM_SUBMIT_UPDATE}
          defaultValues={{
            name: editingProduct.name,
            slug: editingProduct.slug,
            description: editingProduct.description,
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
        />
      ) : null}
    </Stack>
  )
}
