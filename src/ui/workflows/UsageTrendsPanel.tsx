import type { Client } from '@simple-license/react-sdk'
import { useUsageTrends } from '@simple-license/react-sdk'
import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import {
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_COLUMN_PERIOD,
  UI_ANALYTICS_COLUMN_USAGE_REPORTS,
  UI_ANALYTICS_COLUMN_VALIDATIONS,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_PERIOD,
  UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
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

export function UsageTrendsPanel({ client, title = UI_USAGE_TRENDS_TITLE }: UsageTrendsPanelProps) {
  const trendsQuery = useUsageTrends(client, { retry: false })
  const { isFetching, isLoading, refetch } = trendsQuery

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

  const columns = useMemo<UiDataTableColumn<TrendRow>[]>(
    () => [
      {
        id: UI_COLUMN_ID_ANALYTICS_PERIOD,
        header: UI_ANALYTICS_COLUMN_PERIOD,
        cell: (row) => row.period,
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
    []
  )

  const isEmpty = rows.length === 0

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <span className="text-muted small">
            {trendsQuery.data ? `${trendsQuery.data.periodStart} → ${trendsQuery.data.periodEnd}` : null}
          </span>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-busy={isFetching}
          >
            {isFetching || isLoading ? UI_USAGE_TRENDS_REFRESH_PENDING : UI_USAGE_TRENDS_REFRESH_LABEL}
          </Button>
        </div>
      </div>

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
