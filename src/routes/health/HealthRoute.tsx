import { type JSX, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApiClient } from '../../api/apiContext'
import { I18N_KEY_HEALTH_HEADING, I18N_KEY_HEALTH_SUBTITLE } from '../../app/constants'
import { AdminSystemLiveFeedProvider } from '../../app/live/AdminSystemLiveFeedContext'
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
          {sections.map((section) => (
            <div key={section.id} className={UI_CLASS_SECTION_GRID}>
              {section.columns.map((column) => (
                <div key={column.id} className={HEALTH_COLUMN_CLASS_MAP[column.span]}>
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
