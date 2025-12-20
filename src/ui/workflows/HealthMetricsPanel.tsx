import type { Client } from '@simple-license/react-sdk'
import { useHealthMetrics } from '@simple-license/react-sdk'
import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import { useAdminSystemLiveFeed } from '../../app/live/useAdminSystemLiveFeed'
import { useLiveStatusBadgeModel } from '../../app/live/useLiveStatusBadgeModel'
import {
  UI_HEALTH_METRICS_DESCRIPTION,
  UI_HEALTH_METRICS_EMPTY_BODY,
  UI_HEALTH_METRICS_EMPTY_TITLE,
  UI_HEALTH_METRICS_ERROR_BODY,
  UI_HEALTH_METRICS_ERROR_TITLE,
  UI_HEALTH_METRICS_LABEL_CPU_SYSTEM,
  UI_HEALTH_METRICS_LABEL_CPU_USER,
  UI_HEALTH_METRICS_LABEL_MEMORY_EXTERNAL,
  UI_HEALTH_METRICS_LABEL_MEMORY_HEAP_TOTAL,
  UI_HEALTH_METRICS_LABEL_MEMORY_HEAP_USED,
  UI_HEALTH_METRICS_LABEL_MEMORY_RSS,
  UI_HEALTH_METRICS_LABEL_UPTIME,
  UI_HEALTH_METRICS_LOADING_BODY,
  UI_HEALTH_METRICS_LOADING_TITLE,
  UI_HEALTH_METRICS_REFRESH_LABEL,
  UI_HEALTH_METRICS_REFRESH_PENDING,
  UI_HEALTH_METRICS_TITLE,
  UI_STACK_GAP_SMALL,
  UI_SUMMARY_ID_HEALTH_METRICS_CPU_SYSTEM,
  UI_SUMMARY_ID_HEALTH_METRICS_CPU_USER,
  UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_EXTERNAL,
  UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_HEAP_TOTAL,
  UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_HEAP_USED,
  UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_RSS,
  UI_SUMMARY_ID_HEALTH_METRICS_UPTIME,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { SummaryList } from '../data/SummaryList'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import type { UiKeyValueItem } from '../types'
import { BadgeText } from '../typography/BadgeText'

type HealthMetricsPanelProps = {
  client: Client
  title?: string
}

const formatNumber = (value: number | null | undefined, formatter: Intl.NumberFormat) => {
  if (value === null || value === undefined) {
    return UI_VALUE_PLACEHOLDER
  }
  return formatter.format(value)
}

export function HealthMetricsPanel({ client, title = UI_HEALTH_METRICS_TITLE }: HealthMetricsPanelProps) {
  const healthMetricsQuery = useHealthMetrics(client, { retry: false })
  const { data: metricsData, isLoading, isFetching, isError, refetch } = healthMetricsQuery
  const metricsSource = metricsData?.metrics
  const liveFeed = useAdminSystemLiveFeed()
  const liveStatusBadge = useLiveStatusBadgeModel()
  const refresh = () => {
    void refetch()
    liveFeed.requestHealth()
  }
  const numberFormatter = useMemo(() => new Intl.NumberFormat(), [])

  const summaryItems = useMemo<UiKeyValueItem[]>(() => {
    if (!metricsSource) {
      return []
    }

    return [
      {
        id: UI_SUMMARY_ID_HEALTH_METRICS_UPTIME,
        label: UI_HEALTH_METRICS_LABEL_UPTIME,
        value: formatNumber(metricsSource.uptime, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_RSS,
        label: UI_HEALTH_METRICS_LABEL_MEMORY_RSS,
        value: formatNumber(metricsSource.memory.rss, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_HEAP_TOTAL,
        label: UI_HEALTH_METRICS_LABEL_MEMORY_HEAP_TOTAL,
        value: formatNumber(metricsSource.memory.heapTotal, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_HEAP_USED,
        label: UI_HEALTH_METRICS_LABEL_MEMORY_HEAP_USED,
        value: formatNumber(metricsSource.memory.heapUsed, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_EXTERNAL,
        label: UI_HEALTH_METRICS_LABEL_MEMORY_EXTERNAL,
        value: formatNumber(metricsSource.memory.external, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_HEALTH_METRICS_CPU_USER,
        label: UI_HEALTH_METRICS_LABEL_CPU_USER,
        value: formatNumber(metricsSource.cpu?.user, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_HEALTH_METRICS_CPU_SYSTEM,
        label: UI_HEALTH_METRICS_LABEL_CPU_SYSTEM,
        value: formatNumber(metricsSource.cpu?.system, numberFormatter),
      },
    ]
  }, [metricsSource, numberFormatter])

  const renderContent = () => {
    if (summaryItems.length === 0) {
      if ((isLoading || isFetching) && !metricsSource) {
        return (
          <InlineAlert variant="info" title={UI_HEALTH_METRICS_LOADING_TITLE}>
            {UI_HEALTH_METRICS_LOADING_BODY}
          </InlineAlert>
        )
      }

      if (isError && !metricsSource) {
        return (
          <InlineAlert variant="danger" title={UI_HEALTH_METRICS_ERROR_TITLE}>
            {UI_HEALTH_METRICS_ERROR_BODY}
          </InlineAlert>
        )
      }

      return (
        <InlineAlert variant="warning" title={UI_HEALTH_METRICS_EMPTY_TITLE}>
          {UI_HEALTH_METRICS_EMPTY_BODY}
        </InlineAlert>
      )
    }

    return <SummaryList items={summaryItems} />
  }

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <p className="text-muted mb-0">{UI_HEALTH_METRICS_DESCRIPTION}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <BadgeText text={liveStatusBadge.text} variant={liveStatusBadge.variant} />
          <Button
            variant="outline-secondary"
            onClick={refresh}
            disabled={isFetching || isLoading}
            aria-busy={isFetching || isLoading}
          >
            {isFetching || isLoading ? UI_HEALTH_METRICS_REFRESH_PENDING : UI_HEALTH_METRICS_REFRESH_LABEL}
          </Button>
        </div>
      </div>

      {renderContent()}
    </Stack>
  )
}
