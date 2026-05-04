import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import type { AuditLogEntry, AuditLogFilters, Client } from '@/simpleLicense'
import { useAuditLogs } from '@/simpleLicense'

import {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_INFO,
  UI_AUDIT_LOGS_CELL_CLASS,
  UI_AUDIT_LOGS_COLUMN_ACTION,
  UI_AUDIT_LOGS_COLUMN_ADMIN,
  UI_AUDIT_LOGS_COLUMN_DETAILS,
  UI_AUDIT_LOGS_COLUMN_IP,
  UI_AUDIT_LOGS_COLUMN_RESOURCE_ID,
  UI_AUDIT_LOGS_COLUMN_RESOURCE_TYPE,
  UI_AUDIT_LOGS_COLUMN_TIMESTAMP,
  UI_AUDIT_LOGS_COLUMN_USER_AGENT,
  UI_AUDIT_LOGS_DEFAULT_LIMIT,
  UI_AUDIT_LOGS_DESCRIPTION,
  UI_AUDIT_LOGS_DETAILS_PREVIEW_LIMIT,
  UI_AUDIT_LOGS_EMPTY_STATE,
  UI_AUDIT_LOGS_ERROR_BODY,
  UI_AUDIT_LOGS_ERROR_TITLE,
  UI_AUDIT_LOGS_FILTER_ACTION_LABEL,
  UI_AUDIT_LOGS_FILTER_ADMIN_LABEL,
  UI_AUDIT_LOGS_FILTER_APPLY_LABEL,
  UI_AUDIT_LOGS_FILTER_RESET_LABEL,
  UI_AUDIT_LOGS_FILTER_RESOURCE_ID_LABEL,
  UI_AUDIT_LOGS_FILTER_RESOURCE_TYPE_LABEL,
  UI_AUDIT_LOGS_LOADING_BODY,
  UI_AUDIT_LOGS_LOADING_TITLE,
  UI_AUDIT_LOGS_METADATA_CELL_CLASS,
  UI_AUDIT_LOGS_PAGE_SIZE_LABEL,
  UI_AUDIT_LOGS_PAGE_SIZE_OPTIONS,
  UI_AUDIT_LOGS_PANEL_CLASS,
  UI_AUDIT_LOGS_RANGE_LABEL,
  UI_AUDIT_LOGS_RANGE_SEPARATOR,
  UI_AUDIT_LOGS_SORT_ACTION,
  UI_AUDIT_LOGS_SORT_ADMIN,
  UI_AUDIT_LOGS_SORT_CREATED_AT,
  UI_AUDIT_LOGS_SORT_IP,
  UI_AUDIT_LOGS_SORT_RESOURCE_ID,
  UI_AUDIT_LOGS_SORT_RESOURCE_TYPE,
  UI_AUDIT_LOGS_TABLE_CLASS,
  UI_AUDIT_LOGS_TITLE,
  UI_AUDIT_LOGS_TOTAL_LABEL,
  UI_AUDIT_LOGS_USER_AGENT_PREVIEW_LIMIT,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_CLASS_AUDIT_FILTER_FIELD,
  UI_CLASS_AUDIT_FILTER_LABEL,
  UI_COLUMN_ID_AUDIT_LOG_ACTION,
  UI_COLUMN_ID_AUDIT_LOG_ADMIN,
  UI_COLUMN_ID_AUDIT_LOG_DETAILS,
  UI_COLUMN_ID_AUDIT_LOG_IP,
  UI_COLUMN_ID_AUDIT_LOG_RESOURCE_ID,
  UI_COLUMN_ID_AUDIT_LOG_RESOURCE_TYPE,
  UI_COLUMN_ID_AUDIT_LOG_TIMESTAMP,
  UI_COLUMN_ID_AUDIT_LOG_USER_AGENT,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_TIME_FORMAT_OPTIONS,
  UI_FIELD_AUDIT_FILTER_ACTION,
  UI_FIELD_AUDIT_FILTER_ADMIN,
  UI_FIELD_AUDIT_FILTER_RESOURCE_ID,
  UI_FIELD_AUDIT_FILTER_RESOURCE_TYPE,
  UI_SIZE_SMALL,
  UI_SORT_DESC,
  UI_STACK_GAP_MEDIUM,
  UI_TEXT_ALIGN_END,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableControls } from '../data/TableControls'
