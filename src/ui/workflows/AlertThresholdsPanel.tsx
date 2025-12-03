import { useMemo, useState } from 'react'
import type { Client } from '@simple-license/react-sdk'
import { useAlertThresholds } from '@simple-license/react-sdk'
import Button from 'react-bootstrap/Button'

import {
  UI_ALERT_THRESHOLD_LABEL_HIGH_ACTIVATIONS,
  UI_ALERT_THRESHOLD_LABEL_HIGH_CONCURRENCY,
  UI_ALERT_THRESHOLD_LABEL_HIGH_VALIDATIONS,
  UI_ALERT_THRESHOLD_LABEL_MEDIUM_ACTIVATIONS,
  UI_ALERT_THRESHOLD_LABEL_MEDIUM_CONCURRENCY,
  UI_ALERT_THRESHOLD_LABEL_MEDIUM_VALIDATIONS,
  UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_ACTIVATIONS,
  UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_CONCURRENCY,
  UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_VALIDATIONS,
  UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_ACTIVATIONS,
  UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_CONCURRENCY,
  UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_VALIDATIONS,
  UI_ALERT_THRESHOLD_FORM_SUBMIT_LABEL,
  UI_ANALYTICS_ALERT_THRESHOLDS_DESCRIPTION,
  UI_ANALYTICS_ALERT_THRESHOLDS_EMPTY_STATE,
  UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_BODY,
  UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_TITLE,
  UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_BODY,
  UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_TITLE,
  UI_ANALYTICS_ALERT_THRESHOLDS_TITLE,
  UI_BUTTON_LABEL_EDIT_ALERT_THRESHOLDS,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { SummaryList } from '../data/SummaryList'
import type { UiSummaryCardItem } from '../types'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import { AlertThresholdsFormFlow } from './AlertThresholdsFormFlow'

type AlertThresholdsPanelProps = {
  client: Client
  title?: string
  onUpdated?: () => void
}

const formatValue = (value?: number | null) => {
  if (typeof value !== 'number') {
    return UI_VALUE_PLACEHOLDER
  }
  return value.toLocaleString()
}

export function AlertThresholdsPanel({ client, title = UI_ANALYTICS_ALERT_THRESHOLDS_TITLE, onUpdated }: AlertThresholdsPanelProps) {
  const [showModal, setShowModal] = useState(false)
  const thresholdsQuery = useAlertThresholds(client, { retry: false })

  const summaryItems = useMemo<UiSummaryCardItem[]>(() => {
    if (!thresholdsQuery.data) {
      return []
    }

    return [
      {
        id: UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_ACTIVATIONS,
        label: UI_ALERT_THRESHOLD_LABEL_HIGH_ACTIVATIONS,
        value: formatValue(thresholdsQuery.data.high.activations),
      },
      {
        id: UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_VALIDATIONS,
        label: UI_ALERT_THRESHOLD_LABEL_HIGH_VALIDATIONS,
        value: formatValue(thresholdsQuery.data.high.validations),
      },
      {
        id: UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_CONCURRENCY,
        label: UI_ALERT_THRESHOLD_LABEL_HIGH_CONCURRENCY,
        value: formatValue(thresholdsQuery.data.high.concurrency),
      },
      {
        id: UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_ACTIVATIONS,
        label: UI_ALERT_THRESHOLD_LABEL_MEDIUM_ACTIVATIONS,
        value: formatValue(thresholdsQuery.data.medium.activations),
      },
      {
        id: UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_VALIDATIONS,
        label: UI_ALERT_THRESHOLD_LABEL_MEDIUM_VALIDATIONS,
        value: formatValue(thresholdsQuery.data.medium.validations),
      },
      {
        id: UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_CONCURRENCY,
        label: UI_ALERT_THRESHOLD_LABEL_MEDIUM_CONCURRENCY,
        value: formatValue(thresholdsQuery.data.medium.concurrency),
      },
    ]
  }, [thresholdsQuery.data])

  const handleSuccess = async () => {
    await thresholdsQuery.refetch()
    setShowModal(false)
    onUpdated?.()
  }

  const isLoading = thresholdsQuery.isLoading
  const hasError = thresholdsQuery.isError

  return (
    <Stack direction="column" gap="small">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="h5 mb-1">{title}</h2>
          <p className="text-muted mb-0">{UI_ANALYTICS_ALERT_THRESHOLDS_DESCRIPTION}</p>
        </div>
        <Button variant="outline-primary" onClick={() => setShowModal(true)}>
          {UI_BUTTON_LABEL_EDIT_ALERT_THRESHOLDS}
        </Button>
      </div>

      {isLoading ? (
        <InlineAlert variant="info" title={UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_TITLE}>
          {UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_BODY}
        </InlineAlert>
      ) : hasError ? (
        <InlineAlert variant="danger" title={UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_TITLE}>
          {UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_BODY}
        </InlineAlert>
      ) : summaryItems.length === 0 ? (
        <InlineAlert variant="warning" title={UI_ANALYTICS_ALERT_THRESHOLDS_TITLE}>
          {UI_ANALYTICS_ALERT_THRESHOLDS_EMPTY_STATE}
        </InlineAlert>
      ) : (
        <SummaryList items={summaryItems} />
      )}

      <AlertThresholdsFormFlow
        client={client}
        show={showModal}
        onClose={() => setShowModal(false)}
        submitLabel={UI_ALERT_THRESHOLD_FORM_SUBMIT_LABEL}
        pendingLabel={UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_BODY}
        defaultValues={{
          high_activations: thresholdsQuery.data?.high.activations,
          high_validations: thresholdsQuery.data?.high.validations,
          high_concurrency: thresholdsQuery.data?.high.concurrency,
          medium_activations: thresholdsQuery.data?.medium.activations,
          medium_validations: thresholdsQuery.data?.medium.validations,
          medium_concurrency: thresholdsQuery.data?.medium.concurrency,
        }}
        onSuccess={handleSuccess}
      />
    </Stack>
  )
}

