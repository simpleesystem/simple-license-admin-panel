import type { Client, SystemStatsResponse } from '@simple-license/react-sdk'
import { type UseHealthWebSocketResult, useHealthWebSocket, useSystemStats } from '@simple-license/react-sdk'
import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import { useAppConfig } from '../../app/config'
import { useLiveData } from '../../hooks/useLiveData'
import {
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
import { Stack } from '../layout/Stack'
import type { UiSummaryCardItem } from '../types'
import { BadgeText } from '../typography/BadgeText'
import { getLiveStatusDescriptor } from '../utils/liveStatus'

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
  const { wsPath } = useAppConfig()
  const statsQuery = useSystemStats(client, { retry: false })
  const healthSocket = useHealthWebSocket(client, { path: wsPath })
  const {
    data: statsSource,
    isLoading,
    isError,
    refresh,
  } = useLiveData<SystemStatsResponse, UseHealthWebSocketResult, SystemStatsResponse['stats']>({
    query: () => statsQuery,
    socket: () => healthSocket,
    selectQueryData: (data) => data?.stats,
    selectSocketData: (socket) => socket.healthData?.stats,
  })

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

  const shouldShowLoading = isLoading && !statsSource
  const shouldShowError = isError && !statsSource
  const shouldShowEmpty = !shouldShowLoading && !shouldShowError && statItems.length === 0

  const liveStatusDescriptor = getLiveStatusDescriptor(healthSocket.connectionInfo.state, Boolean(healthSocket.error))

  const renderContent = () => {
    if (shouldShowLoading) {
      return (
        <InlineAlert variant="info" title={UI_ANALYTICS_STATS_LOADING_TITLE}>
          {UI_ANALYTICS_STATS_LOADING_BODY}
        </InlineAlert>
      )
    }

    if (shouldShowError) {
      return (
        <InlineAlert variant="danger" title={UI_ANALYTICS_STATS_ERROR_TITLE}>
          {UI_ANALYTICS_STATS_ERROR_BODY}
        </InlineAlert>
      )
    }

    if (shouldShowEmpty) {
      return (
        <InlineAlert variant="warning" title={UI_ANALYTICS_STATS_EMPTY_TITLE}>
          {UI_ANALYTICS_STATS_EMPTY_BODY}
        </InlineAlert>
      )
    }

    return <SummaryList items={statItems} />
  }

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <p className="text-muted mb-0">{UI_ANALYTICS_STATS_DESCRIPTION}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <BadgeText text={liveStatusDescriptor.text} variant={liveStatusDescriptor.variant} />
          <Button variant="outline-secondary" onClick={refresh}>
            {UI_ANALYTICS_STATS_REFRESH_LABEL}
          </Button>
        </div>
      </div>

      {renderContent()}
    </Stack>
  )
}
