import { useMemo } from 'react'
import type { Client } from '@simple-license/react-sdk'
import { useUsageTrends } from '@simple-license/react-sdk'

import { DataTable } from '../data/DataTable'
import type { UiDataTableColumn } from '../types'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import {
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_COLUMN_PERIOD,
  UI_ANALYTICS_COLUMN_USAGE_REPORTS,
  UI_ANALYTICS_COLUMN_VALIDATIONS,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_PERIOD,
  UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
} from '../constants'

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

export function UsageTrendsPanel({ client, title = 'Usage Trends' }: UsageTrendsPanelProps) {
  const trendsQuery = useUsageTrends(client, { retry: false })

  const rows = useMemo<readonly TrendRow[]>(() => {
    return (
      trendsQuery.data?.trends.map((trend) => ({
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
    [],
  )

  const isEmpty = rows.length === 0

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="h5 mb-0">{title}</h2>
        <span className="text-muted small">
          {trendsQuery.data ? `${trendsQuery.data.periodStart} → ${trendsQuery.data.periodEnd}` : null}
        </span>
      </div>

      {trendsQuery.isLoading ? (
        <InlineAlert variant="info" title="Loading usage trends">
          Please wait while we load the latest trend data…
        </InlineAlert>
      ) : trendsQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load usage trends">
          Try again later or verify the analytics service health.
        </InlineAlert>
      ) : isEmpty ? (
        <InlineAlert variant="warning" title="No usage trends yet">
          Usage reports will appear here once data is ingested.
        </InlineAlert>
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          rowKey={(row) => row.id}
          emptyState="No trends recorded."
        />
      )}
    </Stack>
  )
}


