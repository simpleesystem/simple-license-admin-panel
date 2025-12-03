import { useMemo } from 'react'
import type { Client } from '@simple-license/react-sdk'
import { useSystemStats } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'

import { SummaryList } from '../data/SummaryList'
import type { UiSummaryCardItem } from '../types'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'

type AnalyticsStatsPanelProps = {
  client: Client
  title?: string
}

const formatNumber = (value: number) => value.toLocaleString()

export function AnalyticsStatsPanel({ client, title = 'System Health' }: AnalyticsStatsPanelProps) {
  const statsQuery = useSystemStats(client, { retry: false })

  const statItems = useMemo<UiSummaryCardItem[]>(() => {
    const stats = statsQuery.data?.stats
    if (!stats) {
      return []
    }

    return [
      {
        id: 'active-licenses',
        label: 'Active licenses',
        value: formatNumber(stats.active_licenses),
      },
      {
        id: 'expired-licenses',
        label: 'Expired licenses',
        value: formatNumber(stats.expired_licenses),
      },
      {
        id: 'total-customers',
        label: 'Customers',
        value: formatNumber(stats.total_customers),
      },
      {
        id: 'total-activations',
        label: 'Total activations',
        value: formatNumber(stats.total_activations),
      },
    ]
  }, [statsQuery.data])

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="h5 mb-0">{title}</h2>
        <Button variant="outline-secondary" onClick={() => statsQuery.refetch()}>
          Refresh
        </Button>
      </div>

      {statsQuery.isLoading ? (
        <InlineAlert variant="info" title="Loading system stats">
          Fetching the latest analytics overview…
        </InlineAlert>
      ) : statsQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load analytics">
          Please retry or check the service status.
        </InlineAlert>
      ) : statItems.length === 0 ? (
        <InlineAlert variant="warning" title="No analytics data yet">
          Start ingesting usage reports to populate this panel.
        </InlineAlert>
      ) : (
        <SummaryList items={statItems} />
      )}
    </Stack>
  )
}


