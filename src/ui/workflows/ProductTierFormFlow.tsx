import type {
  Client,
  CreateProductTierRequest,
  UpdateProductTierRequest,
} from '@simple-license/react-sdk'
import { useCreateProductTier, useUpdateProductTier } from '@simple-license/react-sdk'
import type { FieldValues } from 'react-hook-form'
import type { ReactNode } from 'react'

import { UI_PRODUCT_TIER_FORM_SUBMIT_CREATE, UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE } from '../constants'
import { createProductTierBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type ProductTierBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  secondaryActions?: ReactNode
  onCompleted?: () => void
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

const baseCreateDefaults: CreateProductTierRequest = {
  name: '',
  code: '',
  description: '',
  metadata: {},
}

const baseUpdateDefaults: UpdateProductTierRequest = {
  name: undefined,
  code: undefined,
  description: undefined,
  metadata: undefined,
}

const withOnClose = <TFieldValues extends FieldValues>(
  adapter: MutationAdapter<TFieldValues>,
  onClose: () => void,
  onCompleted?: () => void,
): MutationAdapter<TFieldValues> => ({
  mutateAsync: async (values) => {
    const result = await adapter.mutateAsync(values)
    onCompleted?.()
    onClose()
    return result
  },
  isPending: adapter.isPending,
})

export function ProductTierFormFlow(props: ProductTierFormFlowProps) {
  if (props.mode === 'create') {
    return <ProductTierCreateFlow {...props} />
  }

  return <ProductTierUpdateFlow {...props} />
}

function ProductTierCreateFlow(props: ProductTierCreateProps) {
  const createMutation = adaptMutation(useCreateProductTier(props.client, props.productId))
  const defaultValues: CreateProductTierRequest = {
    ...baseCreateDefaults,
    ...props.defaultValues,
  }
  const submitLabel = props.submitLabel ?? UI_PRODUCT_TIER_FORM_SUBMIT_CREATE

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={createProductTierBlueprint('create')}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={props.pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={withOnClose(createMutation, props.onClose, props.onCompleted)}
    />
  )
}

function ProductTierUpdateFlow(props: ProductTierUpdateProps) {
  const updateMutation = useUpdateProductTier(props.client)
  const defaultValues: UpdateProductTierRequest = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
  }
  const submitLabel = props.submitLabel ?? UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE

  const adapter: MutationAdapter<UpdateProductTierRequest> = {
    mutateAsync: async (values) => {
      return await updateMutation.mutateAsync({
        id: props.tierId,
        data: values,
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
      pendingLabel={props.pendingLabel}
      secondaryActions={props.secondaryActions}
    mutation={withOnClose(adapter, props.onClose, props.onCompleted)}
    />
  )
}


