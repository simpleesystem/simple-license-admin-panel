import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client } from '@simple-license/react-sdk'
import { useHealthWebSocket, useServerStatus } from '@simple-license/react-sdk'

import {
  UI_BADGE_VARIANT_SECONDARY,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_TIME_FORMAT_OPTIONS,
  UI_LIVE_STATUS_DISCONNECTED,
  UI_STACK_GAP_SMALL,
  UI_SUMMARY_ID_SYSTEM_STATUS_DATABASE,
  UI_SUMMARY_ID_SYSTEM_STATUS_LAST_CHECKED,
  UI_SUMMARY_ID_SYSTEM_STATUS_STATE,
  UI_SYSTEM_STATUS_DESCRIPTION,
  UI_SYSTEM_STATUS_EMPTY_BODY,
  UI_SYSTEM_STATUS_EMPTY_TITLE,
  UI_SYSTEM_STATUS_ERROR_BODY,
  UI_SYSTEM_STATUS_ERROR_TITLE,
  UI_SYSTEM_STATUS_LABEL_DATABASE,
  UI_SYSTEM_STATUS_LABEL_LAST_CHECKED,
  UI_SYSTEM_STATUS_LABEL_STATUS,
  UI_SYSTEM_STATUS_LOADING_BODY,
  UI_SYSTEM_STATUS_LOADING_TITLE,
  UI_SYSTEM_STATUS_REFRESH_LABEL,
  UI_SYSTEM_STATUS_TITLE,
  UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED,
  UI_SYSTEM_STATUS_VALUE_DATABASE_UNAVAILABLE,
  UI_SYSTEM_STATUS_VALUE_HEALTHY,
  UI_SYSTEM_STATUS_VALUE_UNHEALTHY,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { SummaryList } from '../data/SummaryList'
import type { UiKeyValueItem } from '../types'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import { BadgeText } from '../typography/BadgeText'
import { getLiveStatusDescriptor } from '../utils/liveStatus'
import { useLiveData } from '../../hooks/useLiveData'

type SystemStatusPanelProps = {
  client: Client
  title?: string
}

type LiveStatusSnapshot = {
  status?: 'healthy' | 'unhealthy'
  timestamp?: string | null
  database?: string
}

const formatTimestamp = (value: string | null | undefined, formatter: Intl.DateTimeFormat) => {
  if (!value) {
    return UI_VALUE_PLACEHOLDER
  }
  return formatter.format(new Date(value))
}

const formatHealthState = (value: 'healthy' | 'unhealthy' | undefined) => {
  if (value === 'healthy') {
    return UI_SYSTEM_STATUS_VALUE_HEALTHY
  }
  if (value === 'unhealthy') {
    return UI_SYSTEM_STATUS_VALUE_UNHEALTHY
  }
  return UI_VALUE_PLACEHOLDER
}

const formatDatabaseState = (activeConnections: number | undefined) => {
  if (typeof activeConnections !== 'number') {
    return undefined
  }
  if (activeConnections > 0) {
    return UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED
  }
  return UI_SYSTEM_STATUS_VALUE_DATABASE_UNAVAILABLE
}

export function SystemStatusPanel({ client, title = UI_SYSTEM_STATUS_TITLE }: SystemStatusPanelProps) {
  const {
    queryData: statusData,
    liveData: livePayload,
    socketResult: healthSocket,
    isLoading,
    isError,
    refresh,
  } = useLiveData({
    query: () => useServerStatus(client, { retry: false }),
    socket: () => useHealthWebSocket(client),
    selectQueryData: (data) => data,
    selectSocketData: (socket) => socket.healthData,
  })
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_TIME_FORMAT_OPTIONS),
    []
  )

  const liveStatus = useMemo<LiveStatusSnapshot | undefined>(() => {
    if (!livePayload) {
      return undefined
    }
    return {
      status: livePayload.error ? 'unhealthy' : 'healthy',
      timestamp: healthSocket.healthMessage?.timestamp ?? null,
      database: formatDatabaseState(livePayload.database?.active_connections),
    }
  }, [healthSocket.healthMessage, livePayload])

  const summaryItems = useMemo<UiKeyValueItem[]>(() => {
    const items: UiKeyValueItem[] = []
    const statusValue = liveStatus?.status ?? statusData?.status
    const timestampValue = liveStatus?.timestamp ?? statusData?.timestamp
    const databaseValue = liveStatus?.database ?? statusData?.checks?.database

    if (statusValue) {
      items.push({
        id: UI_SUMMARY_ID_SYSTEM_STATUS_STATE,
        label: UI_SYSTEM_STATUS_LABEL_STATUS,
        value: formatHealthState(statusValue),
      })
    }

    if (timestampValue) {
      items.push({
        id: UI_SUMMARY_ID_SYSTEM_STATUS_LAST_CHECKED,
        label: UI_SYSTEM_STATUS_LABEL_LAST_CHECKED,
        value: formatTimestamp(timestampValue, dateFormatter),
      })
    }

    if (databaseValue) {
      items.push({
        id: UI_SUMMARY_ID_SYSTEM_STATUS_DATABASE,
        label: UI_SYSTEM_STATUS_LABEL_DATABASE,
        value: databaseValue,
      })
    }

    return items
  }, [dateFormatter, liveStatus, statusData])

  const renderContent = () => {
    if (summaryItems.length === 0) {
      if (isLoading && !liveStatus) {
        return (
          <InlineAlert variant="info" title={UI_SYSTEM_STATUS_LOADING_TITLE}>
            {UI_SYSTEM_STATUS_LOADING_BODY}
          </InlineAlert>
        )
      }

      if (isError && !liveStatus) {
        return (
          <InlineAlert variant="danger" title={UI_SYSTEM_STATUS_ERROR_TITLE}>
            {UI_SYSTEM_STATUS_ERROR_BODY}
          </InlineAlert>
        )
      }

      return (
        <InlineAlert variant="warning" title={UI_SYSTEM_STATUS_EMPTY_TITLE}>
          {UI_SYSTEM_STATUS_EMPTY_BODY}
        </InlineAlert>
      )
    }

    return <SummaryList items={summaryItems} />
  }

  const liveStatusDescriptor = getLiveStatusDescriptor(
    healthSocket.connectionInfo.state,
    Boolean(healthSocket.error)
  )

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <p className="text-muted mb-0">{UI_SYSTEM_STATUS_DESCRIPTION}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <BadgeText text={liveStatusDescriptor.text ?? UI_LIVE_STATUS_DISCONNECTED} variant={liveStatusDescriptor.variant ?? UI_BADGE_VARIANT_SECONDARY} />
          <Button variant="outline-secondary" onClick={refresh}>
            {UI_SYSTEM_STATUS_REFRESH_LABEL}
          </Button>
        </div>
      </div>

      {renderContent()}
    </Stack>
  )
}

