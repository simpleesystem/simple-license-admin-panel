import { useQueryClient } from '@tanstack/react-query'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { useApiClient } from '../../api/apiContext'
import { AdminSystemLiveFeedProvider } from '../../app/live/AdminSystemLiveFeedContext'
import { QUERY_KEYS, useDashboardSnapshot } from '../../simpleLicense'
import {
  ActivationDistributionPanel,
  AlertThresholdsPanel,
  AnalyticsStatsPanel,
  Page,
  PageHeader,
  Stack,
  TopLicensesPanel,
  UI_CLASS_SECTION_COLUMN_FULL,
  UI_CLASS_SECTION_COLUMN_HALF,
  UI_CLASS_SECTION_GRID,
  UI_PAGE_SUBTITLE_ANALYTICS,
  UI_PAGE_TITLE_ANALYTICS,
  UsageSummaryPanel,
  UsageTrendsPanel,
} from '../../ui'

type AnalyticsColumnSpan = 'full' | 'half'

type AnalyticsColumn = {
  id: string
  span: AnalyticsColumnSpan
  render: () => JSX.Element
}

type AnalyticsSection = {
  id: string
  columns: AnalyticsColumn[]
}

const ANALYTICS_COLUMN_CLASS_MAP: Record<AnalyticsColumnSpan, string> = {
  full: UI_CLASS_SECTION_COLUMN_FULL,
  half: UI_CLASS_SECTION_COLUMN_HALF,
}

export function AnalyticsRouteComponent() {
  const client = useApiClient()
  const queryClient = useQueryClient()
  const [isSnapshotHydrated, setIsSnapshotHydrated] = useState(false)
  const dashboardSnapshotQuery = useDashboardSnapshot(client, { retry: false })

  useEffect(() => {
    if (!dashboardSnapshotQuery.data) {
      return
    }

    queryClient.setQueryData(QUERY_KEYS.adminAnalytics.stats(), dashboardSnapshotQuery.data.stats)
    queryClient.setQueryData(QUERY_KEYS.adminAnalytics.usage(), dashboardSnapshotQuery.data.usage)
    queryClient.setQueryData(QUERY_KEYS.adminAnalytics.trends(), dashboardSnapshotQuery.data.trends)
    queryClient.setQueryData(QUERY_KEYS.adminAnalytics.distribution(), dashboardSnapshotQuery.data.distribution)
    queryClient.setQueryData(QUERY_KEYS.adminAnalytics.topLicenses(), dashboardSnapshotQuery.data.topLicenses)
    queryClient.setQueryData(QUERY_KEYS.adminAnalytics.thresholds(), dashboardSnapshotQuery.data.thresholds)
    setIsSnapshotHydrated(true)
  }, [dashboardSnapshotQuery.data, queryClient])

  useEffect(() => {
    if (dashboardSnapshotQuery.isError) {
      setIsSnapshotHydrated(true)
    }
  }, [dashboardSnapshotQuery.isError])

  const sections = useMemo<AnalyticsSection[]>(
    () => [
      {
        id: 'analytics-overview',
        columns: [
          {
            id: 'analytics-system-overview',
            span: 'half',
            render: () => <AnalyticsStatsPanel client={client} />,
          },
          {
            id: 'analytics-usage-summaries',
            span: 'half',
            render: () => <UsageSummaryPanel client={client} />,
          },
        ],
      },
      {
        id: 'analytics-trends',
        columns: [
          {
            id: 'analytics-usage-trends',
            span: 'full',
            render: () => <UsageTrendsPanel client={client} />,
          },
        ],
      },
      {
        id: 'analytics-top-segments',
        columns: [
          {
            id: 'analytics-top-licenses',
            span: 'half',
            render: () => <TopLicensesPanel client={client} />,
          },
          {
            id: 'analytics-distribution',
            span: 'half',
            render: () => <ActivationDistributionPanel client={client} />,
          },
        ],
      },
      {
        id: 'analytics-thresholds',
        columns: [
          {
            id: 'analytics-alert-thresholds',
            span: 'full',
            render: () => <AlertThresholdsPanel client={client} />,
          },
        ],
      },
    ],
    [client]
  )

  return (
    <AdminSystemLiveFeedProvider>
      <Page>
        <Stack direction="column" gap="large">
          <PageHeader title={UI_PAGE_TITLE_ANALYTICS} subtitle={UI_PAGE_SUBTITLE_ANALYTICS} />
          {isSnapshotHydrated ? (
            sections.map((section) => (
              <div key={section.id} className={UI_CLASS_SECTION_GRID}>
                {section.columns.map((column) => (
                  <div key={column.id} className={ANALYTICS_COLUMN_CLASS_MAP[column.span]}>
                    {column.render()}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-muted">Loading analytics data...</div>
          )}
        </Stack>
      </Page>
    </AdminSystemLiveFeedProvider>
  )
}
