import { useMemo } from 'react'
import type { Client } from '@/simpleLicense'
import { useSystemStats } from '@/simpleLicense'
import { useAdminSystemLiveFeed } from '../../app/live/useAdminSystemLiveFeed'
import { useLiveStatusBadgeModel } from '../../app/live/useLiveStatusBadgeModel'
import { RefreshActionButton } from '../actions/RefreshActionButton'
import {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_INFO,
  UI_ALERT_VARIANT_WARNING,
  UI_ANALYTICS_STATS_DESCRIPTION,
  UI_ANALYTICS_STATS_EMPTY_BODY,
  UI_ANALYTICS_STATS_EMPTY_TITLE,
  UI_ANALYTICS_STATS_ERROR_BODY,
  UI_ANALYTICS_STATS_ERROR_TITLE,
  UI_ANALYTICS_STATS_LABEL_ACTIVATIONS,
  UI_ANALYTICS_STATS_LABEL_ACTIVE,
  UI_ANALYTICS_STATS_LABEL_CUSTOMERS,
  UI_ANALYTICS_STATS_LABEL_EXPIRED,
  UI_ANALYTICS_STATS_LOADING_BODY,
  UI_ANALYTICS_STATS_LOADING_TITLE,
  UI_ANALYTICS_STATS_REFRESH_LABEL,
  UI_ANALYTICS_STATS_REFRESH_PENDING,
  UI_ANALYTICS_STATS_TITLE,
  UI_STACK_GAP_SMALL,
  UI_SUMMARY_ID_ANALYTICS_STATS_ACTIVATIONS,
  UI_SUMMARY_ID_ANALYTICS_STATS_ACTIVE,
  UI_SUMMARY_ID_ANALYTICS_STATS_CUSTOMERS,
  UI_SUMMARY_ID_ANALYTICS_STATS_EXPIRED,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { SummaryList } from '../data/SummaryList'
import { InlineAlert } from '../feedback/InlineAlert'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiSummaryCardItem } from '../types'
import { BadgeText } from '../typography/BadgeText'

type AnalyticsStatsPanelProps = {
  client: Client
  title?: string
}

const formatNumber = (value: number | undefined) => {
  if (typeof value !== 'number') {
    return UI_VALUE_PLACEHOLDER
  }
  return value.toLocaleString()
}

export function AnalyticsStatsPanel({ client, title = UI_ANALYTICS_STATS_TITLE }: AnalyticsStatsPanelProps) {
  const statsQuery = useSystemStats(client, { retry: false })
  const { data: statsData, isLoading, isFetching, isError, refetch } = statsQuery
  const statsSource = statsData?.stats
  const liveFeed = useAdminSystemLiveFeed()
  const liveStatusBadge = useLiveStatusBadgeModel()
  const refresh = () => {
    void refetch()
    liveFeed.requestHealth()
  }

  const statItems = useMemo<UiSummaryCardItem[]>(() => {
    if (!statsSource) {
      return []
    }

    return [
      {
        id: UI_SUMMARY_ID_ANALYTICS_STATS_ACTIVE,
        label: UI_ANALYTICS_STATS_LABEL_ACTIVE,
        value: formatNumber(statsSource.active_licenses),
      },
      {
        id: UI_SUMMARY_ID_ANALYTICS_STATS_EXPIRED,
        label: UI_ANALYTICS_STATS_LABEL_EXPIRED,
        value: formatNumber(statsSource.expired_licenses),
      },
      {
        id: UI_SUMMARY_ID_ANALYTICS_STATS_CUSTOMERS,
        label: UI_ANALYTICS_STATS_LABEL_CUSTOMERS,
        value: formatNumber(statsSource.total_customers),
      },
      {
        id: UI_SUMMARY_ID_ANALYTICS_STATS_ACTIVATIONS,
        label: UI_ANALYTICS_STATS_LABEL_ACTIVATIONS,
        value: formatNumber(statsSource.total_activations),
      },
    ]
  }, [statsSource])

  const shouldShowLoading = (isLoading || isFetching) && !statsSource
  const shouldShowError = isError && !statsSource
  const shouldShowEmpty = !shouldShowLoading && !shouldShowError && statItems.length === 0

  const renderContent = () => {
    if (shouldShowLoading) {
      return (
        <InlineAlert variant={UI_ALERT_VARIANT_INFO} title={UI_ANALYTICS_STATS_LOADING_TITLE}>
          {UI_ANALYTICS_STATS_LOADING_BODY}
        </InlineAlert>
      )
    }

    if (shouldShowError) {
      return (
        <InlineAlert variant={UI_ALERT_VARIANT_DANGER} title={UI_ANALYTICS_STATS_ERROR_TITLE}>
          {UI_ANALYTICS_STATS_ERROR_BODY}
        </InlineAlert>
      )
    }

    if (shouldShowEmpty) {
      return (
        <InlineAlert variant={UI_ALERT_VARIANT_WARNING} title={UI_ANALYTICS_STATS_EMPTY_TITLE}>
          {UI_ANALYTICS_STATS_EMPTY_BODY}
        </InlineAlert>
      )
    }

    return <SummaryList items={statItems} />
  }

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <PanelHeader
        title={title}
        description={UI_ANALYTICS_STATS_DESCRIPTION}
        actions={
          <>
            <BadgeText text={liveStatusBadge.text} variant={liveStatusBadge.variant} />
            <RefreshActionButton
              onRefresh={refresh}
              isPending={isFetching || isLoading}
              idleLabel={UI_ANALYTICS_STATS_REFRESH_LABEL}
              pendingLabel={UI_ANALYTICS_STATS_REFRESH_PENDING}
            />
          </>
        }
      />

      {renderContent()}
    </Stack>
  )
}
