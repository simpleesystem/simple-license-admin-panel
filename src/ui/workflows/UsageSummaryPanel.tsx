import { useMemo, useState } from 'react'
import type { Client, UsageSummaryResponse } from '@/simpleLicense'
import { useUsageSummaries } from '@/simpleLicense'

import { RefreshActionButton } from '../actions/RefreshActionButton'
import {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_INFO,
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
  UI_STACK_GAP_SMALL,
  UI_TEXT_ALIGN_END,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { StandardTablePaginationFooter } from '../data/StandardTablePaginationFooter'
import { TableControls } from '../data/TableControls'
import { createStandardTableSearchField } from '../data/tableFieldFactory'
import { InlineStatusGate } from '../feedback/InlineStatusGate'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'
import { collapseZeroMetricRuns, ZERO_METRIC_COLLAPSE_MODE_SUMMARY_ROW } from '../utils/collapseZeroMetricRuns'

type UsageSummaryDataRow = UsageSummaryResponse['summaries'][number]
type UsageSummaryRow = {
  id: string
  tenantId: string | null
  licenseId: string | null
  periodStart: string
  periodEnd: string
  totalActivations: number
  totalValidations: number
  totalUsageReports: number
  peakConcurrency: number
  isCollapsedZeroRun: boolean
  collapsedZeroRunLabel?: string
}

type UsageSummaryPanelProps = {
  client: Client
  title?: string
  maxRows?: number
}

const formatPeriodRange = (row: UsageSummaryRow, formatter: Intl.DateTimeFormat) => {
  if (row.isCollapsedZeroRun) {
    return row.collapsedZeroRunLabel ?? UI_VALUE_PLACEHOLDER
  }

  const start = formatter.format(new Date(row.periodStart))
  const end = formatter.format(new Date(row.periodEnd))
  return `${start} – ${end}`
}

const formatNullableIdentifier = (value: string | null | undefined) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return UI_VALUE_PLACEHOLDER
  }
  return value
}

const formatNumber = (value: number) => value.toLocaleString()

const isAllZeroSummaryRow = (row: UsageSummaryRow): boolean =>
  row.totalActivations === 0 && row.totalValidations === 0 && row.totalUsageReports === 0 && row.peakConcurrency === 0

