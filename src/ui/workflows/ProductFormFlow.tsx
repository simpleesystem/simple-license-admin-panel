import type { Client, CreateProductRequest, UpdateProductRequest } from '@simple-license/react-sdk'
import { useCreateProduct, useUpdateProduct } from '@simple-license/react-sdk'
import type { FieldValues } from 'react-hook-form'
import type { ReactNode } from 'react'

import { createProductBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type ProductFormBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  secondaryActions?: ReactNode
}

type ProductFormCreateProps = ProductFormBaseProps & {
  mode: 'create'
  defaultValues?: Partial<CreateProductRequest>
}

type ProductFormUpdateProps = ProductFormBaseProps & {
  mode: 'update'
  productId: string
  defaultValues?: Partial<UpdateProductRequest>
}

export type ProductFormFlowProps = ProductFormCreateProps | ProductFormUpdateProps

const baseCreateDefaults: CreateProductRequest = {
  name: '',
  slug: '',
  description: '',
  metadata: {},
}

const baseUpdateDefaults: UpdateProductRequest = {
  name: undefined,
  slug: undefined,
  description: undefined,
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

export function ProductFormFlow(props: ProductFormFlowProps) {
  const createMutation = adaptMutation(useCreateProduct(props.client))
  const updateMutation = useUpdateProduct(props.client)

  if (props.mode === 'create') {
    const blueprint = createProductBlueprint('create')
    const defaultValues: CreateProductRequest = {
      ...baseCreateDefaults,
      ...props.defaultValues,
    }

    return (
      <FormModalWithMutation
        show={props.show}
        onClose={props.onClose}
        blueprint={blueprint}
        defaultValues={defaultValues}
        submitLabel={props.submitLabel}
        pendingLabel={props.pendingLabel}
        secondaryActions={props.secondaryActions}
        mutation={withOnClose(createMutation, props.onClose)}
      />
    )
  }

  const defaultValues: UpdateProductRequest = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
  }
  const adapter: MutationAdapter<UpdateProductRequest> = {
    mutateAsync: async (values) => {
      const result = await updateMutation.mutateAsync({ id: props.productId, data: values })
      return result
    },
    isPending: updateMutation.isPending,
  }

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={createProductBlueprint('update')}
      defaultValues={defaultValues}
      submitLabel={props.submitLabel}
      pendingLabel={props.pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={withOnClose(adapter, props.onClose)}
    />
  )
}


