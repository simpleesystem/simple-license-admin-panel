import type { Client, UpdateAlertThresholdsRequest } from '@/simpleLicense'
import { useUpdateAlertThresholds } from '@/simpleLicense'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import { createAlertThresholdsBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'

type AlertThresholdsFormFlowProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: string
  pendingLabel?: string
  defaultValues?: Partial<UpdateAlertThresholdsRequest>
  onSuccess?: () => void
}

const baseDefaults: UpdateAlertThresholdsRequest = {
  high_activations: undefined,
  high_validations: undefined,
  high_concurrency: undefined,
  medium_activations: undefined,
  medium_validations: undefined,
  medium_concurrency: undefined,
}

export function AlertThresholdsFormFlow({
  client,
  defaultValues,
  onSuccess,
  ...modalProps
}: AlertThresholdsFormFlowProps) {
  const mutation = adaptMutation(useUpdateAlertThresholds(client))
  const mergedDefaults: UpdateAlertThresholdsRequest = {
    ...baseDefaults,
    ...defaultValues,
  }

  const normalizeValue = (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return undefined
    }
    if (typeof value === 'number') {
      return value
    }
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  const adapter: MutationAdapter<UpdateAlertThresholdsRequest> = {
    mutateAsync: async (values) => {
      const payload: UpdateAlertThresholdsRequest = {
        high_activations: normalizeValue(values.high_activations),
        high_validations: normalizeValue(values.high_validations),
        high_concurrency: normalizeValue(values.high_concurrency),
        medium_activations: normalizeValue(values.medium_activations),
        medium_validations: normalizeValue(values.medium_validations),
        medium_concurrency: normalizeValue(values.medium_concurrency),
      }
      const result = await mutation.mutateAsync(payload)
      onSuccess?.()
      return result
    },
    isPending: mutation.isPending,
  }

  return (
    <FormModalWithMutation
      blueprint={createAlertThresholdsBlueprint()}
      defaultValues={mergedDefaults}
      mutation={adapter}
      {...modalProps}
    />
  )
}
