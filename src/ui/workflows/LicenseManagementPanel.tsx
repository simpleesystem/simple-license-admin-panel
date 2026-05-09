import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client, License, LicenseStatus, User } from '@/simpleLicense'
import {
  canCreateLicense,
  canUpdateLicense,
  canViewLicenses,
  isLicenseOwnedByUser,
  isVendorScopedUser,
} from '../../app/auth/permissions'
import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_LICENSE_BUTTON_CREATE,
  UI_LICENSE_COLUMN_HEADER_ACTIONS,
  UI_LICENSE_COLUMN_HEADER_CUSTOMER,
  UI_LICENSE_COLUMN_HEADER_DOMAIN,
  UI_LICENSE_COLUMN_HEADER_PRODUCT,
  UI_LICENSE_COLUMN_HEADER_STATUS,
  UI_LICENSE_COLUMN_HEADER_TIER,
  UI_LICENSE_COLUMN_ID_ACTIONS,
  UI_LICENSE_COLUMN_ID_CUSTOMER,
  UI_LICENSE_COLUMN_ID_DOMAIN,
  UI_LICENSE_COLUMN_ID_PRODUCT,
  UI_LICENSE_COLUMN_ID_STATUS,
  UI_LICENSE_COLUMN_ID_TIER,
  UI_LICENSE_EMPTY_STATE_MESSAGE,
  UI_LICENSE_FORM_SUBMIT_CREATE,
  UI_LICENSE_PRODUCT_FILTER_LABEL,
  UI_LICENSE_STATUS_ACTIVE,
  UI_LICENSE_STATUS_INACTIVE,
  UI_LICENSE_STATUS_REVOKED,
  UI_LICENSE_STATUS_SUSPENDED,
  UI_STACK_GAP_MEDIUM,
  UI_TABLE_FILTER_LABEL_STATUS,
  UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableControls } from '../data/TableControls'
import { TableFilter } from '../data/TableFilter'
import { TablePaginationFooter } from '../data/TablePaginationFooter'
import { TenantFilterControl } from '../data/TenantFilterControl'
import {
  createStandardStatusFilterField,
  createStandardTableSearchField,
  createTableFilterField,
} from '../data/tableFieldFactory'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSelectOption, UiSortDirection } from '../types'
import { LicenseFormFlow } from './LicenseFormFlow'
import { LicenseRowActions } from './LicenseRowActions'
import { LicenseUpdateDialog } from './LicenseUpdateDialog'

export type LicenseListItem = {
  id: string
  licenseKey: string
  productSlug: string
  tierCode: string
  customerEmail: string
  domain?: string | null
  status: LicenseStatus
  softDeletedAt?: Date | string | null
  vendorId?: string | null
}

