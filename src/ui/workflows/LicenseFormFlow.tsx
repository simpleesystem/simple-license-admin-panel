import type { Client, CreateLicenseRequest, UpdateLicenseRequest } from '@/simpleLicense'
import { useCreateLicense, useUpdateLicense } from '@/simpleLicense'
import type { ReactNode } from 'react'
import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_LICENSE_FORM_PENDING_CREATE,
  UI_LICENSE_FORM_PENDING_UPDATE,
  UI_LICENSE_FORM_SUBMIT_CREATE,
  UI_LICENSE_FORM_SUBMIT_UPDATE,
} from '../constants'
import type { FormBlueprint } from '../formBuilder/blueprint'
import { FormModalWithMutation } from '../formBuilder/FormModalWithMutation'
import { createLicenseBlueprint } from '../formBuilder/factories'
import type { UiSelectOption } from '../types'
import { wrapMutationAdapter } from './mutationHelpers'

type LicenseFormFlowBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel?: ReactNode
  pendingLabel?: ReactNode
  tierOptions?: readonly UiSelectOption[]
  licenseVendorId?: string | null
  onCompleted?: () => void
}

type LicenseFormCreateProps = LicenseFormFlowBaseProps & {
  mode: 'create'
  productOptions?: readonly UiSelectOption[]
  defaultValues?: Partial<CreateLicenseRequest>
}

type LicenseFormUpdateProps = LicenseFormFlowBaseProps & {
  mode: 'update'
  licenseKey: string
  defaultValues?: Partial<UpdateLicenseRequest>
}

export type LicenseFormFlowProps = LicenseFormCreateProps | LicenseFormUpdateProps

const baseCreateDefaults: CreateLicenseRequest = {
  customer_email: '',
  product_slug: '',
  tier_code: '',
  domain: '',
  activation_limit: undefined,
  expires_days: undefined,
  metadata: {},
}

const baseUpdateDefaults: UpdateLicenseRequest = {
  customer_email: undefined,
  tier_code: undefined,
  activation_limit: undefined,
  expires_days: undefined,
  metadata: undefined,
}

type FormValuesCreate = Omit<CreateLicenseRequest, 'metadata'> & { metadata: string }
type FormValuesUpdate = Omit<UpdateLicenseRequest, 'metadata'> & { metadata: string }

// Helper to convert empty strings to null/undefined
const sanitizeNumber = (value: number | string | null | undefined): number | undefined => {
  if (value === '' || value === null) {
    return undefined
  }
  if (value === undefined) {
    return undefined
  }
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}

export function LicenseFormFlow(props: LicenseFormFlowProps) {
  const createMutation = useCreateLicense(props.client)
  const updateMutation = useUpdateLicense(props.client)

  if (props.mode === 'create') {
    const submitLabel = props.submitLabel ?? UI_LICENSE_FORM_SUBMIT_CREATE
    const pendingLabel = props.pendingLabel ?? UI_LICENSE_FORM_PENDING_CREATE
    const blueprint = createLicenseBlueprint('create', {
      productOptions: props.productOptions,
      tierOptions: props.tierOptions,
    }) as unknown as FormBlueprint<FormValuesCreate>

    const metadataObj = props.defaultValues?.metadata ?? {}
    const metadataStr = Object.keys(metadataObj).length > 0 ? JSON.stringify(metadataObj, null, 2) : ''

    const defaultValues: FormValuesCreate = {
      ...baseCreateDefaults,
      ...props.defaultValues,
      metadata: metadataStr,
    }

    const adapter: MutationAdapter<FormValuesCreate> = {
      mutateAsync: async (values) => {
        console.log('LicenseFormFlow: Submitting with values:', values)
        let metadata = {}
        if (values.metadata && values.metadata.trim()) {
          try {
            metadata = JSON.parse(values.metadata.trim())
          } catch (e) {
            console.error('Failed to parse metadata JSON:', e, values.metadata)
            throw new Error('Invalid metadata JSON format')
          }
        }
        const data: CreateLicenseRequest = {
          ...values,
          activation_limit: sanitizeNumber(values.activation_limit),
          expires_days: sanitizeNumber(values.expires_days),
          metadata,
        }
        console.log('LicenseFormFlow: Calling createMutation with data:', data)
        try {
          const result = await createMutation.mutateAsync(data)
          console.log('LicenseFormFlow: Create mutation succeeded:', result)
          return result
        } catch (error) {
          console.error('LicenseFormFlow: Create mutation failed:', error)
          throw error
        }
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
        mutation={wrapMutationAdapter(adapter, {
          onClose: props.onClose,
          onCompleted: props.onCompleted,
          onSuccess: () => {
            // No custom action needed, completed covers refresh
          },
          onError: (error) => {
            console.error('License creation error:', error)
            // Error is logged, user will see toast notification from mutation
          },
        })}
      />
    )
  }

  const { licenseKey } = props
  const blueprint = createLicenseBlueprint('update', {
    tierOptions: props.tierOptions,
  }) as unknown as FormBlueprint<FormValuesUpdate>

  const defaultValues: FormValuesUpdate = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
    metadata: props.defaultValues?.metadata ? JSON.stringify(props.defaultValues.metadata, null, 2) : '',
  }

  const adapter: MutationAdapter<FormValuesUpdate> = {
    mutateAsync: async (values) => {
      const data: UpdateLicenseRequest = {
        ...values,
        activation_limit: sanitizeNumber(values.activation_limit),
        expires_days: sanitizeNumber(values.expires_days),
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      }
      return await updateMutation.mutateAsync({
        id: licenseKey,
        data,
      })
    },
    isPending: updateMutation.isPending,
  }

  const submitLabel = props.submitLabel ?? UI_LICENSE_FORM_SUBMIT_UPDATE
  const pendingLabel = props.pendingLabel ?? UI_LICENSE_FORM_PENDING_UPDATE

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={blueprint}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={pendingLabel}
      mutation={wrapMutationAdapter(adapter, {
        onClose: props.onClose,
        onCompleted: props.onCompleted,
        onSuccess: () => {
          // No custom action needed, completed covers refresh
        },
        onError: () => {
          // Optional: Handle error globally or locally
        },
      })}
    />
  )
}
