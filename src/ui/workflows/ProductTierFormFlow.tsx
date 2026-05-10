import { type ReactNode, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { Client, CreateProductTierRequest, UpdateProductTierRequest } from '@/simpleLicense'
import { ApiException, useCreateProductTier, useUpdateProductTier } from '@/simpleLicense'

import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_PRODUCT_TIER_ERROR_INVALID_METADATA,
  UI_PRODUCT_TIER_FIELD_LICENSE_TERM_DISABLED_DESCRIPTION,
  UI_PRODUCT_TIER_FIELD_MAX_ACTIVATIONS_DESCRIPTION,
  UI_PRODUCT_TIER_FIELD_UNLIMITED_ACTIVATIONS_DESCRIPTION,
  UI_PRODUCT_TIER_FIELD_UNLIMITED_ACTIVATIONS_LABEL,
  UI_PRODUCT_TIER_FORM_PENDING_CREATE,
  UI_PRODUCT_TIER_FORM_PENDING_UPDATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_CREATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE,
} from '../constants'
import type { FormFieldBlueprint, TextFieldBlueprint } from '../formBuilder/blueprint'
import { createProductTierBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import { CheckboxField } from '../forms/CheckboxField'
import { TextField } from '../forms/TextField'
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

type ProductTierFormValues = Omit<CreateProductTierRequest, 'metadata'> & {
  metadata?: string
  unlimited_activations?: boolean
}

const baseCreateDefaults: ProductTierFormValues = {
  tier_name: '',
  tier_code: '',
  description: '',
  max_activations: undefined,
  does_not_expire: false,
  license_term_days: undefined,
  metadata: '',
  unlimited_activations: false,
}

const baseUpdateDefaults: Partial<ProductTierFormValues> = {
  tier_name: undefined,
  tier_code: undefined,
  description: undefined,
  metadata: '',
  unlimited_activations: false,
}

// Helper to convert empty strings to null/undefined
const sanitizeNumber = (value: number | string | null | undefined): number | null | undefined => {
  if (value === '' || value === null) {
    return null // Explicitly return null for backend to handle as nullable
  }
  if (value === undefined) {
    return undefined
  }
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}

const normalizeTierCode = (tierCode: string | undefined): string => {
  if (!tierCode) {
    return ''
  }

  return tierCode
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
}

const parseMetadata = (
  metadataValue: string | undefined
): Record<string, string | number | boolean | null> | undefined => {
  const metadataStr = metadataValue?.trim()
  if (!metadataStr) {
    return undefined
  }

  try {
    const parsed = JSON.parse(metadataStr)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, string | number | boolean | null>
    }
    throw new ApiException(UI_PRODUCT_TIER_ERROR_INVALID_METADATA)
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }
    throw new ApiException(UI_PRODUCT_TIER_ERROR_INVALID_METADATA)
  }
}

export function ProductTierFormFlow(props: ProductTierFormFlowProps) {
  if (props.mode === 'create') {
    return <ProductTierCreateFlow {...props} />
  }

  return <ProductTierUpdateFlow {...props} />
}

const toUnlimitedActivationsFlag = (value: number | null | undefined) => value === null || value === undefined

const renderProductTierFieldOverride = (field: FormFieldBlueprint<ProductTierFormValues>) => {
  if (field.name === 'max_activations' && field.component === 'text') {
    return <MaxActivationsField field={field} />
  }

  if (field.name === 'license_term_days' && field.component === 'text') {
    return <LicenseTermField field={field} />
  }

  return undefined
}

function MaxActivationsField({ field }: { field: TextFieldBlueprint<ProductTierFormValues> }) {
  const { control, setValue } = useFormContext<ProductTierFormValues>()
  const isUnlimited = useWatch({
    control,
    name: 'unlimited_activations',
  })

  useEffect(() => {
    if (isUnlimited) {
      setValue('max_activations', null, { shouldDirty: true })
    }
  }, [isUnlimited, setValue])

  return (
    <>
      <TextField<ProductTierFormValues>
        name={field.name}
        label={field.label}
        description={field.description ?? UI_PRODUCT_TIER_FIELD_MAX_ACTIVATIONS_DESCRIPTION}
        disabled={Boolean(isUnlimited || field.disabled)}
        required={field.required}
        type={field.inputType}
        placeholder={field.placeholder}
        autoComplete={field.autoComplete}
      />
      <CheckboxField<ProductTierFormValues>
        name="unlimited_activations"
        label={UI_PRODUCT_TIER_FIELD_UNLIMITED_ACTIVATIONS_LABEL}
        description={UI_PRODUCT_TIER_FIELD_UNLIMITED_ACTIVATIONS_DESCRIPTION}
      />
    </>
  )
}