type LicenseManagementPanelProps = {
  client: Client
  licenses: readonly LicenseListItem[]
  currentUser?: User | null
  tierOptions: readonly UiSelectOption[]
  productOptions: readonly UiSelectOption[]
  selectedTenantId?: string
  tenantOptions?: readonly UiSelectOption[]
  showTenantFilter?: boolean
  onTenantFilterChange?: (tenantId: string) => void
  selectedProductSlug?: string
  onProductFilterChange?: (productSlug: string) => void
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

export function LicenseManagementPanel({
  client,
  licenses,
  currentUser,
  tierOptions,
  productOptions,
  selectedTenantId = '',
  tenantOptions = [],
  showTenantFilter = false,
  onTenantFilterChange,
  selectedProductSlug = '',
  onProductFilterChange,
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
}: LicenseManagementPanelProps) {
  const [editingLicense, setEditingLicense] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const isVendorScoped = isVendorScopedUser(currentUser ?? null)
  const visibleLicenses = useMemo(
    () =>
      isVendorScoped
        ? (licenses ?? []).filter((license) => isLicenseOwnedByUser(currentUser ?? null, license as unknown as License))
        : (licenses ?? []),
    [currentUser, isVendorScoped, licenses]
  )
  const allowCreate = canCreateLicense(currentUser ?? null)
  const canView = canViewLicenses(currentUser ?? null)

  const statusOptions: UiSelectOption[] = [
    { value: '', label: UI_TABLE_FILTER_LABEL_STATUS },
    { value: 'ACTIVE', label: UI_LICENSE_STATUS_ACTIVE },
    { value: 'INACTIVE', label: UI_LICENSE_STATUS_INACTIVE },
    { value: 'SUSPENDED', label: UI_LICENSE_STATUS_SUSPENDED },
    { value: 'REVOKED', label: UI_LICENSE_STATUS_REVOKED },
  ]

  const toolbar = (
    <TableControls
      search={
        onSearchChange
          ? createStandardTableSearchField({
              value: searchTerm,
              onChange: onSearchChange,
            })
          : undefined
      }
      filters={
        <>
          <TenantFilterControl
            show={showTenantFilter}
            value={selectedTenantId}
            options={tenantOptions}
            onChange={onTenantFilterChange}
          />
          {onProductFilterChange ? (
            <TableFilter
              {...createTableFilterField({
                label: UI_LICENSE_PRODUCT_FILTER_LABEL,
                value: selectedProductSlug,
                options: productOptions,
                onChange: onProductFilterChange,
              })}
            />
          ) : null}
          {onStatusFilterChange ? (
            <TableFilter
              {...createStandardStatusFilterField({
                label: UI_TABLE_FILTER_LABEL_STATUS,
                value: statusFilter ?? '',
                options: statusOptions,
                onChange: onStatusFilterChange,
                placeholder: UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES,
              })}
            />
          ) : null}
        </>
      }
      actions={
        allowCreate ? (
          <Button variant={UI_BUTTON_VARIANT_PRIMARY} onClick={() => setShowCreate(true)}>
            {UI_LICENSE_BUTTON_CREATE}
          </Button>
        ) : null
      }
    />
  )

  const columns: UiDataTableColumn<LicenseListItem>[] = useMemo(
    () => [
      {
        id: UI_LICENSE_COLUMN_ID_CUSTOMER,
        header: UI_LICENSE_COLUMN_HEADER_CUSTOMER,
        cell: (row) => row.customerEmail,
        sortable: true,
      },
      {
        id: UI_LICENSE_COLUMN_ID_PRODUCT,
        header: UI_LICENSE_COLUMN_HEADER_PRODUCT,
        cell: (row) => row.productSlug,
        sortable: true,
      },
      {
        id: UI_LICENSE_COLUMN_ID_DOMAIN,
        header: UI_LICENSE_COLUMN_HEADER_DOMAIN,
        cell: (row) => row.domain ?? UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_LICENSE_COLUMN_ID_TIER,
        header: UI_LICENSE_COLUMN_HEADER_TIER,
        cell: (row) => row.tierCode,
        sortable: true,
      },
      {
        id: UI_LICENSE_COLUMN_ID_STATUS,
        header: UI_LICENSE_COLUMN_HEADER_STATUS,
        cell: (row) => row.status ?? UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_LICENSE_COLUMN_ID_ACTIONS,
        header: UI_LICENSE_COLUMN_HEADER_ACTIONS,
        cell: (row) => {
          if (!canUpdateLicense(currentUser ?? null)) {
            return UI_VALUE_PLACEHOLDER
          }
          return (
            <LicenseRowActions
              client={client}
              licenseKey={row.licenseKey}
              licenseStatus={row.status}
              licenseVendorId={row.vendorId}
              currentUser={currentUser}
              onEdit={setEditingLicense}
              onCompleted={onRefresh}
            />
          )
        },
      },
    ],
    [client, currentUser, onRefresh]
  )

  const editingLicenseData = useMemo(() => {
    if (!editingLicense) {
      return null
    }
    return licenses.find((license) => license.licenseKey === editingLicense)
  }, [editingLicense, licenses])

  const createProductOptions = useMemo(
    () => productOptions.filter((option) => option.value.length > 0),
    [productOptions]
  )

  return (
    <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
      <DataTable
        data={canView ? visibleLicenses : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_LICENSE_EMPTY_STATE_MESSAGE}
        sortState={sortState}
        onSort={onSortChange}
        toolbar={toolbar}
        footer={<TablePaginationFooter page={page} totalPages={totalPages} onPageChange={onPageChange} />}
      />

      {allowCreate ? (
        <LicenseFormFlow
          client={client}
          mode="create"
          show={showCreate}
          onClose={() => setShowCreate(false)}
          submitLabel={UI_LICENSE_FORM_SUBMIT_CREATE}
          tierOptions={tierOptions}
          productOptions={createProductOptions}
          defaultValues={{
            product_slug: createProductOptions[0]?.value ?? '',
            tier_code: tierOptions[0]?.value ?? '',
          }}
          onCompleted={onRefresh}
        />
      ) : null}

      {editingLicenseData ? (
        <LicenseUpdateDialog
          client={client}
          licenseKey={editingLicenseData.licenseKey}
          show={Boolean(editingLicense)}
          onClose={() => setEditingLicense(null)}
          currentUser={currentUser}
          tierOptions={tierOptions}
          initialValues={{
            tier_code: editingLicenseData.tierCode,
            customer_email: editingLicenseData.customerEmail,
          }}
          onCompleted={onRefresh}
        />
      ) : null}
    </Stack>
  )
}
