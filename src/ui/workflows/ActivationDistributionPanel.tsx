import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import type { ActivationDistributionResponse, Client } from '@/simpleLicense'
import { useActivationDistribution } from '@/simpleLicense'

import {
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
  UI_CLASS_PANEL_ACTION_BUTTON,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_LICENSE_KEY,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
  UI_TEXT_ALIGN_END,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
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
    <Stack direction="column" gap="small">
      <PanelHeader
        title={title}
        description={UI_ANALYTICS_DISTRIBUTION_DESCRIPTION}
        actions={
          <Button
            variant="outline-secondary"
            className={UI_CLASS_PANEL_ACTION_BUTTON}
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-busy={isFetching}
          >
            {isFetching || isLoading
              ? UI_ANALYTICS_DISTRIBUTION_REFRESH_PENDING
              : UI_ANALYTICS_DISTRIBUTION_REFRESH_LABEL}
          </Button>
        }
      />

      {distributionQuery.isLoading ? (
        <InlineAlert variant="info" title={UI_ANALYTICS_DISTRIBUTION_LOADING_TITLE}>
          {UI_ANALYTICS_DISTRIBUTION_LOADING_BODY}
        </InlineAlert>
      ) : distributionQuery.isError ? (
        <InlineAlert variant="danger" title={UI_ANALYTICS_DISTRIBUTION_ERROR_TITLE}>
          {UI_ANALYTICS_DISTRIBUTION_ERROR_BODY}
        </InlineAlert>
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          rowKey={(row) => row.licenseKey}
          emptyState={UI_ANALYTICS_DISTRIBUTION_EMPTY_STATE}
        />
      )}
    </Stack>
  )
}
