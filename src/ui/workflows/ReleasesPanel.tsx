import { useMemo, useState } from 'react'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'

import type { Client, PluginRelease } from '@/simpleLicense'
import {
  UI_BADGE_VARIANT_DANGER,
  UI_BADGE_VARIANT_SUCCESS,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_CLASS_ALIGN_TEXT_BOTTOM,
  UI_CLASS_INLINE_FILENAME,
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
  UI_RELEASE_FILE_MISSING,
  UI_RELEASE_FILE_PRESENT,
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
  UI_RELEASE_SEARCH_PLACEHOLDER,
  UI_RELEASE_SELECT_PRODUCT_BODY,
  UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER,
  UI_STACK_GAP_MEDIUM,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableControls } from '../data/TableControls'
import { TableFilter } from '../data/TableFilter'
import { TablePaginationFooter } from '../data/TablePaginationFooter'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState, UiSelectOption, UiSortDirection } from '../types'
import { EmptyState } from '../typography/EmptyState'
import { formatBytes, formatDateSafe } from '../utils/formatUtils'
import { ReleaseFormFlow } from './ReleaseFormFlow'
import { ReleaseRowActions } from './ReleaseRowActions'

export type ReleaseListItem = PluginRelease

type ReleasesPanelProps = {
  client: Client
  releases: readonly ReleaseListItem[]
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
  sortState?: UiDataTableSortState
  onSortChange?: (columnId: string, direction: UiSortDirection) => void
  allowCreate: boolean
  allowPromote: boolean
  allowDelete: boolean
  onRefresh?: () => void
}

export function ReleasesPanel({
  client,
  releases,
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
  sortState,
  onSortChange,
  allowCreate,
  allowPromote,
  allowDelete,
  onRefresh,
}: ReleasesPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const productFilterOptions = useMemo<UiSelectOption[]>(
    () => [{ value: '', label: UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER }, ...productOptions],
    [productOptions]
  )

  const channelOptions: UiSelectOption[] = [
    { value: UI_RELEASE_FILTER_VALUE_ALL, label: UI_RELEASE_FILTER_ALL },
    { value: UI_RELEASE_FILTER_VALUE_STABLE, label: UI_RELEASE_FILTER_STABLE_ONLY },
    { value: UI_RELEASE_FILTER_VALUE_PRERELEASE, label: UI_RELEASE_FILTER_PRERELEASE_ONLY },
  ]

  const toolbar = (
    <TableControls
      search={{
        value: searchTerm,
        onChange: onSearchChange,
        placeholder: UI_RELEASE_SEARCH_PLACEHOLDER,
        disabled: !selectedProductId,
      }}
      filters={
        <>
          <TableFilter
            label={UI_RELEASE_PRODUCT_FILTER_LABEL}
            value={selectedProductId}
            options={productFilterOptions}
            onChange={onProductChange}
          />
          <TableFilter
            label={UI_RELEASE_CHANNEL_FILTER_LABEL}
            value={channelFilter}
            options={channelOptions}
            onChange={onChannelFilterChange}
            disabled={!selectedProductId}
          />
        </>
      }
      actions={
        allowCreate ? (
          <Button
            variant={UI_BUTTON_VARIANT_PRIMARY}
            onClick={() => setShowCreateModal(true)}
            disabled={!selectedProductId}
          >
            {UI_RELEASE_BUTTON_NEW}
          </Button>
        ) : null
      }
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
            {row.filePresent === true ? (
              <Badge bg={UI_BADGE_VARIANT_SUCCESS} className={UI_CLASS_ALIGN_TEXT_BOTTOM}>
                {UI_RELEASE_FILE_PRESENT}
              </Badge>
            ) : null}
            {row.filePresent === false ? (
              <Badge bg={UI_BADGE_VARIANT_DANGER} className={UI_CLASS_ALIGN_TEXT_BOTTOM}>
                {UI_RELEASE_FILE_MISSING}
              </Badge>
            ) : null}
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
        cell: (row) => formatDateSafe(row.createdAt),
        sortable: true,
      },
      {
        id: UI_RELEASE_COLUMN_ID_STATUS,
        header: UI_RELEASE_COLUMN_STATUS,
        cell: (row) =>
          row.isPromoted ? <Badge bg={UI_BADGE_VARIANT_SUCCESS}>{UI_RELEASE_LIVE_BADGE}</Badge> : UI_VALUE_PLACEHOLDER,
        sortable: true,
      },
      {
        id: UI_RELEASE_COLUMN_ID_ACTIONS,
        header: UI_RELEASE_COLUMN_ACTIONS,
        cell: (row) =>
          allowPromote || allowDelete ? (
            <ReleaseRowActions
              client={client}
              productId={selectedProductId}
              releaseId={row.id}
              releaseVersion={row.version}
              releaseFileName={row.fileName}
              isPromoted={Boolean(row.isPromoted)}
              allowPromote={allowPromote}
              allowDelete={allowDelete}
              onCompleted={onRefresh}
            />
          ) : (
            UI_VALUE_PLACEHOLDER
          ),
      },
    ],
    [allowDelete, allowPromote, client, onRefresh, selectedProductId]
  )

  const emptyState = selectedProductId ? (
    <EmptyState title={UI_RELEASE_EMPTY_MESSAGE} />
  ) : (
    <EmptyState title={UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER} body={UI_RELEASE_SELECT_PRODUCT_BODY} />
  )

  return (
    <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
      <PanelHeader title={UI_RELEASE_PANEL_TITLE} description={UI_RELEASE_PANEL_DESCRIPTION} />
      <DataTable
        data={selectedProductId ? releases : []}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={emptyState}
        sortState={sortState}
        onSort={onSortChange}
        toolbar={toolbar}
        footer={<TablePaginationFooter page={page} totalPages={totalPages} onPageChange={onPageChange} />}
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
