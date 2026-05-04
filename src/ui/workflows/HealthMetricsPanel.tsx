import { useMemo } from 'react'
import type { Client } from '@/simpleLicense'
import { useHealthMetrics } from '@/simpleLicense'
import { useAdminSystemLiveFeed } from '../../app/live/useAdminSystemLiveFeed'
import { useLiveStatusBadgeModel } from '../../app/live/useLiveStatusBadgeModel'
import { RefreshActionButton } from '../actions/RefreshActionButton'
import {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_INFO,
  UI_ALERT_VARIANT_WARNING,
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
import { PanelHeader } from '../layout/PanelHeader'
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
          <InlineAlert variant={UI_ALERT_VARIANT_INFO} title={UI_HEALTH_METRICS_LOADING_TITLE}>
            {UI_HEALTH_METRICS_LOADING_BODY}
          </InlineAlert>
        )
      }

      if (isError && !metricsSource) {
        return (
          <InlineAlert variant={UI_ALERT_VARIANT_DANGER} title={UI_HEALTH_METRICS_ERROR_TITLE}>
            {UI_HEALTH_METRICS_ERROR_BODY}
          </InlineAlert>
        )
      }

      return (
        <InlineAlert variant={UI_ALERT_VARIANT_WARNING} title={UI_HEALTH_METRICS_EMPTY_TITLE}>
          {UI_HEALTH_METRICS_EMPTY_BODY}
        </InlineAlert>
      )
    }

    return <SummaryList items={summaryItems} />
  }

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <PanelHeader
        title={title}
        description={UI_HEALTH_METRICS_DESCRIPTION}
        actions={
          <>
            <BadgeText text={liveStatusBadge.text} variant={liveStatusBadge.variant} />
            <RefreshActionButton
              onRefresh={refresh}
              isPending={isFetching || isLoading}
              idleLabel={UI_HEALTH_METRICS_REFRESH_LABEL}
              pendingLabel={UI_HEALTH_METRICS_REFRESH_PENDING}
            />
          </>
        }
      />

      {renderContent()}
    </Stack>
  )
}
