import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client } from '@/simpleLicense'
import { useQuotaConfig, useQuotaUsage } from '@/simpleLicense'

import {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_INFO,
  UI_BUTTON_VARIANT_OUTLINE,
  UI_STACK_GAP_SMALL,
  UI_TENANT_QUOTA_ACTIVATIONS_LABEL,
  UI_TENANT_QUOTA_EDIT_BUTTON,
  UI_TENANT_QUOTA_ERROR_BODY,
  UI_TENANT_QUOTA_ERROR_TITLE,
  UI_TENANT_QUOTA_LOADING_BODY,
  UI_TENANT_QUOTA_LOADING_TITLE,
  UI_TENANT_QUOTA_PANEL_DESCRIPTION,
  UI_TENANT_QUOTA_PANEL_TITLE,
  UI_TENANT_QUOTA_PER_PRODUCT_LABEL,
  UI_TENANT_QUOTA_PRODUCTS_LABEL,
  UI_TENANT_QUOTA_SAVE_BUTTON,
  UI_TENANT_QUOTA_SUMMARY_ID_ACTIVATIONS,
  UI_TENANT_QUOTA_SUMMARY_ID_PER_PRODUCT,
  UI_TENANT_QUOTA_SUMMARY_ID_PRODUCTS,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { SummaryList } from '../data/SummaryList'
import { InlineAlert } from '../feedback/InlineAlert'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import type { UiSummaryCardItem } from '../types'
import { TenantQuotaFormFlow } from './TenantQuotaFormFlow'

type TenantQuotaPanelProps = {
  client: Client
  tenantId: string
  title?: string
  onUpdated?: () => void
}

const formatValue = (value?: number | null) => {
  if (value === undefined || value === null) {
    return UI_VALUE_PLACEHOLDER
  }
  return value.toLocaleString()
}

export function TenantQuotaPanel({
  client,
  tenantId,
  title = UI_TENANT_QUOTA_PANEL_TITLE,
  onUpdated,
}: TenantQuotaPanelProps) {
  const [showModal, setShowModal] = useState(false)
  const usageQuery = useQuotaUsage(client, tenantId, { retry: false })
  const configQuery = useQuotaConfig(client, tenantId, { retry: false })

  const usageItems = useMemo<UiSummaryCardItem[]>(() => {
    if (!usageQuery.data?.usage) {
      return []
    }

    return [
      {
        id: UI_TENANT_QUOTA_SUMMARY_ID_PRODUCTS,
        label: UI_TENANT_QUOTA_PRODUCTS_LABEL,
        value: `${usageQuery.data.usage.products_count.toLocaleString()} / ${formatValue(usageQuery.data.usage.max_products)}`,
      },
      {
        id: UI_TENANT_QUOTA_SUMMARY_ID_ACTIVATIONS,
        label: UI_TENANT_QUOTA_ACTIVATIONS_LABEL,
        value: `${usageQuery.data.usage.activations_count.toLocaleString()} / ${formatValue(usageQuery.data.usage.max_activations_total)}`,
      },
      {
        id: UI_TENANT_QUOTA_SUMMARY_ID_PER_PRODUCT,
        label: UI_TENANT_QUOTA_PER_PRODUCT_LABEL,
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
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <PanelHeader
        title={title}
        description={UI_TENANT_QUOTA_PANEL_DESCRIPTION}
        actions={
          <Button variant={UI_BUTTON_VARIANT_OUTLINE} onClick={() => setShowModal(true)}>
            {UI_TENANT_QUOTA_EDIT_BUTTON}
          </Button>
        }
      />

      {isLoading ? (
        <InlineAlert variant={UI_ALERT_VARIANT_INFO} title={UI_TENANT_QUOTA_LOADING_TITLE}>
          {UI_TENANT_QUOTA_LOADING_BODY}
        </InlineAlert>
      ) : hasError ? (
        <InlineAlert variant={UI_ALERT_VARIANT_DANGER} title={UI_TENANT_QUOTA_ERROR_TITLE}>
          {UI_TENANT_QUOTA_ERROR_BODY}
        </InlineAlert>
      ) : (
        <SummaryList items={usageItems} />
      )}

      <TenantQuotaFormFlow
        client={client}
        tenantId={tenantId}
        show={showModal}
        onClose={() => setShowModal(false)}
        submitLabel={UI_TENANT_QUOTA_SAVE_BUTTON}
        defaultValues={configQuery.data?.config}
        onSuccess={handleSuccess}
      />
    </Stack>
  )
}
