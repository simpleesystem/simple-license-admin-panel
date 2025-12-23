import type { Client, CreateProductTierRequest, UpdateProductTierRequest } from '@/simpleLicense'
import { useCreateProductTier, useUpdateProductTier } from '@/simpleLicense'
import type { ReactNode } from 'react'

import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_PRODUCT_TIER_FORM_PENDING_CREATE,
  UI_PRODUCT_TIER_FORM_PENDING_UPDATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_CREATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE,
} from '../constants'
import { createProductTierBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import { wrapMutationAdapter } from './mutationHelpers'

type ProductTierBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  secondaryActions?: ReactNode
  onCompleted?: () => void
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

type ProductTierCreateProps = ProductTierBaseProps & {
  mode: 'create'
  productId: string
  defaultValues?: Partial<CreateProductTierRequest>
}

type ProductTierUpdateProps = ProductTierBaseProps & {
  mode: 'update'
  tierId: string
  defaultValues?: Partial<UpdateProductTierRequest>
}

export type ProductTierFormFlowProps = ProductTierCreateProps | ProductTierUpdateProps

// UI type for Form values (metadata is string)
type ProductTierFormValues = Omit<CreateProductTierRequest, 'metadata'> & { metadata?: string }

const baseCreateDefaults: ProductTierFormValues = {
  tier_name: '',
  tier_code: '',
  description: '',
  max_activations: undefined,
  does_not_expire: false,
  license_term_days: undefined,
  metadata: '',
}

const baseUpdateDefaults: Partial<ProductTierFormValues> = {
  tier_name: undefined,
  tier_code: undefined,
  description: undefined,
  metadata: '',
}

// Helper to convert empty strings to null/undefined
const sanitizeNumber = (value: number | string | null | undefined): number | null | undefined => {
  if (value === '' || value === null) return null // Explicitly return null for backend to handle as nullable
  if (value === undefined) return undefined
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}

export function ProductTierFormFlow(props: ProductTierFormFlowProps) {
  if (props.mode === 'create') {
    return <ProductTierCreateFlow {...props} />
  }

  return <ProductTierUpdateFlow {...props} />
}

function ProductTierCreateFlow(props: ProductTierCreateProps) {
  const createMutation = useCreateProductTier(props.client, props.productId)

  const defaultValues: ProductTierFormValues = {
    ...baseCreateDefaults,
    ...props.defaultValues,
    metadata: props.defaultValues?.metadata ? JSON.stringify(props.defaultValues.metadata, null, 2) : '',
  }

  const submitLabel = props.submitLabel ?? UI_PRODUCT_TIER_FORM_SUBMIT_CREATE
  const pendingLabel = props.pendingLabel ?? UI_PRODUCT_TIER_FORM_PENDING_CREATE

  const adapter: MutationAdapter<ProductTierFormValues> = {
    mutateAsync: async (values) => {
      const data: CreateProductTierRequest = {
        ...values,
        max_activations: sanitizeNumber(values.max_activations),
        license_term_days: sanitizeNumber(values.license_term_days),
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      }
      return await createMutation.mutateAsync(data)
    },
    isPending: createMutation.isPending,
  }

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={createProductTierBlueprint('create')}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={wrapMutationAdapter(adapter, {
        onClose: props.onClose,
        onCompleted: props.onCompleted,
        onSuccess: props.onSuccess,
        onError: props.onError,
      })}
    />
  )
}

function ProductTierUpdateFlow(props: ProductTierUpdateProps) {
  const updateMutation = useUpdateProductTier(props.client)

  const defaultValues: ProductTierFormValues = {
    ...baseUpdateDefaults,
    tier_name: props.defaultValues?.tier_name ?? '',
    tier_code: props.defaultValues?.tier_code ?? '',
    description: props.defaultValues?.description ?? '',
    ...props.defaultValues,
    metadata: props.defaultValues?.metadata ? JSON.stringify(props.defaultValues.metadata, null, 2) : '',
  }

  const submitLabel = props.submitLabel ?? UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE
  const pendingLabel = props.pendingLabel ?? UI_PRODUCT_TIER_FORM_PENDING_UPDATE

  const adapter: MutationAdapter<ProductTierFormValues> = {
    mutateAsync: async (values) => {
      const data: UpdateProductTierRequest = {
        ...values,
        max_activations: sanitizeNumber(values.max_activations),
        license_term_days: sanitizeNumber(values.license_term_days),
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      }
      return await updateMutation.mutateAsync({
        id: props.tierId,
        data,
      })
    },
    isPending: updateMutation.isPending,
  }

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={createProductTierBlueprint('update')}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={wrapMutationAdapter(adapter, {
        onClose: props.onClose,
        onCompleted: props.onCompleted,
        onSuccess: props.onSuccess,
        onError: props.onError,
      })}
    />
  )
}
