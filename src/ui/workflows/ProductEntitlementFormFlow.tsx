import type {
  Client,
  CreateEntitlementRequest,
  UpdateEntitlementRequest,
} from '@simple-license/react-sdk'
import { useCreateEntitlement, useUpdateEntitlement } from '@simple-license/react-sdk'
import type { FieldValues } from 'react-hook-form'
import type { ReactNode } from 'react'

import { createEntitlementBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type ProductEntitlementBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  secondaryActions?: ReactNode
}

type ProductEntitlementCreateProps = ProductEntitlementBaseProps & {
  mode: 'create'
  productId: string
  defaultValues?: Partial<CreateEntitlementRequest>
}

type ProductEntitlementUpdateProps = ProductEntitlementBaseProps & {
  mode: 'update'
  entitlementId: string
  defaultValues?: Partial<UpdateEntitlementRequest>
}

export type ProductEntitlementFormFlowProps = ProductEntitlementCreateProps | ProductEntitlementUpdateProps

const baseCreateDefaults: CreateEntitlementRequest = {
  key: '',
  value_type: 'string',
  default_value: '',
  usage_limit: undefined,
  metadata: {},
}

const baseUpdateDefaults: UpdateEntitlementRequest = {
  key: undefined,
  value_type: undefined,
  default_value: undefined,
  usage_limit: undefined,
  metadata: undefined,
}

const withOnClose = <TFieldValues extends FieldValues>(
  adapter: MutationAdapter<TFieldValues>,
  onClose: () => void,
): MutationAdapter<TFieldValues> => ({
  mutateAsync: async (values) => {
    const result = await adapter.mutateAsync(values)
    onClose()
    return result
  },
  isPending: adapter.isPending,
})

export function ProductEntitlementFormFlow(props: ProductEntitlementFormFlowProps) {
  if (props.mode === 'create') {
    return <ProductEntitlementCreateFlow {...props} />
  }

  return <ProductEntitlementUpdateFlow {...props} />
}

function ProductEntitlementCreateFlow(props: ProductEntitlementCreateProps) {
  const createMutation = adaptMutation(useCreateEntitlement(props.client, props.productId))
  const defaultValues: CreateEntitlementRequest = {
    ...baseCreateDefaults,
    ...props.defaultValues,
  }

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={createEntitlementBlueprint('create')}
      defaultValues={defaultValues}
      submitLabel={props.submitLabel}
      pendingLabel={props.pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={withOnClose(createMutation, props.onClose)}
    />
  )
}

function ProductEntitlementUpdateFlow(props: ProductEntitlementUpdateProps) {
  const updateMutation = useUpdateEntitlement(props.client)
  const defaultValues: UpdateEntitlementRequest = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
  }

  const adapter: MutationAdapter<UpdateEntitlementRequest> = {
    mutateAsync: async (values) => {
      return await updateMutation.mutateAsync({
        id: props.entitlementId,
        data: values,
      })
    },
    isPending: updateMutation.isPending,
  }

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={createEntitlementBlueprint('update')}
      defaultValues={defaultValues}
      submitLabel={props.submitLabel}
      pendingLabel={props.pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={withOnClose(adapter, props.onClose)}
    />
  )
}


