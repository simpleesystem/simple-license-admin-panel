import type { ReactNode } from 'react'
import type { Client, CreateEntitlementRequest, UpdateEntitlementRequest } from '@/simpleLicense'
import { useCreateEntitlement, useUpdateEntitlement } from '@/simpleLicense'

import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_ENTITLEMENT_FORM_PENDING_CREATE,
  UI_ENTITLEMENT_FORM_PENDING_UPDATE,
  UI_ENTITLEMENT_FORM_SUBMIT_CREATE,
  UI_ENTITLEMENT_FORM_SUBMIT_UPDATE,
} from '../constants'
import type { FormBlueprint } from '../formBuilder/blueprint'
import type { EntitlementFormValues } from '../formBuilder/factories'
import { createEntitlementBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import type { UiSelectOption } from '../types'
import { wrapMutationAdapter } from './mutationHelpers'

type ProductEntitlementBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  secondaryActions?: ReactNode
  onCompleted?: () => void
  onSuccess?: () => void
  onError?: (error: unknown) => void
  tierOptions?: readonly UiSelectOption[]
}

type ProductEntitlementCreateProps = ProductEntitlementBaseProps & {
  mode: 'create'
  productId: string
  defaultValues?: Partial<EntitlementFormValues>
}

type ProductEntitlementUpdateProps = ProductEntitlementBaseProps & {
  mode: 'update'
  entitlementId: string
  defaultValues?: Partial<EntitlementFormValues>
}

export type ProductEntitlementFormFlowProps = ProductEntitlementCreateProps | ProductEntitlementUpdateProps

const baseFormDefaults: EntitlementFormValues = {
  key: '',
  description: '',
  metadata: '',
  number_value: '',
  boolean_value: '',
  string_value: '',
  tier_ids: [],
}

// Helper to convert FormValues to API Request
const mapFormToApi = (
  values: EntitlementFormValues
): Omit<CreateEntitlementRequest, 'tier_ids'> & { tier_ids?: string[] } => {
  const metadataStr = values.metadata?.trim()
  const metadata = metadataStr ? JSON.parse(metadataStr) : undefined
  const result: Partial<CreateEntitlementRequest> & { tier_ids?: string[] } = {
    key: values.key,
    description: values.description,
    tier_ids: values.tier_ids || [], // Form might not have this field yet, but API requires it for create. Controller handles empty check.
    metadata,
  }

  // Handle number_value
  if (values.number_value !== undefined && values.number_value !== '') {
    const num = Number(values.number_value)
    if (!Number.isNaN(num)) {
      result.number_value = num
    }
  }

  // Handle boolean_value
  if (values.boolean_value === 'true') {
    result.boolean_value = true
  } else if (values.boolean_value === 'false') {
    result.boolean_value = false
  }

  // Handle string_value
  if (values.string_value !== undefined && values.string_value !== '') {
    result.string_value = values.string_value
  }

  return result as Omit<CreateEntitlementRequest, 'tier_ids'> & { tier_ids?: string[] }
}

export function ProductEntitlementFormFlow(props: ProductEntitlementFormFlowProps) {
  if (props.mode === 'create') {
    return <ProductEntitlementCreateFlow {...props} />
  }

  return <ProductEntitlementUpdateFlow {...props} />
}

function ProductEntitlementCreateFlow(props: ProductEntitlementCreateProps) {
  const createMutation = useCreateEntitlement(props.client, props.productId)

  const defaultValues: EntitlementFormValues = {
    ...baseFormDefaults,
    ...props.defaultValues,
  }

  const submitLabel = props.submitLabel ?? UI_ENTITLEMENT_FORM_SUBMIT_CREATE
  const pendingLabel = props.pendingLabel ?? UI_ENTITLEMENT_FORM_PENDING_CREATE

  const adapter: MutationAdapter<EntitlementFormValues> = {
    mutateAsync: async (values) => {
      const apiData = mapFormToApi(values)
      // Ensure tier_ids is present for create
      const request: CreateEntitlementRequest = {
        tier_ids: apiData.tier_ids || [], // Will fail validation if empty, but types require it
        ...apiData,
      }
      return await createMutation.mutateAsync(request)
    },
    isPending: createMutation.isPending,
  }

  const blueprint = createEntitlementBlueprint('create', {
    tierOptions: props.tierOptions,
  }) as unknown as FormBlueprint<EntitlementFormValues>

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={blueprint}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={wrapMutationAdapter(adapter, {
        onCompleted: props.onCompleted,
        onSuccess: props.onSuccess,
        onError: props.onError,
      })}
    />
  )
}

function ProductEntitlementUpdateFlow(props: ProductEntitlementUpdateProps) {
  const updateMutation = useUpdateEntitlement(props.client)

  const defaultValues: EntitlementFormValues = {
    ...baseFormDefaults,
    ...props.defaultValues,
  }

  const submitLabel = props.submitLabel ?? UI_ENTITLEMENT_FORM_SUBMIT_UPDATE
  const pendingLabel = props.pendingLabel ?? UI_ENTITLEMENT_FORM_PENDING_UPDATE

  const adapter: MutationAdapter<EntitlementFormValues> = {
    mutateAsync: async (values) => {
      const apiData = mapFormToApi(values)
      const request: UpdateEntitlementRequest = {
        ...apiData,
      }
      return await updateMutation.mutateAsync({
        id: props.entitlementId,
        data: request,
      })
    },
    isPending: updateMutation.isPending,
  }

  const blueprint = createEntitlementBlueprint('update', {
    tierOptions: props.tierOptions,
  }) as unknown as FormBlueprint<EntitlementFormValues>

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={blueprint}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={wrapMutationAdapter(adapter, {
        onCompleted: props.onCompleted,
        onSuccess: props.onSuccess,
        onError: props.onError,
      })}
    />
  )
}
