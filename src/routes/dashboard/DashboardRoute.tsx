import { type JSX, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApiClient } from '../../api/apiContext'
import { I18N_KEY_DASHBOARD_HEADING, I18N_KEY_DASHBOARD_SUBTITLE } from '../../app/constants'
import { AdminSystemLiveFeedProvider } from '../../app/live/AdminSystemLiveFeedContext'
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

  const sections = useMemo<DashboardSection[]>(
    () => [
      {
        id: 'dashboard-overview',
        columns: [
          {
            id: 'dashboard-analytics-stats',
            span: 'half',
            render: () => <AnalyticsStatsPanel client={client} />,
          },
          {
            id: 'dashboard-usage-summary',
            span: 'half',
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
            span: 'half',
            render: () => <TopLicensesPanel client={client} />,
          },
          {
            id: 'dashboard-activation-distribution',
            span: 'half',
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
          {sections.map((section) => (
            <div key={section.id} className={UI_CLASS_SECTION_GRID}>
              {section.columns.map((column) => (
                <div key={column.id} className={DASHBOARD_COLUMN_CLASS_MAP[column.span]}>
                  {column.render()}
                </div>
              ))}
            </div>
          ))}
        </Stack>
      </Page>
    </AdminSystemLiveFeedProvider>
  )
}
