import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client } from '@/simpleLicense'
import { useUsageTrends } from '@/simpleLicense'
import {
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_COLUMN_PERIOD,
  UI_ANALYTICS_COLUMN_USAGE_REPORTS,
  UI_ANALYTICS_COLUMN_VALIDATIONS,
  UI_CLASS_PANEL_ACTION_BUTTON,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_PERIOD,
  UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_FORMAT_OPTIONS,
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
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'

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

export function UsageTrendsPanel({ client, title = UI_USAGE_TRENDS_TITLE }: UsageTrendsPanelProps) {
  const trendsQuery = useUsageTrends(client, { retry: false })
  const { isFetching, isLoading, refetch } = trendsQuery
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS), [])

  const rows = useMemo<readonly TrendRow[]>(() => {
    return (
      trendsQuery.data?.trends?.map((trend) => ({
        id: trend.period,
        period: trend.period,
        totalActivations: trend.totalActivations,
        totalValidations: trend.totalValidations,
        totalUsageReports: trend.totalUsageReports,
      })) ?? []
    )
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
        cell: (row) => formatDateValue(row.period, dateFormatter),
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
        header: UI_ANALYTICS_COLUMN_ACTIVATIONS,
        cell: (row) => row.totalActivations.toLocaleString(),
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
        header: UI_ANALYTICS_COLUMN_VALIDATIONS,
        cell: (row) => row.totalValidations.toLocaleString(),
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
        header: UI_ANALYTICS_COLUMN_USAGE_REPORTS,
        cell: (row) => row.totalUsageReports.toLocaleString(),
      },
    ],
    [dateFormatter]
  )

  const isEmpty = rows.length === 0

  return (
    <Stack direction="column" gap="small">
      <PanelHeader
        title={title}
        description={periodDescription}
        actions={
          <Button
            variant="outline-secondary"
            className={UI_CLASS_PANEL_ACTION_BUTTON}
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-busy={isFetching}
          >
            {isFetching || isLoading ? UI_USAGE_TRENDS_REFRESH_PENDING : UI_USAGE_TRENDS_REFRESH_LABEL}
          </Button>
        }
      />

      {trendsQuery.isLoading ? (
        <InlineAlert variant="info" title={UI_USAGE_TRENDS_LOADING_TITLE}>
          {UI_USAGE_TRENDS_LOADING_BODY}
        </InlineAlert>
      ) : trendsQuery.isError ? (
        <InlineAlert variant="danger" title={UI_USAGE_TRENDS_ERROR_TITLE}>
          {UI_USAGE_TRENDS_ERROR_BODY}
        </InlineAlert>
      ) : isEmpty ? (
        <InlineAlert variant="warning" title={UI_USAGE_TRENDS_EMPTY_TITLE}>
          {UI_USAGE_TRENDS_EMPTY_BODY}
        </InlineAlert>
      ) : (
        <DataTable data={rows} columns={columns} rowKey={(row) => row.id} emptyState={UI_USAGE_TRENDS_EMPTY_STATE} />
      )}
    </Stack>
  )
}