function LicenseTermField({ field }: { field: TextFieldBlueprint<ProductTierFormValues> }) {
  const { control, setValue } = useFormContext<ProductTierFormValues>()
  const doesNotExpire = useWatch({
    control,
    name: 'does_not_expire',
  })

  useEffect(() => {
    if (doesNotExpire) {
      setValue('license_term_days', null, { shouldDirty: true })
    }
  }, [doesNotExpire, setValue])

  return (
    <TextField<ProductTierFormValues>
      name={field.name}
      label={field.label}
      description={doesNotExpire ? UI_PRODUCT_TIER_FIELD_LICENSE_TERM_DISABLED_DESCRIPTION : field.description}
      disabled={Boolean(doesNotExpire || field.disabled)}
      required={field.required}
      type={field.inputType}
      placeholder={field.placeholder}
      autoComplete={field.autoComplete}
    />
  )
}

function ProductTierCreateFlow(props: ProductTierCreateProps) {
  const createMutation = useCreateProductTier(props.client, props.productId)

  const defaultValues: ProductTierFormValues = {
    ...baseCreateDefaults,
    ...props.defaultValues,
    metadata: props.defaultValues?.metadata ? JSON.stringify(props.defaultValues.metadata, null, 2) : '',
    unlimited_activations: toUnlimitedActivationsFlag(props.defaultValues?.max_activations),
  }

  const submitLabel = props.submitLabel ?? UI_PRODUCT_TIER_FORM_SUBMIT_CREATE
  const pendingLabel = props.pendingLabel ?? UI_PRODUCT_TIER_FORM_PENDING_CREATE

  const adapter: MutationAdapter<ProductTierFormValues> = {
    mutateAsync: async (values) => {
      const { metadata: _metadata, unlimited_activations, ...baseValues } = values
      const normalizedTierCode = normalizeTierCode(values.tier_code)
      const metadata = parseMetadata(values.metadata)
      const data: CreateProductTierRequest = {
        ...baseValues,
        tier_code: normalizedTierCode,
        max_activations: unlimited_activations ? null : sanitizeNumber(values.max_activations),
        license_term_days: values.does_not_expire ? null : sanitizeNumber(values.license_term_days),
        metadata,
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
      renderFieldOverride={renderProductTierFieldOverride}
      secondaryActions={props.secondaryActions}
      mutation={wrapMutationAdapter(adapter, {
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
    unlimited_activations: toUnlimitedActivationsFlag(props.defaultValues?.max_activations),
  }

  const submitLabel = props.submitLabel ?? UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE
  const pendingLabel = props.pendingLabel ?? UI_PRODUCT_TIER_FORM_PENDING_UPDATE

  const adapter: MutationAdapter<ProductTierFormValues> = {
    mutateAsync: async (values) => {
      const { metadata: _metadata, unlimited_activations, ...baseValues } = values
      const normalizedTierCode = normalizeTierCode(values.tier_code)
      const metadata = parseMetadata(values.metadata)
      const data: UpdateProductTierRequest = {
        ...baseValues,
        tier_code: normalizedTierCode,
        max_activations: unlimited_activations ? null : sanitizeNumber(values.max_activations),
        license_term_days: values.does_not_expire ? null : sanitizeNumber(values.license_term_days),
        metadata,
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
      renderFieldOverride={renderProductTierFieldOverride}
      secondaryActions={props.secondaryActions}
      mutation={wrapMutationAdapter(adapter, {
        onCompleted: props.onCompleted,
        onSuccess: props.onSuccess,
        onError: props.onError,
      })}
    />
  )
}
