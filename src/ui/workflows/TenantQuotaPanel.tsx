import { useMemo, useState } from 'react'
import type { Client } from '@simple-license/react-sdk'
import { useQuotaConfig, useQuotaUsage } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'

import { SummaryList } from '../data/SummaryList'
import type { UiSummaryCardItem } from '../types'
import { Stack } from '../layout/Stack'
import { InlineAlert } from '../feedback/InlineAlert'
import { TenantQuotaFormFlow } from './TenantQuotaFormFlow'

type TenantQuotaPanelProps = {
  client: Client
  tenantId: string
  title?: string
  onUpdated?: () => void
}

const formatValue = (value?: number | null) => {
  if (value === undefined || value === null) {
    return '—'
  }
  return value.toLocaleString()
}

export function TenantQuotaPanel({ client, tenantId, title = 'Quota Limits', onUpdated }: TenantQuotaPanelProps) {
  const [showModal, setShowModal] = useState(false)
  const usageQuery = useQuotaUsage(client, tenantId, { retry: false })
  const configQuery = useQuotaConfig(client, tenantId, { retry: false })

  const usageItems = useMemo<UiSummaryCardItem[]>(() => {
    if (!usageQuery.data?.usage) {
      return []
    }

    return [
      {
        id: 'products-count',
        label: 'Products (used / max)',
        value: `${usageQuery.data.usage.products_count.toLocaleString()} / ${formatValue(usageQuery.data.usage.max_products)}`,
      },
      {
        id: 'activations-count',
        label: 'Activations (used / max)',
        value: `${usageQuery.data.usage.activations_count.toLocaleString()} / ${formatValue(usageQuery.data.usage.max_activations_total)}`,
      },
      {
        id: 'per-product',
        label: 'Per-product activations',
        value: formatValue(usageQuery.data.usage.max_activations_per_product),
      },
    ]
  }, [usageQuery.data])

  const handleSuccess = async () => {
    await Promise.all([usageQuery.refetch(), configQuery.refetch()])
    onUpdated?.()
  }

  const isLoading = usageQuery.isLoading || configQuery.isLoading
  const hasError = usageQuery.isError || configQuery.isError

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="h5 mb-1">{title}</h2>
          <p className="text-muted mb-0">Track and adjust tenant-specific product and activation limits.</p>
        </div>
        <Button variant="outline-primary" onClick={() => setShowModal(true)}>
          Edit Quotas
        </Button>
      </div>

      {isLoading ? (
        <InlineAlert variant="info" title="Loading quota data">
          Fetching the latest limits…
        </InlineAlert>
      ) : hasError ? (
        <InlineAlert variant="danger" title="Unable to load quotas">
          Please try again after refreshing the page.
        </InlineAlert>
      ) : (
        <SummaryList items={usageItems} />
      )}

      <TenantQuotaFormFlow
        client={client}
        tenantId={tenantId}
        show={showModal}
        onClose={() => setShowModal(false)}
        submitLabel="Save quotas"
        defaultValues={configQuery.data?.config}
        onSuccess={handleSuccess}
      />
    </Stack>
  )
}