export function UsageSummaryPanel({ client, title = UI_ANALYTICS_SUMMARY_TITLE, maxRows }: UsageSummaryPanelProps) {
  const usageSummariesQuery = useUsageSummaries(client, { retry: false })
  const { isFetching, isLoading: isQueryLoading, refetch } = usageSummariesQuery
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS), [])
  const initialPageSize = maxRows ?? UI_ANALYTICS_SUMMARY_DEFAULT_LIMIT
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

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
        cell: (row) => formatNullableIdentifier(row.tenantId),
        truncate: true,
        truncateMaxWidth: '11rem',
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_LICENSE,
        header: UI_ANALYTICS_COLUMN_LICENSE_ID,
        cell: (row) => formatNullableIdentifier(row.licenseId),
        truncate: true,
        truncateMaxWidth: '11rem',
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
        header: UI_ANALYTICS_COLUMN_ACTIVATIONS,
        cell: (row) => (row.isCollapsedZeroRun ? UI_VALUE_PLACEHOLDER : formatNumber(row.totalActivations)),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
        header: UI_ANALYTICS_COLUMN_VALIDATIONS,
        cell: (row) => (row.isCollapsedZeroRun ? UI_VALUE_PLACEHOLDER : formatNumber(row.totalValidations)),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
        header: UI_ANALYTICS_COLUMN_USAGE_REPORTS,
        cell: (row) => (row.isCollapsedZeroRun ? UI_VALUE_PLACEHOLDER : formatNumber(row.totalUsageReports)),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_PEAK_CONCURRENCY,
        header: UI_ANALYTICS_COLUMN_PEAK_CONCURRENCY,
        cell: (row) => (row.isCollapsedZeroRun ? UI_VALUE_PLACEHOLDER : formatNumber(row.peakConcurrency)),
        textAlign: UI_TEXT_ALIGN_END,
      },
    ],
    [dateFormatter]
  )

  const rows = useMemo(() => {
    const summaries: UsageSummaryRow[] =
      usageSummariesQuery.data?.summaries.map((summary: UsageSummaryDataRow) => ({
        id: `usage-summary-${summary.id.toString()}`,
        tenantId: summary.tenantId,
        licenseId: summary.licenseId,
        periodStart: summary.periodStart,
        periodEnd: summary.periodEnd,
        totalActivations: summary.totalActivations,
        totalValidations: summary.totalValidations,
        totalUsageReports: summary.totalUsageReports,
        peakConcurrency: summary.peakConcurrency,
        isCollapsedZeroRun: false,
      })) ?? []

    return collapseZeroMetricRuns(summaries, isAllZeroSummaryRow, {
      mode: ZERO_METRIC_COLLAPSE_MODE_SUMMARY_ROW,
      createSummaryRow: ({ runLength, firstRow, lastRow }) => ({
        id: `usage-summary-collapsed-${firstRow.id}-${lastRow.id}`,
        tenantId: null,
        licenseId: null,
        periodStart: firstRow.periodStart,
        periodEnd: lastRow.periodEnd,
        totalActivations: 0,
        totalValidations: 0,
        totalUsageReports: 0,
        peakConcurrency: 0,
        isCollapsedZeroRun: true,
        collapsedZeroRunLabel: `${runLength.toLocaleString()} zero periods collapsed`,
      }),
    })
  }, [usageSummariesQuery.data?.summaries])

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (normalizedSearch.length === 0) {
      return rows
    }

    return rows.filter((row) => {
      const period = formatPeriodRange(row, dateFormatter).toLowerCase()
      const tenantId = row.tenantId?.toLowerCase() ?? ''
      const licenseId = row.licenseId?.toLowerCase() ?? ''
      return (
        period.includes(normalizedSearch) ||
        tenantId.includes(normalizedSearch) ||
        licenseId.includes(normalizedSearch) ||
        String(row.totalActivations).includes(normalizedSearch) ||
        String(row.totalValidations).includes(normalizedSearch)
      )
    })
  }, [dateFormatter, rows, searchTerm])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const pagedRows = filteredRows.slice(pageStart, pageEnd)
  const rangeStart = filteredRows.length > 0 ? pageStart + 1 : 0
  const rangeEnd = pageStart + pagedRows.length

  const toolbar = (
    <TableControls
      search={createStandardTableSearchField({
        value: searchTerm,
        onChange: handleSearchChange,
      })}
    />
  )

  const isLoading = usageSummariesQuery.isLoading
  const hasError = usageSummariesQuery.isError

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <PanelHeader
        title={title}
        description={UI_ANALYTICS_SUMMARY_DESCRIPTION}
        actions={
          <RefreshActionButton
            onRefresh={() => void refetch()}
            isPending={isFetching || isQueryLoading}
            idleLabel={UI_ANALYTICS_SUMMARY_REFRESH_LABEL}
            pendingLabel={UI_ANALYTICS_SUMMARY_REFRESH_PENDING}
          />
        }
      />

      <InlineStatusGate
        isLoading={isLoading}
        isError={hasError}
        loadingTitle={UI_ANALYTICS_SUMMARY_LOADING_TITLE}
        loadingMessage={UI_ANALYTICS_SUMMARY_LOADING_BODY}
        errorTitle={UI_ANALYTICS_SUMMARY_ERROR_TITLE}
        errorMessage={UI_ANALYTICS_SUMMARY_ERROR_BODY}
        loadingVariant={UI_ALERT_VARIANT_INFO}
        errorVariant={UI_ALERT_VARIANT_DANGER}
      >
        <DataTable
          data={pagedRows}
          columns={columns}
          rowKey={(row) => row.id}
          emptyState={UI_ANALYTICS_SUMMARY_EMPTY_STATE}
          toolbar={toolbar}
          footer={
            <StandardTablePaginationFooter
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              summary={`${rangeStart.toLocaleString()}-${rangeEnd.toLocaleString()} of ${filteredRows.length.toLocaleString()}`}
            />
          }
        />
      </InlineStatusGate>
    </Stack>
  )
}
