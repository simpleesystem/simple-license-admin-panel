import { useMemo } from 'react'
import type { Client, TopLicensesResponse } from '@simple-license/react-sdk'
import { useTopLicenses } from '@simple-license/react-sdk'

import {
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_COLUMN_CUSTOMER_EMAIL,
  UI_ANALYTICS_COLUMN_LAST_ACTIVATED,
  UI_ANALYTICS_COLUMN_LICENSE_KEY,
  UI_ANALYTICS_COLUMN_PEAK_CONCURRENCY,
  UI_ANALYTICS_COLUMN_VALIDATIONS,
  UI_ANALYTICS_TOP_LICENSES_DEFAULT_LIMIT,
  UI_ANALYTICS_TOP_LICENSES_DESCRIPTION,
  UI_ANALYTICS_TOP_LICENSES_EMPTY_STATE,
  UI_ANALYTICS_TOP_LICENSES_ERROR_BODY,
  UI_ANALYTICS_TOP_LICENSES_ERROR_TITLE,
  UI_ANALYTICS_TOP_LICENSES_LOADING_BODY,
  UI_ANALYTICS_TOP_LICENSES_LOADING_TITLE,
  UI_ANALYTICS_TOP_LICENSES_TITLE,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_CUSTOMER_EMAIL,
  UI_COLUMN_ID_ANALYTICS_LAST_ACTIVATED,
  UI_COLUMN_ID_ANALYTICS_LICENSE_KEY,
  UI_COLUMN_ID_ANALYTICS_PEAK_CONCURRENCY,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_FORMAT_OPTIONS,
  UI_TEXT_ALIGN_END,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'

type TopLicensesPanelProps = {
  client: Client
  title?: string
  maxRows?: number
}

type TopLicenseRow = TopLicensesResponse['licenses'][number]

const formatNumber = (value: number) => value.toLocaleString()

export function TopLicensesPanel({ client, title = UI_ANALYTICS_TOP_LICENSES_TITLE, maxRows }: TopLicensesPanelProps) {
  const topLicensesQuery = useTopLicenses(client, { retry: false })
  const rowLimit = maxRows ?? UI_ANALYTICS_TOP_LICENSES_DEFAULT_LIMIT
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS), [])

  const columns = useMemo<UiDataTableColumn<TopLicenseRow>[]>(() => {
    return [
      {
        id: UI_COLUMN_ID_ANALYTICS_LICENSE_KEY,
        header: UI_ANALYTICS_COLUMN_LICENSE_KEY,
        cell: (row) => row.licenseKey,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_CUSTOMER_EMAIL,
        header: UI_ANALYTICS_COLUMN_CUSTOMER_EMAIL,
        cell: (row) => row.customerEmail,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
        header: UI_ANALYTICS_COLUMN_ACTIVATIONS,
        cell: (row) => formatNumber(row.totalActivations),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
        header: UI_ANALYTICS_COLUMN_VALIDATIONS,
        cell: (row) => formatNumber(row.totalValidations),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_PEAK_CONCURRENCY,
        header: UI_ANALYTICS_COLUMN_PEAK_CONCURRENCY,
        cell: (row) => formatNumber(row.peakConcurrency),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_LAST_ACTIVATED,
        header: UI_ANALYTICS_COLUMN_LAST_ACTIVATED,
        cell: (row) => dateFormatter.format(new Date(row.lastActivatedAt)),
      },
    ]
  }, [dateFormatter])

  if (topLicensesQuery.isLoading) {
    return (
      <InlineAlert variant="info" title={UI_ANALYTICS_TOP_LICENSES_LOADING_TITLE}>
        {UI_ANALYTICS_TOP_LICENSES_LOADING_BODY}
      </InlineAlert>
    )
  }

  if (topLicensesQuery.isError) {
    return (
      <InlineAlert variant="danger" title={UI_ANALYTICS_TOP_LICENSES_ERROR_TITLE}>
        {UI_ANALYTICS_TOP_LICENSES_ERROR_BODY}
      </InlineAlert>
    )
  }

  const rows = (topLicensesQuery.data?.licenses ?? []).slice(0, rowLimit)

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex flex-column gap-1">
        <h2 className="h5 mb-0">{title}</h2>
        <p className="text-muted mb-0">{UI_ANALYTICS_TOP_LICENSES_DESCRIPTION}</p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.licenseKey}
        emptyState={UI_ANALYTICS_TOP_LICENSES_EMPTY_STATE}
      />
    </Stack>
  )
}

