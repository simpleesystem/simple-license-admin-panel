import { useCallback, useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client, MetricsResponse, MetricObject, MetricValue, UseHealthWebSocketResult } from '@simple-license/react-sdk'
import { useHealthWebSocket, useSystemMetrics } from '@simple-license/react-sdk'

import {
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_TIME_FORMAT_OPTIONS,
  UI_SECTION_ID_SYSTEM_METRICS_APPLICATION,
  UI_SECTION_ID_SYSTEM_METRICS_CACHE,
  UI_SECTION_ID_SYSTEM_METRICS_DATABASE,
  UI_SECTION_ID_SYSTEM_METRICS_RUNTIME,
  UI_SECTION_ID_SYSTEM_METRICS_SECURITY,
  UI_SECTION_ID_SYSTEM_METRICS_TENANTS,
  UI_STACK_GAP_SMALL,
  UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_ENVIRONMENT,
  UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_TIMESTAMP,
  UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_VERSION,
  UI_SUMMARY_ID_SYSTEM_METRICS_CACHE_PREFIX,
  UI_SUMMARY_ID_SYSTEM_METRICS_DATABASE_PREFIX,
  UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_CPU_SYSTEM,
  UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_CPU_USER,
  UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_EXTERNAL,
  UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_HEAP_TOTAL,
  UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_HEAP_USED,
  UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_RSS,
  UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_UPTIME,
  UI_SUMMARY_ID_SYSTEM_METRICS_SECURITY_PREFIX,
  UI_SUMMARY_ID_SYSTEM_METRICS_TENANT_PREFIX,
  UI_SYSTEM_METRICS_DESCRIPTION,
  UI_SYSTEM_METRICS_EMPTY_BODY,
  UI_SYSTEM_METRICS_EMPTY_TITLE,
  UI_SYSTEM_METRICS_ERROR_BODY,
  UI_SYSTEM_METRICS_ERROR_TITLE,
  UI_SYSTEM_METRICS_LABEL_ENVIRONMENT,
  UI_SYSTEM_METRICS_LABEL_RUNTIME_CPU_SYSTEM,
  UI_SYSTEM_METRICS_LABEL_RUNTIME_CPU_USER,
  UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_EXTERNAL,
  UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_HEAP_TOTAL,
  UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_HEAP_USED,
  UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_RSS,
  UI_SYSTEM_METRICS_LABEL_RUNTIME_UPTIME,
  UI_SYSTEM_METRICS_LABEL_TIMESTAMP,
  UI_SYSTEM_METRICS_LABEL_VERSION,
  UI_SYSTEM_METRICS_LOADING_BODY,
  UI_SYSTEM_METRICS_LOADING_TITLE,
  UI_SYSTEM_METRICS_REFRESH_LABEL,
  UI_SYSTEM_METRICS_SECTION_APPLICATION,
  UI_SYSTEM_METRICS_SECTION_CACHE,
  UI_SYSTEM_METRICS_SECTION_DATABASE,
  UI_SYSTEM_METRICS_SECTION_SECURITY,
  UI_SYSTEM_METRICS_SECTION_SYSTEM,
  UI_SYSTEM_METRICS_SECTION_TENANTS,
  UI_SYSTEM_METRICS_TITLE,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { SummaryList } from '../data/SummaryList'
import type { UiKeyValueItem } from '../types'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import { BadgeText } from '../typography/BadgeText'
import { getLiveStatusDescriptor } from '../utils/liveStatus'
import { useLiveData } from '../../hooks/useLiveData'

type SystemMetricsPanelProps = {
  client: Client
  title?: string
}

type MetricsSection = {
  id: string
  title: string
  items: UiKeyValueItem[]
}

const formatTimestamp = (value: string | null | undefined, formatter: Intl.DateTimeFormat) => {
  if (!value) {
    return UI_VALUE_PLACEHOLDER
  }
  return formatter.format(new Date(value))
}

const formatMetricValue = (value: MetricValue | MetricObject | undefined, numberFormatter: Intl.NumberFormat): string => {
  if (value === null || value === undefined) {
    return UI_VALUE_PLACEHOLDER
  }

  if (Array.isArray(value)) {
    return value.map((entry) => (typeof entry === 'number' ? numberFormatter.format(entry) : String(entry))).join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  if (typeof value === 'number') {
    return numberFormatter.format(value)
  }

  return String(value)
}

const buildMetricItems = (
  prefix: string,
  labelPrefix: string,
  values: Record<string, MetricValue | MetricObject | undefined> | undefined,
  numberFormatter: Intl.NumberFormat
): UiKeyValueItem[] => {
  if (!values) {
    return []
  }

  return Object.entries(values).map(([key, value]) => ({
    id: `${prefix}${key}`,
    label: `${labelPrefix}${key}`,
    value: formatMetricValue(value, numberFormatter),
  }))
}

export function SystemMetricsPanel({ client, title = UI_SYSTEM_METRICS_TITLE }: SystemMetricsPanelProps) {
  const systemMetricsQuery = useSystemMetrics(client, { retry: false })
  const healthSocket = useHealthWebSocket(client)
  const {
    data: metricsSource,
    socketResult: healthSocketResult,
    isLoading,
    isError,
    refresh,
  } = useLiveData<MetricsResponse, UseHealthWebSocketResult, MetricsResponse>({
    query: () => systemMetricsQuery,
    socket: () => healthSocket,
    selectQueryData: (data) => data,
    selectSocketData: () => undefined,
    merge: ({ queryData }) => queryData,
  })
  const numberFormatter = useMemo(() => new Intl.NumberFormat(), [])
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_TIME_FORMAT_OPTIONS),
    []
  )

  const buildApplicationItems = useCallback((metrics: MetricsResponse | undefined): UiKeyValueItem[] => {
    if (!metrics?.application) {
      return []
    }

    return [
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_VERSION,
        label: UI_SYSTEM_METRICS_LABEL_VERSION,
        value: metrics.application.version ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_ENVIRONMENT,
        label: UI_SYSTEM_METRICS_LABEL_ENVIRONMENT,
        value: metrics.application.environment ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_TIMESTAMP,
        label: UI_SYSTEM_METRICS_LABEL_TIMESTAMP,
        value: formatTimestamp(metrics.timestamp, dateFormatter),
      },
    ]
  }, [dateFormatter])

  const buildRuntimeItems = useCallback((metrics: MetricsResponse | undefined): UiKeyValueItem[] => {
    if (!metrics?.system) {
      return []
    }

    return [
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_UPTIME,
        label: UI_SYSTEM_METRICS_LABEL_RUNTIME_UPTIME,
        value: formatMetricValue(metrics.system.uptime, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_RSS,
        label: UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_RSS,
        value: formatMetricValue(metrics.system.memory.rss, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_HEAP_TOTAL,
        label: UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_HEAP_TOTAL,
        value: formatMetricValue(metrics.system.memory.heapTotal, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_HEAP_USED,
        label: UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_HEAP_USED,
        value: formatMetricValue(metrics.system.memory.heapUsed, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_EXTERNAL,
        label: UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_EXTERNAL,
        value: formatMetricValue(metrics.system.memory.external, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_CPU_USER,
        label: UI_SYSTEM_METRICS_LABEL_RUNTIME_CPU_USER,
        value: formatMetricValue(metrics.system.cpu.user, numberFormatter),
      },
      {
        id: UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_CPU_SYSTEM,
        label: UI_SYSTEM_METRICS_LABEL_RUNTIME_CPU_SYSTEM,
        value: formatMetricValue(metrics.system.cpu.system, numberFormatter),
      },
    ]
  }, [numberFormatter])

  const sections = useMemo<MetricsSection[]>(() => {
    const metrics = metricsSource

    const applicationItems = buildApplicationItems(metrics)
    const runtimeItems = buildRuntimeItems(metrics)
    const databaseItems = buildMetricItems(
      UI_SUMMARY_ID_SYSTEM_METRICS_DATABASE_PREFIX,
      '',
      metrics?.database,
      numberFormatter
    )
    const cacheItems = buildMetricItems(UI_SUMMARY_ID_SYSTEM_METRICS_CACHE_PREFIX, '', metrics?.cache, numberFormatter)
    const securityItems = buildMetricItems(
      UI_SUMMARY_ID_SYSTEM_METRICS_SECURITY_PREFIX,
      '',
      metrics?.security,
      numberFormatter
    )
    const tenantItems = buildMetricItems(
      UI_SUMMARY_ID_SYSTEM_METRICS_TENANT_PREFIX,
      '',
      metrics?.tenants,
      numberFormatter
    )

    const definedSections: MetricsSection[] = [
      {
        id: UI_SECTION_ID_SYSTEM_METRICS_APPLICATION,
        title: UI_SYSTEM_METRICS_SECTION_APPLICATION,
        items: applicationItems,
      },
      {
        id: UI_SECTION_ID_SYSTEM_METRICS_RUNTIME,
        title: UI_SYSTEM_METRICS_SECTION_SYSTEM,
        items: runtimeItems,
      },
      {
        id: UI_SECTION_ID_SYSTEM_METRICS_DATABASE,
        title: UI_SYSTEM_METRICS_SECTION_DATABASE,
        items: databaseItems,
      },
      {
        id: UI_SECTION_ID_SYSTEM_METRICS_CACHE,
        title: UI_SYSTEM_METRICS_SECTION_CACHE,
        items: cacheItems,
      },
      {
        id: UI_SECTION_ID_SYSTEM_METRICS_SECURITY,
        title: UI_SYSTEM_METRICS_SECTION_SECURITY,
        items: securityItems,
      },
      {
        id: UI_SECTION_ID_SYSTEM_METRICS_TENANTS,
        title: UI_SYSTEM_METRICS_SECTION_TENANTS,
        items: tenantItems,
      },
    ]

    return definedSections.filter((section) => section.items.length > 0)
  }, [buildApplicationItems, buildRuntimeItems, metricsSource, numberFormatter])

  const renderContent = () => {
    if (!metricsSource || sections.length === 0) {
      if (isLoading && !metricsSource) {
        return (
          <InlineAlert variant="info" title={UI_SYSTEM_METRICS_LOADING_TITLE}>
            {UI_SYSTEM_METRICS_LOADING_BODY}
          </InlineAlert>
        )
      }

      if (isError && !metricsSource) {
        return (
          <InlineAlert variant="danger" title={UI_SYSTEM_METRICS_ERROR_TITLE}>
            {UI_SYSTEM_METRICS_ERROR_BODY}
          </InlineAlert>
        )
      }

      return (
        <InlineAlert variant="warning" title={UI_SYSTEM_METRICS_EMPTY_TITLE}>
          {UI_SYSTEM_METRICS_EMPTY_BODY}
        </InlineAlert>
      )
    }

    return (
      <div className="d-flex flex-column gap-3">
        {sections.map((section) => (
          <div key={section.id} className="d-flex flex-column gap-2">
            <h3 className="h6 mb-0">{section.title}</h3>
            <SummaryList items={section.items} />
          </div>
        ))}
      </div>
    )
  }

  const liveStatusDescriptor = getLiveStatusDescriptor(
    healthSocketResult.connectionInfo.state,
    Boolean(healthSocketResult.error)
  )

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <p className="text-muted mb-0">{UI_SYSTEM_METRICS_DESCRIPTION}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <BadgeText text={liveStatusDescriptor.text} variant={liveStatusDescriptor.variant} />
          <Button variant="outline-secondary" onClick={refresh}>
            {UI_SYSTEM_METRICS_REFRESH_LABEL}
          </Button>
        </div>
      </div>

      {renderContent()}
    </Stack>
  )
}

