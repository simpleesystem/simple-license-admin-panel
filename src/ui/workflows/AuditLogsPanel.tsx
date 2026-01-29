import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import type { AuditLogEntry, AuditLogFilters, Client } from '@/simpleLicense'
import { useAuditLogs } from '@/simpleLicense'

import {
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
  UI_AUDIT_LOGS_TITLE,
  UI_AUDIT_LOGS_TOTAL_LABEL,
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
  UI_STACK_GAP_SMALL,
  UI_TEXT_ALIGN_END,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'

type AuditLogsPanelProps = {
  client: Client
  title?: string
  initialFilters?: AuditLogFilters
  pageSize?: number
}

type AuditLogRow = AuditLogEntry

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return UI_VALUE_PLACEHOLDER
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

export function AuditLogsPanel({
  client,
  title = UI_AUDIT_LOGS_TITLE,
  initialFilters,
  pageSize = UI_AUDIT_LOGS_DEFAULT_LIMIT,
}: AuditLogsPanelProps) {
  const [filters, setFilters] = useState<AuditLogFilters>(initialFilters ?? {})
  const [formState, setFormState] = useState<AuditLogFilters>(initialFilters ?? {})
  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_TIME_FORMAT_OPTIONS),
    []
  )

  const queryFilters = useMemo(() => {
    return {
      ...filters,
      limit: pageSize,
    }
  }, [filters, pageSize])

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
    setFilters(formState)
  }

  const handleReset = () => {
    setFormState({})
    setFilters({})
  }

  const columns = useMemo<UiDataTableColumn<AuditLogRow>[]>(() => {
    return [
      {
        id: UI_COLUMN_ID_AUDIT_LOG_TIMESTAMP,
        header: UI_AUDIT_LOGS_COLUMN_TIMESTAMP,
        cell: (row) => dateTimeFormatter.format(new Date(row.createdAt)),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_ADMIN,
        header: UI_AUDIT_LOGS_COLUMN_ADMIN,
        cell: (row) => formatValue(row.adminUsername ?? row.adminId),
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_ACTION,
        header: UI_AUDIT_LOGS_COLUMN_ACTION,
        cell: (row) => formatValue(row.action),
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_RESOURCE_TYPE,
        header: UI_AUDIT_LOGS_COLUMN_RESOURCE_TYPE,
        cell: (row) => formatValue(row.resourceType),
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_RESOURCE_ID,
        header: UI_AUDIT_LOGS_COLUMN_RESOURCE_ID,
        cell: (row) => formatValue(row.resourceId),
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_IP,
        header: UI_AUDIT_LOGS_COLUMN_IP,
        cell: (row) => formatValue(row.ipAddress),
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_USER_AGENT,
        header: UI_AUDIT_LOGS_COLUMN_USER_AGENT,
        cell: (row) => formatValue(row.userAgent),
      },
      {
        id: UI_COLUMN_ID_AUDIT_LOG_DETAILS,
        header: UI_AUDIT_LOGS_COLUMN_DETAILS,
        cell: (row) => formatValue(row.details),
      },
    ]
  }, [dateTimeFormatter])

  if (auditLogsQuery.isLoading) {
    return (
      <InlineAlert variant="info" title={UI_AUDIT_LOGS_LOADING_TITLE}>
        {UI_AUDIT_LOGS_LOADING_BODY}
      </InlineAlert>
    )
  }

  if (auditLogsQuery.isError) {
    return (
      <InlineAlert variant="danger" title={UI_AUDIT_LOGS_ERROR_TITLE}>
        {UI_AUDIT_LOGS_ERROR_BODY}
      </InlineAlert>
    )
  }

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <div className="d-flex flex-column gap-1">
        <h2 className="h5 mb-0">{title}</h2>
        <p className="text-muted mb-0">{UI_AUDIT_LOGS_DESCRIPTION}</p>
        <span className="text-muted small">
          {UI_AUDIT_LOGS_TOTAL_LABEL}: {totalEntries.toLocaleString()}
        </span>
      </div>

      <Form className="row g-3 align-items-end" onSubmit={handleSubmit}>
        <Form.Group className="col-12 col-md-3" controlId={UI_FIELD_AUDIT_FILTER_ADMIN}>
          <Form.Label>{UI_AUDIT_LOGS_FILTER_ADMIN_LABEL}</Form.Label>
          <Form.Control
            name={UI_FIELD_AUDIT_FILTER_ADMIN}
            value={formState.adminId ?? ''}
            onChange={handleFilterChange}
          />
        </Form.Group>

        <Form.Group className="col-12 col-md-3" controlId={UI_FIELD_AUDIT_FILTER_ACTION}>
          <Form.Label>{UI_AUDIT_LOGS_FILTER_ACTION_LABEL}</Form.Label>
          <Form.Control
            name={UI_FIELD_AUDIT_FILTER_ACTION}
            value={formState.action ?? ''}
            onChange={handleFilterChange}
          />
        </Form.Group>

        <Form.Group className="col-12 col-md-3" controlId={UI_FIELD_AUDIT_FILTER_RESOURCE_TYPE}>
          <Form.Label>{UI_AUDIT_LOGS_FILTER_RESOURCE_TYPE_LABEL}</Form.Label>
          <Form.Control
            name={UI_FIELD_AUDIT_FILTER_RESOURCE_TYPE}
            value={formState.resourceType ?? ''}
            onChange={handleFilterChange}
          />
        </Form.Group>

        <Form.Group className="col-12 col-md-3" controlId={UI_FIELD_AUDIT_FILTER_RESOURCE_ID}>
          <Form.Label>{UI_AUDIT_LOGS_FILTER_RESOURCE_ID_LABEL}</Form.Label>
          <Form.Control
            name={UI_FIELD_AUDIT_FILTER_RESOURCE_ID}
            value={formState.resourceId ?? ''}
            onChange={handleFilterChange}
          />
        </Form.Group>

        <div className="col-12 d-flex flex-wrap gap-2">
          <Button type="submit" variant="primary">
            {UI_AUDIT_LOGS_FILTER_APPLY_LABEL}
          </Button>
          <Button type="button" variant="outline-secondary" onClick={handleReset}>
            {UI_AUDIT_LOGS_FILTER_RESET_LABEL}
          </Button>
        </div>
      </Form>

      <DataTable data={rows} columns={columns} rowKey={(row) => row.id} emptyState={UI_AUDIT_LOGS_EMPTY_STATE} />
    </Stack>
  )
}
