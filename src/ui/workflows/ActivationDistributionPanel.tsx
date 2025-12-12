import type { ActivationDistributionResponse, Client } from '@simple-license/react-sdk'
import { useActivationDistribution } from '@simple-license/react-sdk'
import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'

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
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_LICENSE_KEY,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
  UI_TEXT_ALIGN_END,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
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

  if (distributionQuery.isLoading) {
    return (
      <InlineAlert variant="info" title={UI_ANALYTICS_DISTRIBUTION_LOADING_TITLE}>
        {UI_ANALYTICS_DISTRIBUTION_LOADING_BODY}
      </InlineAlert>
    )
  }

  if (distributionQuery.isError) {
    return (
      <InlineAlert variant="danger" title={UI_ANALYTICS_DISTRIBUTION_ERROR_TITLE}>
        {UI_ANALYTICS_DISTRIBUTION_ERROR_BODY}
      </InlineAlert>
    )
  }

  const rows = distributionQuery.data?.distribution ?? []

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <p className="text-muted mb-0">{UI_ANALYTICS_DISTRIBUTION_DESCRIPTION}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-busy={isFetching}
          >
            {isFetching || isLoading
              ? UI_ANALYTICS_DISTRIBUTION_REFRESH_PENDING
              : UI_ANALYTICS_DISTRIBUTION_REFRESH_LABEL}
          </Button>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.licenseKey}
        emptyState={UI_ANALYTICS_DISTRIBUTION_EMPTY_STATE}
      />
    </Stack>
  )
}
