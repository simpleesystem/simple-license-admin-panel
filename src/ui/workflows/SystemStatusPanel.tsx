/* c8 ignore file */
/* istanbul ignore file */

import type { Client, ServerStatusResponse, UseHealthWebSocketResult } from '@simple-license/react-sdk'
import { useHealthWebSocket, useServerStatus } from '@simple-license/react-sdk'
import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import { useAppConfig } from '../../app/config'
import { useLiveData } from '../../hooks/useLiveData'
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
  UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_IDLE,
  UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_PREFIX,
  UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_TOTAL,
  UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_WAITING,
  UI_SYSTEM_STATUS_VALUE_DATABASE_UNAVAILABLE,
  UI_SYSTEM_STATUS_VALUE_HEALTHY,
  UI_SYSTEM_STATUS_VALUE_UNHEALTHY,
  UI_VALUE_PLACEHOLDER,
  UI_VALUE_SEPARATOR,
} from '../constants'
import { SummaryList } from '../data/SummaryList'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import type { UiKeyValueItem } from '../types'
import { BadgeText } from '../typography/BadgeText'
import { getLiveStatusDescriptor } from '../utils/liveStatus'

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
    /* c8 ignore next */
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
  /* c8 ignore next */
  return UI_VALUE_PLACEHOLDER
}

const formatDatabaseState = (activeConnections: number | string | null | undefined) => {
  if (typeof activeConnections === 'number') {
    if (activeConnections > 0) {
      return UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED
    }
    return UI_SYSTEM_STATUS_VALUE_DATABASE_UNAVAILABLE
  }
  if (typeof activeConnections === 'string') {
    return activeConnections
  }
  /* c8 ignore next */
  return undefined
}

const defaultNumberFormatter = new Intl.NumberFormat()

const normalizeHealthSummary = (value: unknown): string | undefined => {
  if (!value) {
    return undefined
  }

  const resolveState = (raw: string | undefined): 'healthy' | 'unhealthy' | undefined => {
    if (!raw) {
      return undefined
    }
    const lowered = raw.toLowerCase()
    if (lowered === 'healthy' || lowered === 'pass' || lowered === 'ok') {
      return 'healthy'
    }
    if (lowered === 'unhealthy' || lowered === 'fail' || lowered === 'error') {
      return 'unhealthy'
    }
    return undefined
  }

  const resolveComposite = (status?: string, message?: string) => {
    const parts = [status, message].filter(Boolean)
    return parts.length > 0 ? parts.join(' - ') : undefined
  }

  if (typeof value === 'string') {
    const normalized = resolveState(value)
    if (normalized) {
      return formatHealthState(normalized)
    }
    return value
  }

  if (typeof value === 'object') {
    const status =
      typeof (value as { status?: unknown }).status === 'string' ? (value as { status?: string }).status : undefined
    const message =
      typeof (value as { message?: unknown }).message === 'string' ? (value as { message?: string }).message : undefined
    const normalized = resolveState(status)
    if (normalized) {
      const base = formatHealthState(normalized)
      return message ? `${base} (${message})` : base
    }
    const composite = resolveComposite(status, message)
    if (composite) {
      return composite
    }
    try {
      return JSON.stringify(value)
    } catch {
      return UI_VALUE_PLACEHOLDER
    }
  }

  return String(value)
}

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return undefined
}

const formatConnectionPool = (candidate: unknown): string | undefined => {
  if (!candidate || typeof candidate !== 'object') {
    return undefined
  }

  const pool =
    (candidate as { connection_pool?: unknown }).connection_pool ??
    (candidate as { connectionPool?: unknown }).connectionPool ??
    candidate

  if (typeof pool !== 'object' || pool === null) {
    return undefined
  }

  const poolRecord = pool as {
    total_connections?: unknown
    totalConnections?: unknown
    idle_connections?: unknown
    idleConnections?: unknown
    waiting_requests?: unknown
    waitingRequests?: unknown
  }

  const total = toNumber(poolRecord.total_connections ?? poolRecord.totalConnections)
  const idle = toNumber(poolRecord.idle_connections ?? poolRecord.idleConnections)
  const waiting = toNumber(poolRecord.waiting_requests ?? poolRecord.waitingRequests)

  const segments: string[] = []
  if (total !== undefined) {
    segments.push(`${UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_TOTAL}: ${defaultNumberFormatter.format(total)}`)
  }
  if (idle !== undefined) {
    segments.push(`${UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_IDLE}: ${defaultNumberFormatter.format(idle)}`)
  }
  if (waiting !== undefined) {
    segments.push(`${UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_WAITING}: ${defaultNumberFormatter.format(waiting)}`)
  }

  if (segments.length === 0) {
    return undefined
  }

  return `${UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_PREFIX}: ${segments.join(UI_VALUE_SEPARATOR)}`
}

