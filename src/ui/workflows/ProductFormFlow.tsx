import type { Client, CreateProductRequest, UpdateProductRequest } from '@simple-license/react-sdk'
import { useCreateProduct, useUpdateProduct } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_PRODUCT_FORM_PENDING_CREATE,
  UI_PRODUCT_FORM_PENDING_UPDATE,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
} from '../constants'
import { createProductBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import { wrapMutationAdapter } from './mutationHelpers'

type ProductFormBaseProps = {
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

export function ProductFormFlow(props: ProductFormFlowProps) {
  const createMutation = adaptMutation(useCreateProduct(props.client))
  const updateMutation = useUpdateProduct(props.client)

  if (props.mode === 'create') {
    const blueprint = createProductBlueprint('create')
    const defaultValues: CreateProductRequest = {
      ...baseCreateDefaults,
      ...props.defaultValues,
    }
    const submitLabel = props.submitLabel ?? UI_PRODUCT_FORM_SUBMIT_CREATE
    const pendingLabel = props.pendingLabel ?? UI_PRODUCT_FORM_PENDING_CREATE

    return (
      <FormModalWithMutation
        show={props.show}
        onClose={props.onClose}
        blueprint={blueprint}
        defaultValues={defaultValues}
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
        secondaryActions={props.secondaryActions}
        mutation={wrapMutationAdapter(createMutation, {
          onClose: props.onClose,
          onCompleted: props.onCompleted,
          onSuccess: props.onSuccess,
          onError: props.onError,
        })}
      />
    )
  }

  const defaultValues: UpdateProductRequest = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
  }
  const submitLabel = props.submitLabel ?? UI_PRODUCT_FORM_SUBMIT_UPDATE
  const pendingLabel = props.pendingLabel ?? UI_PRODUCT_FORM_PENDING_UPDATE
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
