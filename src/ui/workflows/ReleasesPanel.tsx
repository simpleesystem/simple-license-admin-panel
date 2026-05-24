import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'

import type { Client, PluginRelease } from '@/simpleLicense'
import {
  UI_BADGE_VARIANT_SUCCESS,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_CLASS_INLINE_FILENAME,
  UI_CLASS_RELEASE_REFRESH_STATUS,
  UI_CLASS_RELEASE_TOOLBAR_ACTIONS,
  UI_RELEASE_BUTTON_NEW,
  UI_RELEASE_CHANNEL_FILTER_LABEL,
  UI_RELEASE_COLUMN_ACTIONS,
  UI_RELEASE_COLUMN_CREATED,
  UI_RELEASE_COLUMN_FILE,
  UI_RELEASE_COLUMN_ID_ACTIONS,
  UI_RELEASE_COLUMN_ID_CREATED,
  UI_RELEASE_COLUMN_ID_FILE,
  UI_RELEASE_COLUMN_ID_SIZE,
  UI_RELEASE_COLUMN_ID_STATUS,
  UI_RELEASE_COLUMN_ID_VERSION,
  UI_RELEASE_COLUMN_SIZE,
  UI_RELEASE_COLUMN_STATUS,
  UI_RELEASE_COLUMN_VERSION,
  UI_RELEASE_EMPTY_MESSAGE,
  UI_RELEASE_FILTER_ALL,
  UI_RELEASE_FILTER_PRERELEASE_ONLY,
  UI_RELEASE_FILTER_STABLE_ONLY,
  UI_RELEASE_FILTER_VALUE_ALL,
  UI_RELEASE_FILTER_VALUE_PRERELEASE,
  UI_RELEASE_FILTER_VALUE_STABLE,
  UI_RELEASE_LIVE_BADGE,
  UI_RELEASE_PANEL_DESCRIPTION,
  UI_RELEASE_PANEL_TITLE,
  UI_RELEASE_PRODUCT_FILTER_LABEL,
  UI_RELEASE_SEARCH_LABEL,
  UI_RELEASE_SEARCH_PLACEHOLDER,
  UI_RELEASE_SELECT_PRODUCT_BODY,
  UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER,
  UI_RELEASE_STATUS_ACTION_RETRY,
  UI_RELEASE_STATUS_ERROR_BODY,
  UI_RELEASE_STATUS_ERROR_TITLE,
  UI_RELEASE_STATUS_LOADING_BODY,
  UI_RELEASE_STATUS_LOADING_TITLE,
  UI_STACK_GAP_MEDIUM,
  UI_STYLE_RELEASE_REFRESH_STATUS,
  UI_TABLE_FILTER_PLACEHOLDER_ALL_PRODUCTS,
  UI_TENANT_FILTER_LABEL,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { StandardTablePaginationFooter } from '../data/StandardTablePaginationFooter'
import { TableControls } from '../data/TableControls'
import { TableFilter } from '../data/TableFilter'
import { TableSearchInput } from '../data/TableSearchInput'
import { TenantFilterControl } from '../data/TenantFilterControl'
import { TABLE_BATCH_TABLE_RELEASES, useTableBatchBus } from '../data/tableBatchBus'
import { createTableFilterField, createTableSearchField } from '../data/tableFieldFactory'
import { RouteStatus } from '../feedback/RouteStatus'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSelectOption, UiSortDirection } from '../types'
import { BadgeText } from '../typography/BadgeText'
import { EmptyState } from '../typography/EmptyState'
import { formatBytes, formatDateTimeSafe } from '../utils/formatUtils'
import { ReleaseFormFlow } from './ReleaseFormFlow'
import { ReleaseRowActions } from './ReleaseRowActions'

export type ReleaseListItem = PluginRelease

