import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client, Product, User } from '@/simpleLicense'
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
  UI_PRODUCT_PANEL_DESCRIPTION,
  UI_PRODUCT_PANEL_TITLE,
  UI_PRODUCT_STATUS_ACTIVE,
  UI_PRODUCT_STATUS_SUSPENDED,
  UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES,
  UI_TABLE_SEARCH_PLACEHOLDER,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableControls } from '../data/TableControls'
import { TableFilter } from '../data/TableFilter'
import { TablePaginationFooter } from '../data/TablePaginationFooter'
import { PanelHeader } from '../layout/PanelHeader'
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
    () =>
      isVendorScoped
        ? (products ?? []).filter((product) => isProductOwnedByUser(currentUser ?? null, product as unknown as Product))
        : (products ?? []),
    [currentUser, isVendorScoped, products]
  )
  const allowCreate = canCreateProduct(currentUser ?? null)
  const canView = canViewProducts(currentUser ?? null)

  const statusOptions: UiSelectOption[] = [
    { value: 'true', label: UI_PRODUCT_STATUS_ACTIVE },
    { value: 'false', label: UI_PRODUCT_STATUS_SUSPENDED },
  ]

  const toolbar = (
    <TableControls
      search={
        onSearchChange
          ? {
              value: searchTerm,
              onChange: onSearchChange,
              placeholder: UI_TABLE_SEARCH_PLACEHOLDER,
            }
          : undefined
      }
      filters={
        onStatusFilterChange ? (
          <TableFilter
            label={UI_PRODUCT_COLUMN_HEADER_STATUS}
            value={statusFilter ?? ''}
            options={statusOptions}
            onChange={onStatusFilterChange}
            placeholder={UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES}
          />
        ) : null
      }
      actions={
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
              productSlug={row.slug}
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
      <PanelHeader title={UI_PRODUCT_PANEL_TITLE} description={UI_PRODUCT_PANEL_DESCRIPTION} />

      <DataTable
        data={canView ? visibleProducts : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_PRODUCT_EMPTY_STATE_MESSAGE}
        sortState={sortState}
        onSort={onSortChange}
        toolbar={toolbar}
        footer={<TablePaginationFooter page={page} totalPages={totalPages} onPageChange={onPageChange} />}
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
