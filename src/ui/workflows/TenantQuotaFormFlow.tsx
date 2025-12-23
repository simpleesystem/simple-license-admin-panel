import type { Client, UpdateQuotaLimitsRequest } from '@/simpleLicense'
import { useUpdateQuotaLimits } from '@/simpleLicense'
import type { ReactNode } from 'react'

import { createTenantQuotaBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import type { MutationAdapter } from '../actions/mutationActions'

type TenantQuotaFormFlowProps = {
  client: Client
  tenantId: string
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  secondaryActions?: ReactNode
  defaultValues?: Partial<UpdateQuotaLimitsRequest>
  onSuccess?: () => void
}

const baseDefaults: UpdateQuotaLimitsRequest = {
  max_products: undefined,
  max_products_soft: undefined,
  max_activations_per_product: undefined,
  max_activations_per_product_soft: undefined,
  max_activations_total: undefined,
  max_activations_total_soft: undefined,
  quota_warning_threshold: undefined,
}

const createAdapter = (
  mutation: ReturnType<typeof useUpdateQuotaLimits>,
  tenantId: string,
): MutationAdapter<UpdateQuotaLimitsRequest> => ({
  mutateAsync: async (values) => {
    const result = await mutation.mutateAsync({ tenantId, data: values })
    return result
  },
  isPending: mutation.isPending,
})

export function TenantQuotaFormFlow({
  client,
  tenantId,
  show,
  onClose,
  submitLabel,
  pendingLabel,
  secondaryActions,
  defaultValues,
  onSuccess,
}: TenantQuotaFormFlowProps) {
  const mutation = useUpdateQuotaLimits(client)
  const adapter = createAdapter(mutation, tenantId)

  return (
    <FormModalWithMutation
      show={show}
      onClose={onClose}
      blueprint={createTenantQuotaBlueprint()}
      defaultValues={{
        ...baseDefaults,
        ...defaultValues,
      }}
      submitLabel={submitLabel}
      pendingLabel={pendingLabel}
      secondaryActions={secondaryActions}
      mutation={adapter}
      onSuccess={() => {
        onSuccess?.()
        onClose()
      }}
    />
  )
}