import { TablePaginationFooter } from '../data/TablePaginationFooter'
import { InlineAlert } from '../feedback/InlineAlert'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn, UiDataTableSortState } from '../types'

type AuditLogsPanelProps = {
  client: Client
  title?: string
  initialFilters?: AuditLogFilters
  pageSize?: number
}

type AuditLogRow = AuditLogEntry
type AuditLogSortBy = NonNullable<AuditLogFilters['sortBy']>

const AUDIT_LOG_SORT_BY_COLUMN: Record<string, AuditLogSortBy> = {
  [UI_COLUMN_ID_AUDIT_LOG_TIMESTAMP]: UI_AUDIT_LOGS_SORT_CREATED_AT,
  [UI_COLUMN_ID_AUDIT_LOG_ADMIN]: UI_AUDIT_LOGS_SORT_ADMIN,
  [UI_COLUMN_ID_AUDIT_LOG_ACTION]: UI_AUDIT_LOGS_SORT_ACTION,
  [UI_COLUMN_ID_AUDIT_LOG_RESOURCE_TYPE]: UI_AUDIT_LOGS_SORT_RESOURCE_TYPE,
  [UI_COLUMN_ID_AUDIT_LOG_RESOURCE_ID]: UI_AUDIT_LOGS_SORT_RESOURCE_ID,
  [UI_COLUMN_ID_AUDIT_LOG_IP]: UI_AUDIT_LOGS_SORT_IP,
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return UI_VALUE_PLACEHOLDER
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

const formatDateTimeValue = (value: string, formatter: Intl.DateTimeFormat) => {
  if (value.trim().length === 0) {
    return UI_VALUE_PLACEHOLDER
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return UI_VALUE_PLACEHOLDER
  }

  return formatter.format(date)
}

const truncateValue = (value: string, maxLength: number) => {
  if (value.length <= maxLength || value === UI_VALUE_PLACEHOLDER) {
    return value
  }

  return `${value.slice(0, maxLength)}…`
}

const renderAuditCell = (value: unknown, className: string = UI_AUDIT_LOGS_CELL_CLASS, previewLimit?: number) => {
  const formattedValue = formatValue(value)
  const displayValue = previewLimit ? truncateValue(formattedValue, previewLimit) : formattedValue
  const title = formattedValue === UI_VALUE_PLACEHOLDER ? undefined : formattedValue

  return (
    <span className={className} title={title}>
      {displayValue}
    </span>
  )
}

type AuditLogsFilterBarProps = {
  formState: AuditLogFilters
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onReset: () => void
}

function AuditLogsFilterBar({ formState, onChange, onSubmit, onReset }: AuditLogsFilterBarProps) {
  return (
    <Form className="row g-2 align-items-end w-100" onSubmit={onSubmit}>
      <Form.Group className={UI_CLASS_AUDIT_FILTER_FIELD} controlId={UI_FIELD_AUDIT_FILTER_ADMIN}>
        <Form.Label className={UI_CLASS_AUDIT_FILTER_LABEL}>{UI_AUDIT_LOGS_FILTER_ADMIN_LABEL}</Form.Label>
        <Form.Control
          name={UI_FIELD_AUDIT_FILTER_ADMIN}
          size={UI_SIZE_SMALL}
          value={formState.adminId ?? ''}
          onChange={onChange}
        />
      </Form.Group>

      <Form.Group className={UI_CLASS_AUDIT_FILTER_FIELD} controlId={UI_FIELD_AUDIT_FILTER_ACTION}>
        <Form.Label className={UI_CLASS_AUDIT_FILTER_LABEL}>{UI_AUDIT_LOGS_FILTER_ACTION_LABEL}</Form.Label>
        <Form.Control
          name={UI_FIELD_AUDIT_FILTER_ACTION}
          size={UI_SIZE_SMALL}
          value={formState.action ?? ''}
          onChange={onChange}
        />
      </Form.Group>

      <Form.Group className={UI_CLASS_AUDIT_FILTER_FIELD} controlId={UI_FIELD_AUDIT_FILTER_RESOURCE_TYPE}>
        <Form.Label className={UI_CLASS_AUDIT_FILTER_LABEL}>{UI_AUDIT_LOGS_FILTER_RESOURCE_TYPE_LABEL}</Form.Label>
        <Form.Control
          name={UI_FIELD_AUDIT_FILTER_RESOURCE_TYPE}
          size={UI_SIZE_SMALL}
          value={formState.resourceType ?? ''}
          onChange={onChange}
        />
      </Form.Group>

      <Form.Group className={UI_CLASS_AUDIT_FILTER_FIELD} controlId={UI_FIELD_AUDIT_FILTER_RESOURCE_ID}>
        <Form.Label className={UI_CLASS_AUDIT_FILTER_LABEL}>{UI_AUDIT_LOGS_FILTER_RESOURCE_ID_LABEL}</Form.Label>
        <Form.Control
          name={UI_FIELD_AUDIT_FILTER_RESOURCE_ID}
          size={UI_SIZE_SMALL}
          value={formState.resourceId ?? ''}
          onChange={onChange}
        />
      </Form.Group>

      <div className="col-12 d-flex flex-wrap gap-2">
        <Button type="submit" variant={UI_BUTTON_VARIANT_PRIMARY} size={UI_SIZE_SMALL}>
          {UI_AUDIT_LOGS_FILTER_APPLY_LABEL}
        </Button>
        <Button type="button" variant={UI_BUTTON_VARIANT_SECONDARY} size={UI_SIZE_SMALL} onClick={onReset}>
          {UI_AUDIT_LOGS_FILTER_RESET_LABEL}
        </Button>
      </div>
    </Form>
  )
}

export function AuditLogsPanel({
  client,
  title = UI_AUDIT_LOGS_TITLE,
  initialFilters,
  pageSize = UI_AUDIT_LOGS_DEFAULT_LIMIT,
}: AuditLogsPanelProps) {
  const [filters, setFilters] = useState<AuditLogFilters>(initialFilters ?? {})
  const [formState, setFormState] = useState<AuditLogFilters>(initialFilters ?? {})
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)
  const [pageIndex, setPageIndex] = useState(0)
  const [sortState, setSortState] = useState<UiDataTableSortState>({
    columnId: UI_COLUMN_ID_AUDIT_LOG_TIMESTAMP,
    direction: UI_SORT_DESC,
  })
  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_TIME_FORMAT_OPTIONS),
    []
  )

  const queryFilters = useMemo(() => {
    return {
      ...filters,
      limit: currentPageSize,
      offset: pageIndex * currentPageSize,
      sortBy: AUDIT_LOG_SORT_BY_COLUMN[sortState.columnId] ?? UI_AUDIT_LOGS_SORT_CREATED_AT,
      sortDirection: sortState.direction,
    }
  }, [currentPageSize, filters, pageIndex, sortState.columnId, sortState.direction])

  const auditLogsQuery = useAuditLogs(client, queryFilters, { retry: false })
  const rows = auditLogsQuery.data?.logs ?? []
  const totalEntries = auditLogsQuery.data?.total ?? 0

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget
    setFormState((previous) => ({
      ...previous,
      [name]: value.length > 0 ? value : undefined,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPageIndex(0)
    setFilters(formState)
  }

  const handleReset = () => {
    setFormState({})
    setFilters({})
    setPageIndex(0)
  }

  const handlePageSizeChange = (size: number) => {
    setCurrentPageSize(size)
    setPageIndex(0)
  }

  const handleSort = (columnId: string, direction: UiDataTableSortState['direction']) => {
    setSortState({ columnId, direction })
    setPageIndex(0)
  }

  const handlePageChange = (nextPage: number) => {
    setPageIndex(Math.max(0, nextPage - 1))
  }

  const columns = useMemo<UiDataTableColumn<AuditLogRow>[]>(() => {
    return [
      {
        id: UI_COLUMN_ID_AUDIT_LOG_TIMESTAMP,
        header: UI_AUDIT_LOGS_COLUMN_TIMESTAMP,
        cell: (row) => formatDateTimeValue(row.createdAt, dateTimeFormatter),
        textAlign: UI_TEXT_ALIGN_END,
        sortable: true,
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_ADMIN,
        header: UI_AUDIT_LOGS_COLUMN_ADMIN,
        cell: (row) => renderAuditCell(row.adminUsername ?? row.adminId),
        sortable: true,
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_ACTION,
        header: UI_AUDIT_LOGS_COLUMN_ACTION,
        cell: (row) => formatValue(row.action),
        sortable: true,
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_RESOURCE_TYPE,
        header: UI_AUDIT_LOGS_COLUMN_RESOURCE_TYPE,
        cell: (row) => formatValue(row.resourceType),
        sortable: true,
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_RESOURCE_ID,
        header: UI_AUDIT_LOGS_COLUMN_RESOURCE_ID,
        cell: (row) => renderAuditCell(row.resourceId, UI_AUDIT_LOGS_METADATA_CELL_CLASS),
        sortable: true,
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_IP,
        header: UI_AUDIT_LOGS_COLUMN_IP,
        cell: (row) => renderAuditCell(row.ipAddress, UI_AUDIT_LOGS_METADATA_CELL_CLASS),
        sortable: true,
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_USER_AGENT,
        header: UI_AUDIT_LOGS_COLUMN_USER_AGENT,
        cell: (row) => renderAuditCell(row.userAgent, UI_AUDIT_LOGS_CELL_CLASS, UI_AUDIT_LOGS_USER_AGENT_PREVIEW_LIMIT),
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_DETAILS,
        header: UI_AUDIT_LOGS_COLUMN_DETAILS,
        cell: (row) =>
          renderAuditCell(row.details, UI_AUDIT_LOGS_METADATA_CELL_CLASS, UI_AUDIT_LOGS_DETAILS_PREVIEW_LIMIT),
      },
    ]
  }, [dateTimeFormatter])

  const panelDescription = `${UI_AUDIT_LOGS_DESCRIPTION} ${UI_AUDIT_LOGS_TOTAL_LABEL}: ${totalEntries.toLocaleString()}`

  if (auditLogsQuery.isLoading) {
    return (
      <Stack direction="column" gap={UI_STACK_GAP_MEDIUM} className={UI_AUDIT_LOGS_PANEL_CLASS}>
        <PanelHeader title={title} description={panelDescription} />
        <InlineAlert variant={UI_ALERT_VARIANT_INFO} title={UI_AUDIT_LOGS_LOADING_TITLE}>
          {UI_AUDIT_LOGS_LOADING_BODY}
        </InlineAlert>
      </Stack>
    )
  }

  if (auditLogsQuery.isError) {
    return (
      <Stack direction="column" gap={UI_STACK_GAP_MEDIUM} className={UI_AUDIT_LOGS_PANEL_CLASS}>
        <PanelHeader title={title} description={panelDescription} />
        <InlineAlert variant={UI_ALERT_VARIANT_DANGER} title={UI_AUDIT_LOGS_ERROR_TITLE}>
          {UI_AUDIT_LOGS_ERROR_BODY}
        </InlineAlert>
      </Stack>
    )
  }

  const totalPages = Math.max(Math.ceil(totalEntries / currentPageSize), 1)
  const currentPage = pageIndex + 1
  const rangeStart = rows.length > 0 ? pageIndex * currentPageSize + 1 : 0
  const rangeEnd = pageIndex * currentPageSize + rows.length
  const summary = (
    <>
      {UI_AUDIT_LOGS_RANGE_LABEL} {rangeStart.toLocaleString()} {UI_AUDIT_LOGS_RANGE_SEPARATOR}{' '}
      {rangeEnd.toLocaleString()} / {totalEntries.toLocaleString()}
    </>
  )

  const toolbar = (
    <TableControls
      filters={
        <AuditLogsFilterBar
          formState={formState}
          onChange={handleFilterChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      }
    />
  )

  const footer = (
    <TablePaginationFooter
      page={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      pageSize={currentPageSize}
      pageSizeOptions={UI_AUDIT_LOGS_PAGE_SIZE_OPTIONS}
      onPageSizeChange={handlePageSizeChange}
      pageSizeLabel={UI_AUDIT_LOGS_PAGE_SIZE_LABEL}
      summary={summary}
    />
  )

  return (
    <Stack direction="column" gap={UI_STACK_GAP_MEDIUM} className={UI_AUDIT_LOGS_PANEL_CLASS}>
      <PanelHeader title={title} description={panelDescription} />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_AUDIT_LOGS_EMPTY_STATE}
        className={UI_AUDIT_LOGS_TABLE_CLASS}
        sortState={sortState}
        onSort={handleSort}
        toolbar={toolbar}
        footer={footer}
      />
    </Stack>
  )
}
