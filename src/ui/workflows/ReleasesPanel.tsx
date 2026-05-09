import { useMemo, useState } from 'react'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'

import type { Client, PluginRelease } from '@/simpleLicense'
import { useAdminReleaseStorageDiagnostics } from '@/simpleLicense/hooks'
import type { ReleaseStorageDiagnostic } from '@/simpleLicense/types/api'
import {
  UI_BADGE_VARIANT_DANGER,
  UI_BADGE_VARIANT_SUCCESS,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_CLASS_ALIGN_TEXT_BOTTOM,
  UI_CLASS_INLINE_FILENAME,
  UI_CLASS_MARGIN_BOTTOM_SMALL,
  UI_CLASS_TABLE,
  UI_CLASS_TABLE_HEADER_CELL,
  UI_CLASS_TABLE_WRAPPER,
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
  UI_RELEASE_DIAGNOSTICS_BUTTON,
  UI_RELEASE_DIAGNOSTICS_CLOSE,
  UI_RELEASE_DIAGNOSTICS_COLUMN_FILE,
  UI_RELEASE_DIAGNOSTICS_COLUMN_PRESENT,
  UI_RELEASE_DIAGNOSTICS_COLUMN_RESOLVED_KEY,
  UI_RELEASE_DIAGNOSTICS_COLUMN_VERSION,
  UI_RELEASE_DIAGNOSTICS_EMPTY,
  UI_RELEASE_DIAGNOSTICS_ERROR,
  UI_RELEASE_DIAGNOSTICS_LOADING,
  UI_RELEASE_DIAGNOSTICS_TITLE,
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
  UI_TENANT_FILTER_LABEL,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableFilter } from '../data/TableFilter'
import { TablePaginationFooter } from '../data/TablePaginationFooter'
import { TableSearchInput } from '../data/TableSearchInput'
import { TableToolbar } from '../data/TableToolbar'
import { TenantFilterControl } from '../data/TenantFilterControl'
import { createTableFilterField, createTableSearchField } from '../data/tableFieldFactory'
import { RouteStatus } from '../feedback/RouteStatus'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiDataTableColumn, UiDataTableSortState, UiSelectOption, UiSortDirection } from '../types'
import { EmptyState } from '../typography/EmptyState'
import { formatBytes, formatDateSafe } from '../utils/formatUtils'
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
  sortState?: UiDataTableSortState
  onSortChange?: (columnId: string, direction: UiSortDirection) => void
  allowCreate: boolean
  allowPromote: boolean
  allowDelete: boolean
  showPanelHeader?: boolean
  releasesLoading?: boolean
  releasesError?: boolean
  onRefresh?: () => void
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
  sortState,
  onSortChange,
  allowCreate,
  allowPromote,
  allowDelete,
  showPanelHeader = true,
  releasesLoading,
  releasesError,
  onRefresh,
}: ReleasesPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false)

  const diagnosticsQuery = useAdminReleaseStorageDiagnostics(client, selectedProductId, showDiagnosticsModal)

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
    <TableToolbar
      start={
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
      end={
        <>
          {allowDelete ? (
            <Button
              variant={UI_BUTTON_VARIANT_SECONDARY}
              onClick={() => setShowDiagnosticsModal(true)}
              disabled={!selectedProductId}
            >
              {UI_RELEASE_DIAGNOSTICS_BUTTON}
            </Button>
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
        </>
      }
    />
  )

  const diagnosticsBody = diagnosticsQuery.isLoading ? (
    <p className={UI_CLASS_MARGIN_BOTTOM_SMALL}>{UI_RELEASE_DIAGNOSTICS_LOADING}</p>
  ) : diagnosticsQuery.isError ? (
    <p className={UI_CLASS_MARGIN_BOTTOM_SMALL}>{UI_RELEASE_DIAGNOSTICS_ERROR}</p>
  ) : (diagnosticsQuery.data ?? []).length === 0 ? (
    <p className={UI_CLASS_MARGIN_BOTTOM_SMALL}>{UI_RELEASE_DIAGNOSTICS_EMPTY}</p>
  ) : (
    <div className={UI_CLASS_TABLE_WRAPPER}>
      <table className={UI_CLASS_TABLE}>
        <thead>
          <tr>
            <th className={UI_CLASS_TABLE_HEADER_CELL}>{UI_RELEASE_DIAGNOSTICS_COLUMN_VERSION}</th>
            <th className={UI_CLASS_TABLE_HEADER_CELL}>{UI_RELEASE_DIAGNOSTICS_COLUMN_FILE}</th>
            <th className={UI_CLASS_TABLE_HEADER_CELL}>{UI_RELEASE_DIAGNOSTICS_COLUMN_PRESENT}</th>
            <th className={UI_CLASS_TABLE_HEADER_CELL}>{UI_RELEASE_DIAGNOSTICS_COLUMN_RESOLVED_KEY}</th>
          </tr>
        </thead>
        <tbody>
          {(diagnosticsQuery.data as ReleaseStorageDiagnostic[]).map((diagnostic) => (
            <tr key={diagnostic.releaseId}>
              <td>{diagnostic.version}</td>
              <td>{diagnostic.fileName}</td>
              <td>{diagnostic.filePresent ? UI_RELEASE_FILE_PRESENT : UI_RELEASE_FILE_MISSING}</td>
              <td>{diagnostic.resolvedStorageKey ?? UI_VALUE_PLACEHOLDER}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
        cell: (row) => (
          <ReleaseRowActions
            client={client}
            productId={selectedProductId}
            releaseId={row.id}
            releaseVersion={row.version}
            releaseFileName={row.fileName}
            downloadUrl={client.getReleaseDownloadUrl(selectedProductId, row.id)}
            isPromoted={Boolean(row.isPromoted)}
            allowPromote={allowPromote}
            allowDelete={allowDelete}
            onCompleted={onRefresh}
          />
        ),
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

      <ModalDialog
        show={showDiagnosticsModal}
        onClose={() => setShowDiagnosticsModal(false)}
        title={UI_RELEASE_DIAGNOSTICS_TITLE}
        body={diagnosticsBody}
        secondaryAction={{
          id: 'release-diagnostics-close',
          label: UI_RELEASE_DIAGNOSTICS_CLOSE,
          onClick: () => setShowDiagnosticsModal(false),
          variant: UI_BUTTON_VARIANT_SECONDARY,
        }}
      />
    </Stack>
  )
}
