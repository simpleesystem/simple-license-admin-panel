/* c8 ignore file */
/* istanbul ignore file */

import { type ReactNode, useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client } from '@/simpleLicense'
import { useServerStatus } from '@/simpleLicense'
import { useAdminSystemLiveFeed } from '../../app/live/useAdminSystemLiveFeed'
import { useLiveStatusBadgeModel } from '../../app/live/useLiveStatusBadgeModel'
import {
  UI_CLASS_PANEL_ACTION_BUTTON,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_TIME_FORMAT_OPTIONS,
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
  UI_SYSTEM_STATUS_REFRESH_PENDING,
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
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiKeyValueItem } from '../types'
import { BadgeText } from '../typography/BadgeText'

type SystemStatusPanelProps = {
  client: Client
  title?: string
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

const toDisplayCase = (value: string): string => {
  const normalized = value.replace(/[_-]+/g, ' ').trim()
  if (normalized.length === 0) {
    return UI_VALUE_PLACEHOLDER
  }

  return normalized
    .split(/\s+/)
    .map((segment) => {
      if (segment.length === 0) {
        return segment
      }
      const lower = segment.toLowerCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

const splitPipeSegments = (value: string): string[] => {
  return value
    .split(/\s*\|\s*/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

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
    const parts = [status, message].filter(Boolean).map((segment) => toDisplayCase(segment as string))
    return parts.length > 0 ? parts.join(' - ') : undefined
  }

  if (typeof value === 'string') {
    const normalized = resolveState(value)
    if (normalized) {
      return formatHealthState(normalized)
    }
    return toDisplayCase(value)
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

const renderPipeSeparatedValue = (value: string): ReactNode => {
  const segments = splitPipeSegments(value)
  if (segments.length <= 1) {
    return toDisplayCase(value)
  }

  return (
    <span className="d-inline-flex flex-column gap-1">
      {segments.map((segment, index) => (
        <span key={`${index}-${segment}`}>{toDisplayCase(segment)}</span>
      ))}
    </span>
  )
}

const normalizeDatabaseSummary = (value: unknown): ReactNode | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'number') {
    return formatDatabaseState(value) ?? UI_VALUE_PLACEHOLDER
  }

  if (typeof value === 'string') {
    const state = formatDatabaseState(value)
    if (state) {
      return renderPipeSeparatedValue(state)
    }
    const normalized = normalizeHealthSummary(value)
    return normalized ? renderPipeSeparatedValue(normalized) : UI_VALUE_PLACEHOLDER
  }

  if (typeof value === 'object') {
    const status =
      typeof (value as { status?: unknown }).status === 'string' ? (value as { status?: string }).status : undefined
    const message =
      typeof (value as { message?: unknown }).message === 'string' ? (value as { message?: string }).message : undefined
    const normalizedStatus = normalizeHealthSummary(status)
    const poolSummary = formatConnectionPool(value)
    if (poolSummary && normalizedStatus) {
      return (
        <span className="d-inline-flex flex-column gap-1">
          <span>{toDisplayCase(normalizedStatus)}</span>
          {renderPipeSeparatedValue(poolSummary)}
        </span>
      )
    }
    if (poolSummary) {
      return renderPipeSeparatedValue(poolSummary)
    }
    if (normalizedStatus) {
      const formattedMessage = message ? toDisplayCase(message) : undefined
      return formattedMessage
        ? `${toDisplayCase(normalizedStatus)} (${formattedMessage})`
        : toDisplayCase(normalizedStatus)
    }
    const composite = [status, message]
      .filter(Boolean)
      .map((segment) => toDisplayCase(segment as string))
      .join(' - ')
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
  const serverStatusQuery = useServerStatus(client, { retry: false })
  const { data: statusData, isLoading, isFetching, isError, refetch } = serverStatusQuery
  const liveFeed = useAdminSystemLiveFeed()
  const liveStatusBadge = useLiveStatusBadgeModel()
  const refresh = () => {
    void refetch()
    liveFeed.requestHealth()
  }
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_TIME_FORMAT_OPTIONS), [])

  const summaryItems = useMemo<UiKeyValueItem[]>(() => {
    const items: UiKeyValueItem[] = []
    const statusValue = normalizeHealthSummary(statusData?.status)
    const timestampValue = statusData?.timestamp
    const databaseValue = normalizeDatabaseSummary(statusData?.checks?.database)

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
  }, [dateFormatter, statusData])

  /* c8 ignore start */
  const renderContent = () => {
    if (summaryItems.length === 0) {
      if ((isLoading || isFetching) && !statusData) {
        return (
          <InlineAlert variant="info" title={UI_SYSTEM_STATUS_LOADING_TITLE}>
            {UI_SYSTEM_STATUS_LOADING_BODY}
          </InlineAlert>
        )
      }

      if (isError && !statusData) {
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

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <PanelHeader
        title={title}
        description={UI_SYSTEM_STATUS_DESCRIPTION}
        actions={
          <>
            <BadgeText text={liveStatusBadge.text} variant={liveStatusBadge.variant} />
            <Button
              variant="outline-secondary"
              className={UI_CLASS_PANEL_ACTION_BUTTON}
              onClick={refresh}
              disabled={isFetching || isLoading}
              aria-busy={isFetching || isLoading}
            >
              {isFetching || isLoading ? UI_SYSTEM_STATUS_REFRESH_PENDING : UI_SYSTEM_STATUS_REFRESH_LABEL}
            </Button>
          </>
        }
      />

      {renderContent()}
    </Stack>
  )
}
