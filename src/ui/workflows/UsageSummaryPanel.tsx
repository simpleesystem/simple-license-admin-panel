import type { Client, UsageSummaryResponse } from '@/simpleLicense'
import { useUsageSummaries } from '@/simpleLicense'
import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'

import {
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_COLUMN_LICENSE_ID,
  UI_ANALYTICS_COLUMN_PEAK_CONCURRENCY,
  UI_ANALYTICS_COLUMN_PERIOD,
  UI_ANALYTICS_COLUMN_TENANT_ID,
  UI_ANALYTICS_COLUMN_USAGE_REPORTS,
  UI_ANALYTICS_COLUMN_VALIDATIONS,
  UI_ANALYTICS_SUMMARY_DEFAULT_LIMIT,
  UI_ANALYTICS_SUMMARY_DESCRIPTION,
  UI_ANALYTICS_SUMMARY_EMPTY_STATE,
  UI_ANALYTICS_SUMMARY_ERROR_BODY,
  UI_ANALYTICS_SUMMARY_ERROR_TITLE,
  UI_ANALYTICS_SUMMARY_LOADING_BODY,
  UI_ANALYTICS_SUMMARY_LOADING_TITLE,
  UI_ANALYTICS_SUMMARY_REFRESH_LABEL,
  UI_ANALYTICS_SUMMARY_REFRESH_PENDING,
  UI_ANALYTICS_SUMMARY_TITLE,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_LICENSE,
  UI_COLUMN_ID_ANALYTICS_PEAK_CONCURRENCY,
  UI_COLUMN_ID_ANALYTICS_PERIOD,
  UI_COLUMN_ID_ANALYTICS_TENANT,
  UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_FORMAT_OPTIONS,
  UI_TEXT_ALIGN_END,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'

type UsageSummaryRow = UsageSummaryResponse['summaries'][number]

type UsageSummaryPanelProps = {
  client: Client
  title?: string
  maxRows?: number
}

const formatPeriodRange = (row: UsageSummaryRow, formatter: Intl.DateTimeFormat) => {
  const start = formatter.format(new Date(row.periodStart))
  const end = formatter.format(new Date(row.periodEnd))
  return `${start} – ${end}`
}

const formatNullableNumber = (value: number | null | undefined) => {
  if (typeof value !== 'number') {
    return UI_VALUE_PLACEHOLDER
  }
  return value.toLocaleString()
}

const formatNumber = (value: number) => value.toLocaleString()

export function UsageSummaryPanel({ client, title = UI_ANALYTICS_SUMMARY_TITLE, maxRows }: UsageSummaryPanelProps) {
  const usageSummariesQuery = useUsageSummaries(client, { retry: false })
  const { isFetching, isLoading: isQueryLoading, refetch } = usageSummariesQuery
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS), [])
  const rowLimit = maxRows ?? UI_ANALYTICS_SUMMARY_DEFAULT_LIMIT

  const columns = useMemo<UiDataTableColumn<UsageSummaryRow>[]>(
    () => [
      {
        id: UI_COLUMN_ID_ANALYTICS_PERIOD,
        header: UI_ANALYTICS_COLUMN_PERIOD,
        cell: (row) => formatPeriodRange(row, dateFormatter),
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_TENANT,
        header: UI_ANALYTICS_COLUMN_TENANT_ID,
        cell: (row) => formatNullableNumber(row.tenantId),
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_LICENSE,
        header: UI_ANALYTICS_COLUMN_LICENSE_ID,
        cell: (row) => formatNullableNumber(row.licenseId),
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
        header: UI_ANALYTICS_COLUMN_ACTIVATIONS,
        cell: (row) => formatNumber(row.totalActivations),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
        header: UI_ANALYTICS_COLUMN_VALIDATIONS,
        cell: (row) => formatNumber(row.totalValidations),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
        header: UI_ANALYTICS_COLUMN_USAGE_REPORTS,
        cell: (row) => formatNumber(row.totalUsageReports),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_PEAK_CONCURRENCY,
        header: UI_ANALYTICS_COLUMN_PEAK_CONCURRENCY,
        cell: (row) => formatNumber(row.peakConcurrency),
        textAlign: UI_TEXT_ALIGN_END,
      },
    ],
    [dateFormatter]
  )

  const rows = useMemo(() => {
    const summaries = usageSummariesQuery.data?.summaries ?? []
    return summaries.slice(0, rowLimit)
  }, [usageSummariesQuery.data?.summaries, rowLimit])

  const isLoading = usageSummariesQuery.isLoading
  const hasError = usageSummariesQuery.isError

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <p className="text-muted mb-0">{UI_ANALYTICS_SUMMARY_DESCRIPTION}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-busy={isFetching}
          >
            {isFetching || isQueryLoading ? UI_ANALYTICS_SUMMARY_REFRESH_PENDING : UI_ANALYTICS_SUMMARY_REFRESH_LABEL}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <InlineAlert variant="info" title={UI_ANALYTICS_SUMMARY_LOADING_TITLE}>
          {UI_ANALYTICS_SUMMARY_LOADING_BODY}
        </InlineAlert>
      ) : hasError ? (
        <InlineAlert variant="danger" title={UI_ANALYTICS_SUMMARY_ERROR_TITLE}>
          {UI_ANALYTICS_SUMMARY_ERROR_BODY}
        </InlineAlert>
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          rowKey={(row) => row.id.toString()}
          emptyState={UI_ANALYTICS_SUMMARY_EMPTY_STATE}
        />
      )}
    </Stack>
  )
}
