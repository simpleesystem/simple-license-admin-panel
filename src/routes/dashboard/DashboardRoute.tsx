import { useQueryClient } from '@tanstack/react-query'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApiClient } from '../../api/apiContext'
import { I18N_KEY_DASHBOARD_HEADING, I18N_KEY_DASHBOARD_SUBTITLE } from '../../app/constants'
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
  UI_CLASS_SECTION_COLUMN_THIRD,
  UI_CLASS_SECTION_GRID,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_STACK_GAP_LARGE,
  UsageSummaryPanel,
  UsageTrendsPanel,
} from '../../ui'

type DashboardColumnSpan = 'full' | 'half' | 'third'

type DashboardColumn = {
  id: string
  span: DashboardColumnSpan
  render: () => JSX.Element
}

type DashboardSection = {
  id: string
  columns: DashboardColumn[]
}

const DASHBOARD_COLUMN_CLASS_MAP: Record<DashboardColumnSpan, string> = {
  full: UI_CLASS_SECTION_COLUMN_FULL,
  half: UI_CLASS_SECTION_COLUMN_HALF,
  third: UI_CLASS_SECTION_COLUMN_THIRD,
}

export function DashboardRouteComponent() {
  const { t } = useTranslation()
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

  // Layout note: every panel below either renders a wide multi-column table
  // (Top Licenses: 6 cols; Activation Distribution: 3 cols + numbers; Usage
  // Summaries: 6 cols; AnalyticsStats: a 2x2 KPI grid that itself wants
  // breathing room) or a stat-card grid that needs full width on common
  // viewports to render without overflow. Half-width side-by-side caused
  // header truncation ("Refresh top licenses" wrapping under the heading,
  // "PEAK CONCUR..." cut off, "USAGE REPO..." cut off). Stack each panel
  // full-width and let DataTable handle its own horizontal scroll if a row
  // ever exceeds the viewport.
  const sections = useMemo<DashboardSection[]>(
    () => [
      {
        id: 'dashboard-analytics-stats',
        columns: [
          {
            id: 'dashboard-analytics-stats-panel',
            span: 'full',
            render: () => <AnalyticsStatsPanel client={client} />,
          },
        ],
      },
      {
        id: 'dashboard-usage-summary',
        columns: [
          {
            id: 'dashboard-usage-summary-panel',
            span: 'full',
            render: () => <UsageSummaryPanel client={client} />,
          },
        ],
      },
      {
        id: 'dashboard-trends',
        columns: [
          {
            id: 'dashboard-usage-trends',
            span: 'full',
            render: () => <UsageTrendsPanel client={client} />,
          },
        ],
      },
      {
        id: 'dashboard-top-licenses',
        columns: [
          {
            id: 'dashboard-top-licenses-panel',
            span: 'full',
            render: () => <TopLicensesPanel client={client} />,
          },
        ],
      },
      {
        id: 'dashboard-activation-distribution',
        columns: [
          {
            id: 'dashboard-activation-distribution-panel',
            span: 'full',
            render: () => <ActivationDistributionPanel client={client} />,
          },
        ],
      },
      {
        id: 'dashboard-alerts',
        columns: [
          {
            id: 'dashboard-alert-thresholds',
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
      <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
        <Stack direction="column" gap={UI_STACK_GAP_LARGE}>
          <PageHeader title={t(I18N_KEY_DASHBOARD_HEADING)} subtitle={t(I18N_KEY_DASHBOARD_SUBTITLE)} />
          {isSnapshotHydrated ? (
            sections.map((section) => (
              <div key={section.id} className={UI_CLASS_SECTION_GRID}>
                {section.columns.map((column) => (
                  <div key={column.id} className={DASHBOARD_COLUMN_CLASS_MAP[column.span]}>
                    {column.render()}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-muted">Loading dashboard data...</div>
          )}
        </Stack>
      </Page>
    </AdminSystemLiveFeedProvider>
  )
}
