import { useMemo } from 'react'
import type { ActivationDistributionResponse, Client } from '@/simpleLicense'
import { useActivationDistribution } from '@/simpleLicense'

import { RefreshActionButton } from '../actions/RefreshActionButton'
import {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_INFO,
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_COLUMN_LICENSE_KEY,
  UI_ANALYTICS_COLUMN_VALIDATIONS,
  UI_ANALYTICS_DISTRIBUTION_DESCRIPTION,
  UI_ANALYTICS_DISTRIBUTION_EMPTY_STATE,
  UI_ANALYTICS_DISTRIBUTION_ERROR_BODY,
  UI_ANALYTICS_DISTRIBUTION_ERROR_TITLE,
  UI_ANALYTICS_DISTRIBUTION_LOADING_BODY,
  UI_ANALYTICS_DISTRIBUTION_LOADING_TITLE,
  UI_ANALYTICS_DISTRIBUTION_REFRESH_LABEL,
  UI_ANALYTICS_DISTRIBUTION_REFRESH_PENDING,
  UI_ANALYTICS_DISTRIBUTION_TITLE,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_LICENSE_KEY,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
  UI_STACK_GAP_SMALL,
  UI_TEXT_ALIGN_END,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineStatusGate } from '../feedback/InlineStatusGate'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'

type ActivationDistributionPanelProps = {
  client: Client
  title?: string
}

type DistributionRow = ActivationDistributionResponse['distribution'][number]

const formatNumber = (value: number) => value.toLocaleString()

export function ActivationDistributionPanel({
  client,
  title = UI_ANALYTICS_DISTRIBUTION_TITLE,
}: ActivationDistributionPanelProps) {
  const distributionQuery = useActivationDistribution(client, { retry: false })
  const { isFetching, isLoading, refetch } = distributionQuery

  const columns = useMemo<UiDataTableColumn<DistributionRow>[]>(() => {
    return [
      {
        id: UI_COLUMN_ID_ANALYTICS_LICENSE_KEY,
        header: UI_ANALYTICS_COLUMN_LICENSE_KEY,
        cell: (row) => row.licenseKey,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
        header: UI_ANALYTICS_COLUMN_ACTIVATIONS,
        cell: (row) => formatNumber(row.activations),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
        header: UI_ANALYTICS_COLUMN_VALIDATIONS,
        cell: (row) => formatNumber(row.validations),
        textAlign: UI_TEXT_ALIGN_END,
      },
    ]
  }, [])

  const rows = distributionQuery.data?.distribution ?? []

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <PanelHeader
        title={title}
        description={UI_ANALYTICS_DISTRIBUTION_DESCRIPTION}
        actions={
          <RefreshActionButton
            onRefresh={() => void refetch()}
            isPending={isFetching || isLoading}
            idleLabel={UI_ANALYTICS_DISTRIBUTION_REFRESH_LABEL}
            pendingLabel={UI_ANALYTICS_DISTRIBUTION_REFRESH_PENDING}
          />
        }
      />

      <InlineStatusGate
        isLoading={distributionQuery.isLoading}
        isError={distributionQuery.isError}
        loadingTitle={UI_ANALYTICS_DISTRIBUTION_LOADING_TITLE}
        loadingMessage={UI_ANALYTICS_DISTRIBUTION_LOADING_BODY}
        errorTitle={UI_ANALYTICS_DISTRIBUTION_ERROR_TITLE}
        errorMessage={UI_ANALYTICS_DISTRIBUTION_ERROR_BODY}
        loadingVariant={UI_ALERT_VARIANT_INFO}
        errorVariant={UI_ALERT_VARIANT_DANGER}
      >
        <DataTable
          data={rows}
          columns={columns}
          rowKey={(row) => row.licenseKey}
          emptyState={UI_ANALYTICS_DISTRIBUTION_EMPTY_STATE}
        />
      </InlineStatusGate>
    </Stack>
  )
}