type ReleasesPanelProps = {
  client: Client
  releases: readonly ReleaseListItem[]
  selectedTenantId: string
  tenantOptions: readonly UiSelectOption[]
  showTenantFilter: boolean
  onTenantChange: (tenantId: string) => void
  selectedProductId: string
  productOptions: readonly UiSelectOption[]
  onProductChange: (productId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  channelFilter: string
  onChannelFilterChange: (value: string) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  sortState?: UiDataTableSortState
  onSortChange?: (columnId: string, direction: UiSortDirection) => void
  allowCreate: boolean
  allowPromote: boolean
  allowDelete: boolean
  showPanelHeader?: boolean
  releasesLoading?: boolean
  releasesError?: boolean
  onRefresh?: () => void
  refreshStatus?: string
}

export function ReleasesPanel({
  client,
  releases,
  selectedTenantId,
  tenantOptions,
  showTenantFilter,
  onTenantChange,
  selectedProductId,
  productOptions,
  onProductChange,
  searchTerm,
  onSearchChange,
  channelFilter,
  onChannelFilterChange,
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  sortState,
  onSortChange,
  allowCreate,
  allowPromote,
  allowDelete,
  showPanelHeader = true,
  releasesLoading,
  releasesError,
  onRefresh,
  refreshStatus,
}: ReleasesPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { selection, batchBar } = useTableBatchBus<ReleaseListItem, typeof TABLE_BATCH_TABLE_RELEASES>({
    tableId: TABLE_BATCH_TABLE_RELEASES,
    enabled: allowDelete && Boolean(selectedProductId),
    visibleRows: releases,
    rowKey: (row) => row.id,
    context: { client, productId: selectedProductId, onRefresh },
    isRowSelectable: (row) => !row.isPromoted,
  })

  const productFilterOptions = useMemo<UiSelectOption[]>(() => [...productOptions], [productOptions])

  const channelOptions: UiSelectOption[] = [
    { value: UI_RELEASE_FILTER_VALUE_ALL, label: UI_RELEASE_FILTER_ALL },
    { value: UI_RELEASE_FILTER_VALUE_STABLE, label: UI_RELEASE_FILTER_STABLE_ONLY },
    { value: UI_RELEASE_FILTER_VALUE_PRERELEASE, label: UI_RELEASE_FILTER_PRERELEASE_ONLY },
  ]

  const toolbarActions =
    (refreshStatus && selectedProductId) || allowCreate ? (
      <div className={UI_CLASS_RELEASE_TOOLBAR_ACTIONS}>
        {refreshStatus && selectedProductId ? (
          <span className={UI_CLASS_RELEASE_REFRESH_STATUS} style={UI_STYLE_RELEASE_REFRESH_STATUS}>
            {refreshStatus}
          </span>
        ) : null}
        {allowCreate ? (
          <Button
            variant={UI_BUTTON_VARIANT_PRIMARY}
            onClick={() => setShowCreateModal(true)}
            disabled={!selectedProductId}
          >
            {UI_RELEASE_BUTTON_NEW}
          </Button>
        ) : null}
      </div>
    ) : null

  const toolbar = (
    <TableControls
      batch={batchBar}
      filters={
        <>
          <TenantFilterControl
            show={showTenantFilter}
            label={UI_TENANT_FILTER_LABEL}
            value={selectedTenantId}
            options={tenantOptions}
            onChange={onTenantChange}
          />
          <TableFilter
            {...createTableFilterField({
              label: UI_RELEASE_PRODUCT_FILTER_LABEL,
              value: selectedProductId,
              options: productFilterOptions,
              onChange: onProductChange,
              placeholder: UI_TABLE_FILTER_PLACEHOLDER_ALL_PRODUCTS,
            })}
          />
          <TableSearchInput
            {...createTableSearchField({
              label: UI_RELEASE_SEARCH_LABEL,
              value: searchTerm,
              onChange: onSearchChange,
              placeholder: UI_RELEASE_SEARCH_PLACEHOLDER,
              disabled: !selectedProductId,
            })}
          />
          <TableFilter
            {...createTableFilterField({
              label: UI_RELEASE_CHANNEL_FILTER_LABEL,
              value: channelFilter,
              options: channelOptions,
              onChange: onChannelFilterChange,
              disabled: !selectedProductId,
            })}
          />
        </>
      }
      refresh={
        onRefresh
          ? {
              onClick: onRefresh,
              disabled: !selectedProductId || Boolean(releasesLoading),
            }
          : undefined
      }
      actions={toolbarActions}
    />
  )

  const columns: UiDataTableColumn<ReleaseListItem>[] = useMemo(
    () => [
      {
        id: UI_RELEASE_COLUMN_ID_VERSION,
        header: UI_RELEASE_COLUMN_VERSION,
        cell: (row) => row.version,
        sortable: true,
      },
      {
        id: UI_RELEASE_COLUMN_ID_FILE,
        header: UI_RELEASE_COLUMN_FILE,
        cell: (row) => (
          <>
            <span className={UI_CLASS_INLINE_FILENAME}>{row.fileName}</span>
          </>
        ),
        sortable: true,
      },
      {
        id: UI_RELEASE_COLUMN_ID_SIZE,
        header: UI_RELEASE_COLUMN_SIZE,
        cell: (row) => formatBytes(row.sizeBytes),
        sortable: true,
      },
      {
        id: UI_RELEASE_COLUMN_ID_CREATED,
        header: UI_RELEASE_COLUMN_CREATED,
        cell: (row) => formatDateTimeSafe(row.createdAt),
        sortable: true,
      },
      {
        id: UI_RELEASE_COLUMN_ID_STATUS,
        header: UI_RELEASE_COLUMN_STATUS,
        cell: (row) =>
          row.isPromoted ? (
            <BadgeText text={UI_RELEASE_LIVE_BADGE} variant={UI_BADGE_VARIANT_SUCCESS} />
          ) : (
            UI_VALUE_PLACEHOLDER
          ),
        sortable: true,
      },
      {
        id: UI_RELEASE_COLUMN_ID_ACTIONS,
        header: UI_RELEASE_COLUMN_ACTIONS,
        cell: (row) => {
          const downloadUrl = client.getReleaseDownloadUrl(selectedProductId, row.id)

          return (
            <ReleaseRowActions
              client={client}
              productId={selectedProductId}
              releaseId={row.id}
              releaseVersion={row.version}
              releaseFileName={row.fileName}
              downloadUrl={downloadUrl}
              isPromoted={Boolean(row.isPromoted)}
              allowPromote={allowPromote}
              allowDelete={allowDelete}
              onCompleted={onRefresh}
            />
          )
        },
      },
    ],
    [allowDelete, allowPromote, client, onRefresh, selectedProductId]
  )

  const emptyState = releasesError ? (
    <RouteStatus
      isError={true}
      errorTitle={UI_RELEASE_STATUS_ERROR_TITLE}
      errorMessage={UI_RELEASE_STATUS_ERROR_BODY}
      retryLabel={UI_RELEASE_STATUS_ACTION_RETRY}
      onRetry={onRefresh}
    />
  ) : releasesLoading ? (
    <RouteStatus
      isLoading={true}
      loadingTitle={UI_RELEASE_STATUS_LOADING_TITLE}
      loadingMessage={UI_RELEASE_STATUS_LOADING_BODY}
    />
  ) : selectedProductId ? (
    <EmptyState title={UI_RELEASE_EMPTY_MESSAGE} />
  ) : (
    <EmptyState title={UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER} body={UI_RELEASE_SELECT_PRODUCT_BODY} />
  )
  const footer = (
    <StandardTablePaginationFooter
      enabled={Boolean(selectedProductId)}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
    />
  )

  return (
    <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
      {showPanelHeader ? (
        <PanelHeader title={UI_RELEASE_PANEL_TITLE} description={UI_RELEASE_PANEL_DESCRIPTION} />
      ) : null}
      <DataTable
        data={selectedProductId && !releasesError ? releases : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={emptyState}
        sortState={sortState}
        onSort={onSortChange}
        selection={selection}
        toolbar={toolbar}
        footer={footer}
      />

      {allowCreate && selectedProductId ? (
        <ReleaseFormFlow
          client={client}
          productId={selectedProductId}
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={onRefresh}
        />
      ) : null}
    </Stack>
  )
}
