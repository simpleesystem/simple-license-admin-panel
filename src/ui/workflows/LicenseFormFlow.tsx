import type {
  Client,
  CreateLicenseRequest,
  UpdateLicenseRequest,
} from '@simple-license/react-sdk'
import {
  useCreateLicense,
  useUpdateLicense,
} from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import type { UiSelectOption } from '../types'
import { FormModalWithMutation } from '../formBuilder/FormModalWithMutation'
import { createLicenseBlueprint } from '../formBuilder/factories'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_LICENSE_FORM_PENDING_CREATE,
  UI_LICENSE_FORM_PENDING_UPDATE,
  UI_LICENSE_FORM_SUBMIT_CREATE,
  UI_LICENSE_FORM_SUBMIT_UPDATE,
} from '../constants'

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
  licenseId: string
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

const ensureAdapter = <TPayload,>(
  adapter: MutationAdapter<TPayload>,
  handlers?: {
    onSuccess?: (payload: TPayload) => void
  },
) => ({
  mutateAsync: async (values: TPayload) => {
    const result = await adapter.mutateAsync(values)
    handlers?.onSuccess?.(values)
    return result
  },
  isPending: adapter.isPending,
})

export function LicenseFormFlow(props: LicenseFormFlowProps) {
  const createMutation = useCreateLicense(props.client)
  const updateMutation = useUpdateLicense(props.client)

  if (props.mode === 'create') {
    const submitLabel = props.submitLabel ?? UI_LICENSE_FORM_SUBMIT_CREATE
    const pendingLabel = props.pendingLabel ?? UI_LICENSE_FORM_PENDING_CREATE
    const blueprint = createLicenseBlueprint('create', {
      productOptions: props.productOptions,
      tierOptions: props.tierOptions,
    })
    const defaultValues = {
      ...baseCreateDefaults,
      ...props.defaultValues,
    }

    return (
      <FormModalWithMutation
        show={props.show}
        onClose={props.onClose}
        blueprint={blueprint}
        defaultValues={defaultValues}
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
        mutation={ensureAdapter(adaptMutation(createMutation), {
          onSuccess: () => {
            props.onCompleted?.()
            props.onClose()
          },
        })}
      />
    )
  }

  const { licenseId } = props
  const blueprint = createLicenseBlueprint('update', {
    tierOptions: props.tierOptions,
  })
  const defaultValues = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
  }

  const adapter: MutationAdapter<UpdateLicenseRequest> = {
    mutateAsync: async (values) => {
      return await updateMutation.mutateAsync({
        id: licenseId,
        data: values,
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
      mutation={ensureAdapter(adapter, {
        onSuccess: () => {
          props.onCompleted?.()
          props.onClose()
        },
      })}
    />
  )
}