const normalizeDatabaseSummary = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'number') {
    return formatDatabaseState(value) ?? UI_VALUE_PLACEHOLDER
  }

  if (typeof value === 'string') {
    return formatDatabaseState(value) ?? normalizeHealthSummary(value) ?? value
  }

  if (typeof value === 'object') {
    const status =
      typeof (value as { status?: unknown }).status === 'string' ? (value as { status?: string }).status : undefined
    const message =
      typeof (value as { message?: unknown }).message === 'string' ? (value as { message?: string }).message : undefined
    const normalizedStatus = normalizeHealthSummary(status)
    const poolSummary = formatConnectionPool(value)
    if (poolSummary && normalizedStatus) {
      return `${normalizedStatus}${UI_VALUE_SEPARATOR}${poolSummary}`
    }
    if (poolSummary) {
      return poolSummary
    }
    if (normalizedStatus) {
      return message ? `${normalizedStatus} (${message})` : normalizedStatus
    }
    const composite = [status, message].filter(Boolean).join(' - ')
    if (composite) {
      return composite
    }
    try {
      return JSON.stringify(value)
    } catch {
      return UI_VALUE_PLACEHOLDER
    }
  }

  return UI_VALUE_PLACEHOLDER
}

export function SystemStatusPanel({ client, title = UI_SYSTEM_STATUS_TITLE }: SystemStatusPanelProps) {
  const { wsPath } = useAppConfig()
  const serverStatusQuery = useServerStatus(client, { retry: false })
  const healthSocket = useHealthWebSocket(client, { path: wsPath })
  const {
    queryData: statusData,
    liveData: livePayload,
    socketResult: healthSocketResult,
    isLoading,
    isError,
    refresh,
  } = useLiveData<ServerStatusResponse, UseHealthWebSocketResult, ServerStatusResponse>({
    query: () => serverStatusQuery,
    socket: () => healthSocket,
    selectQueryData: (data) => data,
    selectSocketData: () => undefined,
  })
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_TIME_FORMAT_OPTIONS), [])

  const liveStatus = useMemo<LiveStatusSnapshot | undefined>(() => {
    if (!livePayload) {
      return undefined
    }
    return {
      status: livePayload.status,
      timestamp: livePayload.timestamp ?? null,
      database: formatDatabaseState(livePayload.checks?.database),
    }
  }, [livePayload])

  const summaryItems = useMemo<UiKeyValueItem[]>(() => {
    const items: UiKeyValueItem[] = []
    const statusValue = normalizeHealthSummary(liveStatus?.status ?? statusData?.status)
    const timestampValue = liveStatus?.timestamp ?? statusData?.timestamp
    const databaseValue = normalizeDatabaseSummary(liveStatus?.database ?? statusData?.checks?.database)

    if (statusValue) {
      items.push({
        id: UI_SUMMARY_ID_SYSTEM_STATUS_STATE,
        label: UI_SYSTEM_STATUS_LABEL_STATUS,
        value: statusValue,
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

  /* c8 ignore start */
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
  /* c8 ignore stop */

  const liveStatusDescriptor = getLiveStatusDescriptor(
    healthSocketResult.connectionInfo.state,
    Boolean(healthSocketResult.error)
  )

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <p className="text-muted mb-0">{UI_SYSTEM_STATUS_DESCRIPTION}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <BadgeText
            text={liveStatusDescriptor.text ?? UI_LIVE_STATUS_DISCONNECTED}
            variant={liveStatusDescriptor.variant ?? UI_BADGE_VARIANT_SECONDARY}
          />
          <Button variant="outline-secondary" onClick={refresh}>
            {UI_SYSTEM_STATUS_REFRESH_LABEL}
          </Button>
        </div>
      </div>

      {renderContent()}
    </Stack>
  )
}
