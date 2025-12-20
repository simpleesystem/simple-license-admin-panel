import { useMemo } from 'react'
import type { Client, LicenseUsageDetailsResponse, User } from '@simple-license/react-sdk'
import { useLicenseUsageDetails } from '@simple-license/react-sdk'

import {
  UI_ANALYTICS_COLUMN_ACTIVATIONS,
  UI_ANALYTICS_COLUMN_PEAK_CONCURRENCY,
  UI_ANALYTICS_COLUMN_PERIOD,
  UI_ANALYTICS_COLUMN_UNIQUE_DOMAINS,
  UI_ANALYTICS_COLUMN_UNIQUE_IPS,
  UI_ANALYTICS_COLUMN_USAGE_REPORTS,
  UI_ANALYTICS_COLUMN_VALIDATIONS,
  UI_ANALYTICS_LICENSE_DETAILS_DEFAULT_LIMIT,
  UI_ANALYTICS_LICENSE_DETAILS_DESCRIPTION,
  UI_ANALYTICS_LICENSE_DETAILS_EMPTY_STATE,
  UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY,
  UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE,
  UI_ANALYTICS_LICENSE_DETAILS_LOADING_BODY,
  UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE,
  UI_ANALYTICS_LICENSE_DETAILS_TITLE,
  UI_COLUMN_ID_ANALYTICS_ACTIVATIONS,
  UI_COLUMN_ID_ANALYTICS_PEAK_CONCURRENCY,
  UI_COLUMN_ID_ANALYTICS_PERIOD,
  UI_COLUMN_ID_ANALYTICS_UNIQUE_DOMAINS,
  UI_COLUMN_ID_ANALYTICS_UNIQUE_IPS,
  UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
  UI_COLUMN_ID_ANALYTICS_VALIDATIONS,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_FORMAT_OPTIONS,
  UI_TEXT_ALIGN_END,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { canViewLicenses, isVendorScopedUser } from '../../app/auth/permissions'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'

type LicenseUsageDetailsPanelProps = {
  client: Client
  licenseKey: string
  licenseVendorId?: string | null
  currentUser?: User | null
  title?: string
  periodStart?: string
  periodEnd?: string
  maxRows?: number
}

type LicenseUsageRow = LicenseUsageDetailsResponse['summaries'][number]

const formatPeriodRange = (row: LicenseUsageRow, formatter: Intl.DateTimeFormat) => {
  const start = formatter.format(new Date(row.periodStart))
  const end = formatter.format(new Date(row.periodEnd))
  return `${start} – ${end}`
}

const formatNumber = (value: number | null | undefined) => {
  if (typeof value !== 'number') {
    return UI_VALUE_PLACEHOLDER
  }
  return value.toLocaleString()
}

export function LicenseUsageDetailsPanel({
  client,
  licenseKey,
  licenseVendorId,
  currentUser,
  title = UI_ANALYTICS_LICENSE_DETAILS_TITLE,
  periodStart,
  periodEnd,
  maxRows,
}: LicenseUsageDetailsPanelProps) {
  const allowView = canViewLicenses(currentUser ?? null)
  const isVendorScoped = isVendorScopedUser(currentUser ?? null)
  const queryParams = useMemo(() => {
    if (!periodStart && !periodEnd) {
      return undefined
    }
    return { periodStart, periodEnd }
  }, [periodStart, periodEnd])

  const detailsQuery = useLicenseUsageDetails(client, licenseKey, queryParams, { retry: false })
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS), [])
  const rowLimit = maxRows ?? UI_ANALYTICS_LICENSE_DETAILS_DEFAULT_LIMIT

  const columns = useMemo<UiDataTableColumn<LicenseUsageRow>[]>(() => {
    return [
      {
        id: UI_COLUMN_ID_ANALYTICS_PERIOD,
        header: UI_ANALYTICS_COLUMN_PERIOD,
        cell: (row) => formatPeriodRange(row, dateFormatter),
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
        id: UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS,
        header: UI_ANALYTICS_COLUMN_USAGE_REPORTS,
        cell: (row) => formatNumber(row.totalUsageReports),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_UNIQUE_DOMAINS,
        header: UI_ANALYTICS_COLUMN_UNIQUE_DOMAINS,
        cell: (row) => formatNumber(row.uniqueDomains),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_UNIQUE_IPS,
        header: UI_ANALYTICS_COLUMN_UNIQUE_IPS,
        cell: (row) => formatNumber(row.uniqueIPs),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_ANALYTICS_PEAK_CONCURRENCY,
        header: UI_ANALYTICS_COLUMN_PEAK_CONCURRENCY,
        cell: (row) => formatNumber(row.peakConcurrency),
        textAlign: UI_TEXT_ALIGN_END,
      },
    ]
  }, [dateFormatter])

  const rows = useMemo(() => {
    const summaries = detailsQuery.data?.summaries ?? []
    return summaries.slice(0, rowLimit)
  }, [detailsQuery.data?.summaries, rowLimit])

  if (!allowView || (isVendorScoped && licenseVendorId && licenseVendorId !== currentUser?.vendorId)) {
    return (
      <InlineAlert variant="danger" title={UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE}>
        {UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY}
      </InlineAlert>
    )
  }

  if (!licenseKey) {
    return (
      <InlineAlert variant="warning" title={UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE}>
        {UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY}
      </InlineAlert>
    )
  }

  if (detailsQuery.isLoading) {
    return (
      <InlineAlert variant="info" title={UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE}>
        {UI_ANALYTICS_LICENSE_DETAILS_LOADING_BODY}
      </InlineAlert>
    )
  }

  if (detailsQuery.isError) {
    return (
      <InlineAlert variant="danger" title={UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE}>
        {UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY}
      </InlineAlert>
    )
  }

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex flex-column gap-1">
        <h2 className="h5 mb-0">{title}</h2>
        <p className="text-muted mb-0">{UI_ANALYTICS_LICENSE_DETAILS_DESCRIPTION}</p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id.toString()}
        emptyState={UI_ANALYTICS_LICENSE_DETAILS_EMPTY_STATE}
      />
    </Stack>
  )
}

