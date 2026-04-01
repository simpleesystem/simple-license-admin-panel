import { useQueryClient } from '@tanstack/react-query'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApiClient } from '../../api/apiContext'
import { I18N_KEY_HEALTH_HEADING, I18N_KEY_HEALTH_SUBTITLE } from '../../app/constants'
import { AdminSystemLiveFeedProvider } from '../../app/live/AdminSystemLiveFeedContext'
import { QUERY_KEYS, useHealthSnapshot } from '../../simpleLicense'
import {
  HealthMetricsPanel,
  Page,
  PageHeader,
  Stack,
  SystemMetricsPanel,
  SystemStatusPanel,
  UI_CLASS_SECTION_COLUMN_FULL,
  UI_CLASS_SECTION_COLUMN_HALF,
  UI_CLASS_SECTION_GRID,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_STACK_GAP_LARGE,
} from '../../ui'

type HealthColumnSpan = 'full' | 'half'

type HealthColumn = {
  id: string
  span: HealthColumnSpan
  render: () => JSX.Element
}

type HealthSection = {
  id: string
  columns: HealthColumn[]
}

const HEALTH_COLUMN_CLASS_MAP: Record<HealthColumnSpan, string> = {
  full: UI_CLASS_SECTION_COLUMN_FULL,
  half: UI_CLASS_SECTION_COLUMN_HALF,
}

export function HealthRouteComponent() {
  const { t } = useTranslation()
  const client = useApiClient()
  const queryClient = useQueryClient()
  const [isSnapshotHydrated, setIsSnapshotHydrated] = useState(false)
  const healthSnapshotQuery = useHealthSnapshot(client, { retry: false })

  useEffect(() => {
    if (!healthSnapshotQuery.data) {
      return
    }

    queryClient.setQueryData(QUERY_KEYS.adminSystem.status(), healthSnapshotQuery.data.status)
    queryClient.setQueryData(QUERY_KEYS.adminSystem.health(), healthSnapshotQuery.data.health)
    queryClient.setQueryData(QUERY_KEYS.adminSystem.metrics(), healthSnapshotQuery.data.metrics)
    setIsSnapshotHydrated(true)
  }, [healthSnapshotQuery.data, queryClient])

  useEffect(() => {
    if (healthSnapshotQuery.isError) {
      setIsSnapshotHydrated(true)
    }
  }, [healthSnapshotQuery.isError])

  const sections = useMemo<HealthSection[]>(
    () => [
      {
        id: 'health-primary',
        columns: [
          {
            id: 'health-system-status',
            span: 'half',
            render: () => <SystemStatusPanel client={client} />,
          },
          {
            id: 'health-metrics',
            span: 'half',
            render: () => <HealthMetricsPanel client={client} />,
          },
        ],
      },
      {
        id: 'health-system-metrics',
        columns: [
          {
            id: 'health-system-metrics-panel',
            span: 'full',
            render: () => <SystemMetricsPanel client={client} />,
          },
        ],
      },
    ],
    [client]
  )

  return (
    <AdminSystemLiveFeedProvider>
      <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
        <Stack direction="column" gap={UI_STACK_GAP_LARGE}>
          <PageHeader title={t(I18N_KEY_HEALTH_HEADING)} subtitle={t(I18N_KEY_HEALTH_SUBTITLE)} />
          {isSnapshotHydrated ? (
            sections.map((section) => (
              <div key={section.id} className={UI_CLASS_SECTION_GRID}>
                {section.columns.map((column) => (
                  <div key={column.id} className={HEALTH_COLUMN_CLASS_MAP[column.span]}>
                    {column.render()}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-muted">Loading health data...</div>
          )}
        </Stack>
      </Page>
    </AdminSystemLiveFeedProvider>
  )
}
