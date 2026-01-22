import type { Client, Product, User } from '@/simpleLicense'
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
import { useNotificationBus } from '../../notifications/useNotificationBus'
import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_PRODUCT_BUTTON_CREATE,
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
  UI_PRODUCT_STATUS_ACTIVE,
  UI_PRODUCT_STATUS_SUSPENDED,
  UI_TABLE_PAGINATION_LABEL,
  UI_TABLE_PAGINATION_NEXT,
  UI_TABLE_PAGINATION_PREVIOUS,
  UI_TABLE_SEARCH_PLACEHOLDER,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableFilter } from '../data/TableFilter'
import { TableToolbar } from '../data/TableToolbar'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSelectOption, UiSortDirection } from '../types'
import { notifyCrudError, notifyProductSuccess } from './notifications'
import { ProductFormFlow } from './ProductFormFlow'
import { ProductRowActions } from './ProductRowActions'
import { ProductUpdateDialog } from './ProductUpdateDialog'

export type ProductListItem = {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  vendorId: string
  vendorName?: string
}

type ProductManagementPanelProps = {
  client: Client
  products: readonly ProductListItem[]
  currentUser?: User | null
  vendorOptions?: readonly UiSelectOption[]
  onRefresh?: () => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
  sortState?: UiDataTableSortState
  onSortChange?: (columnId: string, direction: UiSortDirection) => void
}

export function ProductManagementPanel({
  client,
  products,
  currentUser,
  vendorOptions,
  onRefresh,
  page,
  totalPages,
  onPageChange,
  searchTerm = '',
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortState,
  onSortChange,
}: ProductManagementPanelProps) {
  const [editingProduct, setEditingProduct] = useState<{ id: string } | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const notificationBus = useNotificationBus()

  const isVendorScoped = isVendorScopedUser(currentUser ?? null)
  const visibleProducts = useMemo(
    () => (isVendorScoped ? (products ?? []).filter((product) => isProductOwnedByUser(currentUser ?? null, product as unknown as Product)) : (products ?? [])),
    [currentUser, isVendorScoped, products]
  )
  const allowCreate = canCreateProduct(currentUser ?? null)
  const canView = canViewProducts(currentUser ?? null)

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

  const columns: UiDataTableColumn<ProductListItem>[] = useMemo(
    () => [
      {
        id: UI_PRODUCT_COLUMN_ID_NAME,
        header: UI_PRODUCT_COLUMN_HEADER_NAME,
        cell: (row) => row.name,
        sortable: true,
      },
      {
        id: UI_PRODUCT_COLUMN_ID_SLUG,
        header: UI_PRODUCT_COLUMN_HEADER_SLUG,
        cell: (row) => row.slug,
        sortable: true,
      },
      {
        id: UI_PRODUCT_COLUMN_ID_STATUS,
        header: UI_PRODUCT_COLUMN_HEADER_STATUS,
        cell: (row) => (row.isActive ? UI_PRODUCT_STATUS_ACTIVE : UI_PRODUCT_STATUS_SUSPENDED),
        sortable: true,
      },
      {
        id: UI_PRODUCT_COLUMN_ID_VENDOR,
        header: UI_PRODUCT_COLUMN_HEADER_VENDOR,
        cell: (row) => row.vendorName ?? row.vendorId,
        sortable: true,
      },
      {
        id: UI_PRODUCT_COLUMN_ID_ACTIONS,
        header: UI_PRODUCT_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateProduct(currentUser ?? null)) {
            return UI_VALUE_PLACEHOLDER
          }
          return (
            <ProductRowActions
              client={client}
              productId={row.id}
              isActive={row.isActive}
              vendorId={row.vendorId}
              onEdit={setEditingProduct}
              onCompleted={onRefresh}
              currentUser={currentUser ?? null}
            />
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

  const productToEdit = editingProduct ? (products.find((p) => p.id === editingProduct.id) ?? null) : null

  return (
    <Stack direction="column" gap="medium">
      <DataTable
        data={canView ? visibleProducts : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_PRODUCT_EMPTY_STATE_MESSAGE}
        sortState={sortState}
        onSort={onSortChange}
        toolbar={toolbar}
        footer={pagination}
      />

      {allowCreate ? (
        <ProductFormFlow
          client={client}
          mode="create"
          show={showCreate}
          onClose={() => setShowCreate(false)}
          submitLabel={UI_PRODUCT_FORM_SUBMIT_CREATE}
          vendorOptions={vendorOptions}
          currentUser={currentUser ?? undefined}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('create')}
          onError={handleMutationError}
        />
      ) : null}

      {productToEdit ? (
        <ProductUpdateDialog
          client={client}
          productId={productToEdit.id}
          show={Boolean(productToEdit)}
          onClose={() => setEditingProduct(null)}
          currentUser={currentUser}
          vendorOptions={vendorOptions}
          initialValues={{
            name: productToEdit.name,
            slug: productToEdit.slug,
            description: productToEdit.description,
          }}
          onCompleted={onRefresh}
          onSuccess={() => refreshWith('update')}
          onError={handleMutationError}
        />
      ) : null}
    </Stack>
  )
}
