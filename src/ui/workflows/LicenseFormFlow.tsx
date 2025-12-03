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

type LicenseFormFlowBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  tierOptions?: readonly UiSelectOption[]
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
  handler?: (payload: TPayload) => void,
) => ({
  mutateAsync: async (values: TPayload) => {
    const result = await adapter.mutateAsync(values)
    handler?.(values)
    return result
  },
  isPending: adapter.isPending,
})

export function LicenseFormFlow(props: LicenseFormFlowProps) {
  const createMutation = useCreateLicense(props.client)
  const updateMutation = useUpdateLicense(props.client)

  if (props.mode === 'create') {
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
        submitLabel={props.submitLabel}
        pendingLabel={props.pendingLabel}
        mutation={ensureAdapter(adaptMutation(createMutation), props.onClose)}
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

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={blueprint}
      defaultValues={defaultValues}
      submitLabel={props.submitLabel}
      pendingLabel={props.pendingLabel}
      mutation={ensureAdapter(adapter, props.onClose)}
    />
  )
}


