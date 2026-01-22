import type { Client, CreateProductRequest, UpdateProductRequest, User } from '@/simpleLicense'
import { useCreateProduct, useUpdateProduct } from '@/simpleLicense'
import type { ReactNode } from 'react'

import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_FORM_SELECT_PLACEHOLDER_VALUE,
  UI_PRODUCT_FORM_PENDING_CREATE,
  UI_PRODUCT_FORM_PENDING_UPDATE,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
} from '../constants'
import type { UiSelectOption } from '../types'
import type { FormBlueprint } from '../formBuilder/blueprint'
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
  vendorOptions?: readonly UiSelectOption[]
  currentUser?: User
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
  vendor_id: UI_FORM_SELECT_PLACEHOLDER_VALUE,
  metadata: {},
}

const baseUpdateDefaults: UpdateProductRequest = {
  name: undefined,
  slug: undefined,
  description: undefined,
  metadata: undefined,
}

type FormValuesCreate = Omit<CreateProductRequest, 'metadata'> & { metadata: string }
type FormValuesUpdate = Omit<UpdateProductRequest, 'metadata'> & { metadata: string }

// Helper to convert empty strings to null/undefined
const sanitizeNumber = (value: number | string | null | undefined): number | null | undefined => {
  if (value === '' || value === null) return null // Explicitly return null for backend to handle as nullable
  if (value === undefined) return undefined
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}

const sanitizeSelectValue = (value: string | undefined): string | undefined => {
  if (!value || value === UI_FORM_SELECT_PLACEHOLDER_VALUE) {
    return undefined
  }
  return value
}

export function ProductFormFlow(props: ProductFormFlowProps) {
  const createMutation = adaptMutation(useCreateProduct(props.client))
  const updateMutation = useUpdateProduct(props.client)

  if (props.mode === 'create') {
    const blueprint = createProductBlueprint('create', {
      vendorOptions: props.vendorOptions,
      currentUser: props.currentUser,
    }) as unknown as FormBlueprint<FormValuesCreate>
    const defaultValues: FormValuesCreate = {
      ...baseCreateDefaults,
      ...props.defaultValues,
      metadata: JSON.stringify(props.defaultValues?.metadata ?? {}, null, 2),
    }
    const submitLabel = props.submitLabel ?? UI_PRODUCT_FORM_SUBMIT_CREATE
    const pendingLabel = props.pendingLabel ?? UI_PRODUCT_FORM_PENDING_CREATE

    const adapter: MutationAdapter<FormValuesCreate> = {
      mutateAsync: async (values) => {
        const metadata = values.metadata ? JSON.parse(values.metadata) : {}
        const data: CreateProductRequest = {
          ...values,
          default_license_term_days: sanitizeNumber(values.default_license_term_days),
          default_max_activations: sanitizeNumber(values.default_max_activations),
          vendor_id: sanitizeSelectValue(values.vendor_id),
          metadata,
        }
        return createMutation.mutateAsync(data)
      },
      isPending: createMutation.isPending,
    }

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

  const defaultValues: FormValuesUpdate = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
    metadata: props.defaultValues?.metadata ? JSON.stringify(props.defaultValues.metadata, null, 2) : '',
    vendor_id: props.defaultValues?.vendor_id ?? UI_FORM_SELECT_PLACEHOLDER_VALUE,
  }
  const submitLabel = props.submitLabel ?? UI_PRODUCT_FORM_SUBMIT_UPDATE
  const pendingLabel = props.pendingLabel ?? UI_PRODUCT_FORM_PENDING_UPDATE

  const blueprint = createProductBlueprint('update', {
    vendorOptions: props.vendorOptions,
    currentUser: props.currentUser,
  }) as unknown as FormBlueprint<FormValuesUpdate>

  const adapter: MutationAdapter<FormValuesUpdate> = {
    mutateAsync: async (values) => {
      const data: UpdateProductRequest = {
        ...values,
        default_license_term_days: sanitizeNumber(values.default_license_term_days),
        default_max_activations: sanitizeNumber(values.default_max_activations),
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      }
      const result = await updateMutation.mutateAsync({ id: props.productId, data })
      return result
    },
    isPending: updateMutation.isPending,
  }

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
