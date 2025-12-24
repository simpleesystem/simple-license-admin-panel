import type { Client, LicenseActivation, User } from '@/simpleLicense'
import { useLicenseActivations } from '@/simpleLicense'
import { useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import { canViewActivations, isActivationOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import { isSystemAdminUser } from '../../app/auth/userUtils'
import {
  UI_COLUMN_ID_LICENSE_ACTIVATION_ACTIVATED_AT,
  UI_COLUMN_ID_LICENSE_ACTIVATION_CLIENT_VERSION,
  UI_COLUMN_ID_LICENSE_ACTIVATION_DOMAIN,
  UI_COLUMN_ID_LICENSE_ACTIVATION_IP,
  UI_COLUMN_ID_LICENSE_ACTIVATION_LAST_SEEN,
  UI_COLUMN_ID_LICENSE_ACTIVATION_REGION,
  UI_COLUMN_ID_LICENSE_ACTIVATION_SITE,
  UI_COLUMN_ID_LICENSE_ACTIVATION_STATUS,
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_TIME_FORMAT_OPTIONS,
  UI_LICENSE_ACTIVATIONS_COLUMN_ACTIVATED_AT,
  UI_LICENSE_ACTIVATIONS_COLUMN_CLIENT_VERSION,
  UI_LICENSE_ACTIVATIONS_COLUMN_DOMAIN,
  UI_LICENSE_ACTIVATIONS_COLUMN_IP,
  UI_LICENSE_ACTIVATIONS_COLUMN_LAST_SEEN,
  UI_LICENSE_ACTIVATIONS_COLUMN_REGION,
  UI_LICENSE_ACTIVATIONS_COLUMN_SITE,
  UI_LICENSE_ACTIVATIONS_COLUMN_STATUS,
  UI_LICENSE_ACTIVATIONS_DEFAULT_LIMIT,
  UI_LICENSE_ACTIVATIONS_DESCRIPTION,
  UI_LICENSE_ACTIVATIONS_EMPTY_STATE,
  UI_LICENSE_ACTIVATIONS_ERROR_BODY,
  UI_LICENSE_ACTIVATIONS_ERROR_TITLE,
  UI_LICENSE_ACTIVATIONS_LOADING_BODY,
  UI_LICENSE_ACTIVATIONS_LOADING_TITLE,
  UI_LICENSE_ACTIVATIONS_REFRESH_LABEL,
  UI_LICENSE_ACTIVATIONS_REFRESH_PENDING,
  UI_LICENSE_ACTIVATIONS_TITLE,
  UI_STACK_GAP_SMALL,
  UI_TEXT_ALIGN_END,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import type { UiDataTableColumn } from '../types'

type LicenseActivationsPanelProps = {
  client: Client
  licenseKey: string
  licenseVendorId?: string | null
  currentUser?: User | null
  title?: string
  maxRows?: number
}

type LicenseActivationRow = LicenseActivation

const formatDateTime = (value: string | Date | null | undefined, formatter: Intl.DateTimeFormat) => {
  if (!value) {
    return UI_VALUE_PLACEHOLDER
  }
  return formatter.format(new Date(value))
}

const formatValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return UI_VALUE_PLACEHOLDER
  }
  return typeof value === 'number' ? value.toLocaleString() : value
}

export function LicenseActivationsPanel({
  client,
  licenseKey,
  licenseVendorId,
  currentUser,
  title = UI_LICENSE_ACTIVATIONS_TITLE,
  maxRows,
}: LicenseActivationsPanelProps) {
  const allowView = canViewActivations(currentUser ?? null)
  const isSystemAdmin = isSystemAdminUser(currentUser ?? null)
  const isVendorScoped = isVendorScopedUser(currentUser ?? null)
  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_TIME_FORMAT_OPTIONS),
    []
  )
  const rowLimit = maxRows ?? UI_LICENSE_ACTIVATIONS_DEFAULT_LIMIT

  const activationsQuery = useLicenseActivations(client, licenseKey, { retry: false })

  const rows = useMemo(() => {
    const activations = activationsQuery.data?.activations ?? []
    const scoped = isVendorScoped
      ? activations.filter((activation) => isActivationOwnedByUser(currentUser ?? null, activation))
      : activations
    return scoped.slice(0, rowLimit)
  }, [activationsQuery.data?.activations, currentUser, isVendorScoped, rowLimit])

  const columns = useMemo<UiDataTableColumn<LicenseActivationRow>[]>(() => {
    return [
      {
        id: UI_COLUMN_ID_LICENSE_ACTIVATION_DOMAIN,
        header: UI_LICENSE_ACTIVATIONS_COLUMN_DOMAIN,
        cell: (row) => row.domain,
      },
      {
        id: UI_COLUMN_ID_LICENSE_ACTIVATION_SITE,
        header: UI_LICENSE_ACTIVATIONS_COLUMN_SITE,
        cell: (row) => formatValue(row.siteName),
      },
      {
        id: UI_COLUMN_ID_LICENSE_ACTIVATION_STATUS,
        header: UI_LICENSE_ACTIVATIONS_COLUMN_STATUS,
        cell: (row) => row.status,
      },
      {
        id: UI_COLUMN_ID_LICENSE_ACTIVATION_ACTIVATED_AT,
        header: UI_LICENSE_ACTIVATIONS_COLUMN_ACTIVATED_AT,
        cell: (row) => formatDateTime(row.activatedAt, dateTimeFormatter),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_LICENSE_ACTIVATION_LAST_SEEN,
        header: UI_LICENSE_ACTIVATIONS_COLUMN_LAST_SEEN,
        cell: (row) => formatDateTime(row.lastSeenAt ?? row.lastCheckedAt ?? null, dateTimeFormatter),
        textAlign: UI_TEXT_ALIGN_END,
      },
      {
        id: UI_COLUMN_ID_LICENSE_ACTIVATION_IP,
        header: UI_LICENSE_ACTIVATIONS_COLUMN_IP,
        cell: (row) => formatValue(row.ipAddress),
      },
      {
        id: UI_COLUMN_ID_LICENSE_ACTIVATION_REGION,
        header: UI_LICENSE_ACTIVATIONS_COLUMN_REGION,
        cell: (row) => formatValue(row.region),
      },
      {
        id: UI_COLUMN_ID_LICENSE_ACTIVATION_CLIENT_VERSION,
        header: UI_LICENSE_ACTIVATIONS_COLUMN_CLIENT_VERSION,
        cell: (row) => formatValue(row.clientVersion),
        textAlign: UI_TEXT_ALIGN_END,
      },
    ]
  }, [dateTimeFormatter])

  if (
    !allowView ||
    (!isSystemAdmin && licenseVendorId && !isActivationOwnedByUser(currentUser ?? null, { vendorId: licenseVendorId } as LicenseActivation))
  ) {
    return (
      <InlineAlert variant="danger" title={UI_LICENSE_ACTIVATIONS_ERROR_TITLE}>
        {UI_LICENSE_ACTIVATIONS_ERROR_BODY}
      </InlineAlert>
    )
  }

  if (!licenseKey) {
    return (
      <InlineAlert variant="warning" title={UI_LICENSE_ACTIVATIONS_ERROR_TITLE}>
        {UI_LICENSE_ACTIVATIONS_ERROR_BODY}
      </InlineAlert>
    )
  }

  if (activationsQuery.isLoading) {
    return (
      <InlineAlert variant="info" title={UI_LICENSE_ACTIVATIONS_LOADING_TITLE}>
        {UI_LICENSE_ACTIVATIONS_LOADING_BODY}
      </InlineAlert>
    )
  }

  if (activationsQuery.isError) {
    return (
      <InlineAlert variant="danger" title={UI_LICENSE_ACTIVATIONS_ERROR_TITLE}>
        {UI_LICENSE_ACTIVATIONS_ERROR_BODY}
      </InlineAlert>
    )
  }

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div className="d-flex flex-column gap-1">
          <h2 className="h5 mb-0">{title}</h2>
          <p className="text-muted mb-0">{UI_LICENSE_ACTIVATIONS_DESCRIPTION}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => activationsQuery.refetch()}
            disabled={activationsQuery.isFetching}
            aria-busy={activationsQuery.isFetching}
          >
            {activationsQuery.isFetching
              ? UI_LICENSE_ACTIVATIONS_REFRESH_PENDING
              : UI_LICENSE_ACTIVATIONS_REFRESH_LABEL}
          </Button>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id ?? `${row.licenseKey}-${row.domain}-${row.activatedAt}`}
        emptyState={UI_LICENSE_ACTIVATIONS_EMPTY_STATE}
      />
    </Stack>
  )
}
