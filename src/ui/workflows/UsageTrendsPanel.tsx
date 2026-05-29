import { useMemo } from 'react'
import type { Client } from '@/simpleLicense'
import { useUsageTrends } from '@/simpleLicense'
import { RefreshActionButton } from '../actions/RefreshActionButton'
import {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_INFO,
  UI_ALERT_VARIANT_WARNING,
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_COLUMN_PERIOD,
  UI_ANALYTICS_COLUMN_USAGE_REPORTS,
  UI_ANALYTICS_COLUMN_VALIDATIONS,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_PERIOD,
  UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_FORMAT_OPTIONS,
  UI_STACK_GAP_SMALL,
  UI_TEXT_ALIGN_END,
  UI_USAGE_TRENDS_EMPTY_BODY,
  UI_USAGE_TRENDS_EMPTY_STATE,
  UI_USAGE_TRENDS_EMPTY_TITLE,
  UI_USAGE_TRENDS_ERROR_BODY,
  UI_USAGE_TRENDS_ERROR_TITLE,
  UI_USAGE_TRENDS_LOADING_BODY,
  UI_USAGE_TRENDS_LOADING_TITLE,
  UI_USAGE_TRENDS_REFRESH_LABEL,
  UI_USAGE_TRENDS_REFRESH_PENDING,
  UI_USAGE_TRENDS_TITLE,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
import { InlineStatusGate } from '../feedback/InlineStatusGate'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'
import { collapseZeroMetricRuns, ZERO_METRIC_COLLAPSE_MODE_SUMMARY_ROW } from '../utils/collapseZeroMetricRuns'

type UsageTrendsPanelProps = {
  client: Client
  title?: string
}

type TrendRow = {
  id: string
  period: string
  totalActivations: number
  totalValidations: number
  totalUsageReports: number
  isCollapsedZeroRun: boolean
}

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/

const toDate = (value: string): Date | null => {
  if (DATE_KEY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    if (year && month && day) {
      return new Date(year, month - 1, day)
    }
  }

  if (MONTH_KEY_PATTERN.test(value)) {
    const [year, month] = value.split('-').map(Number)
    if (year && month) {
      return new Date(year, month - 1, 1)
    }
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDateValue = (value: string, formatter: Intl.DateTimeFormat) => {
  const parsed = toDate(value)
  return parsed ? formatter.format(parsed) : value
}

const formatDateRange = (
  periodStart: string | undefined,
  periodEnd: string | undefined,
  formatter: Intl.DateTimeFormat
) => {
  if (!periodStart || !periodEnd) {
    return null
  }

  return `${formatDateValue(periodStart, formatter)} - ${formatDateValue(periodEnd, formatter)}`
}

const isAllZeroTrendRow = (row: TrendRow): boolean =>
  row.totalActivations === 0 && row.totalValidations === 0 && row.totalUsageReports === 0

export function UsageTrendsPanel({ client, title = UI_USAGE_TRENDS_TITLE }: UsageTrendsPanelProps) {
  const trendsQuery = useUsageTrends(client, { retry: false })
  const { isFetching, isLoading, refetch } = trendsQuery
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS), [])

  const rows = useMemo<readonly TrendRow[]>(() => {
    const trendRows =
      trendsQuery.data?.trends?.map((trend) => ({
        id: `trend-${trend.period}`,
        period: trend.period,
        totalActivations: trend.totalActivations,
        totalValidations: trend.totalValidations,
        totalUsageReports: trend.totalUsageReports,
        isCollapsedZeroRun: false,
      })) ?? []

    return collapseZeroMetricRuns(trendRows, isAllZeroTrendRow, {
      mode: ZERO_METRIC_COLLAPSE_MODE_SUMMARY_ROW,
      createSummaryRow: ({ runLength, firstRow, lastRow }) => ({
        id: `trend-collapsed-${firstRow.id}-${lastRow.id}`,
        period: `${runLength.toLocaleString()} zero periods collapsed`,
        totalActivations: 0,
        totalValidations: 0,
        totalUsageReports: 0,
        isCollapsedZeroRun: true,
      }),
    })
  }, [trendsQuery.data])

  const periodDescription = useMemo(
    () => formatDateRange(trendsQuery.data?.periodStart, trendsQuery.data?.periodEnd, dateFormatter),
    [dateFormatter, trendsQuery.data?.periodEnd, trendsQuery.data?.periodStart]
  )

  const columns = useMemo<UiDataTableColumn<TrendRow>[]>(
    () => [
      {
        id: UI_COLUMN_ID_ANALYTICS_PERIOD,
        header: UI_ANALYTICS_COLUMN_PERIOD,
        cell: (row) => (row.isCollapsedZeroRun ? row.period : formatDateValue(row.period, dateFormatter)),
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
        header: UI_ANALYTICS_COLUMN_ACTIVATIONS,
        cell: (row) => (row.isCollapsedZeroRun ? UI_VALUE_PLACEHOLDER : row.totalActivations.toLocaleString()),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
        header: UI_ANALYTICS_COLUMN_VALIDATIONS,
        cell: (row) => (row.isCollapsedZeroRun ? UI_VALUE_PLACEHOLDER : row.totalValidations.toLocaleString()),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
        header: UI_ANALYTICS_COLUMN_USAGE_REPORTS,
        cell: (row) => (row.isCollapsedZeroRun ? UI_VALUE_PLACEHOLDER : row.totalUsageReports.toLocaleString()),
        textAlign: UI_TEXT_ALIGN_END,
      },
    ],
    [dateFormatter]
  )

  const isEmpty = rows.length === 0

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <PanelHeader
        title={title}
        description={periodDescription}
        actions={
          <RefreshActionButton
            onRefresh={() => void refetch()}
            isPending={isFetching || isLoading}
            idleLabel={UI_USAGE_TRENDS_REFRESH_LABEL}
            pendingLabel={UI_USAGE_TRENDS_REFRESH_PENDING}
          />
        }
      />

      <InlineStatusGate
        isLoading={trendsQuery.isLoading}
        isError={trendsQuery.isError}
        loadingTitle={UI_USAGE_TRENDS_LOADING_TITLE}
        loadingMessage={UI_USAGE_TRENDS_LOADING_BODY}
        errorTitle={UI_USAGE_TRENDS_ERROR_TITLE}
        errorMessage={UI_USAGE_TRENDS_ERROR_BODY}
        loadingVariant={UI_ALERT_VARIANT_INFO}
        errorVariant={UI_ALERT_VARIANT_DANGER}
      >
        {isEmpty ? (
          <InlineAlert variant={UI_ALERT_VARIANT_WARNING} title={UI_USAGE_TRENDS_EMPTY_TITLE}>
            {UI_USAGE_TRENDS_EMPTY_BODY}
          </InlineAlert>
        ) : (
          <DataTable data={rows} columns={columns} rowKey={(row) => row.id} emptyState={UI_USAGE_TRENDS_EMPTY_STATE} />
        )}
      </InlineStatusGate>
    </Stack>
  )
}
