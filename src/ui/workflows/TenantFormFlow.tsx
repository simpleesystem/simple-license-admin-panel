import type { ReactNode } from 'react'
import type { Client, CreateTenantRequest, UpdateTenantRequest } from '@/simpleLicense'
import { useCreateTenant, useUpdateTenant } from '@/simpleLicense'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import { UI_TENANT_FORM_SUBMIT_CREATE, UI_TENANT_FORM_SUBMIT_UPDATE, UI_TENANT_STATUS_ACTIVE } from '../constants'
import { createTenantBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import { wrapMutationAdapter } from './mutationHelpers'

type TenantFormBaseProps = {
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

type TenantFormCreateProps = TenantFormBaseProps & {
  mode: 'create'
  defaultValues?: Partial<CreateTenantRequest>
}

type TenantFormUpdateProps = TenantFormBaseProps & {
  mode: 'update'
  tenantId: string
  defaultValues?: Partial<UpdateTenantRequest>
}

export type TenantFormFlowProps = TenantFormCreateProps | TenantFormUpdateProps

const baseCreateDefaults: CreateTenantRequest = {
  name: '',
  status: UI_TENANT_STATUS_ACTIVE,
}

const baseUpdateDefaults: UpdateTenantRequest = {
  name: undefined,
}

export function TenantFormFlow(props: TenantFormFlowProps) {
  const createMutation = adaptMutation(useCreateTenant(props.client))
  const updateMutation = useUpdateTenant(props.client)

  if (props.mode === 'create') {
    const blueprint = createTenantBlueprint('create')
    const defaultValues: CreateTenantRequest = {
      ...baseCreateDefaults,
      ...props.defaultValues,
    }
    const submitLabel = props.submitLabel ?? UI_TENANT_FORM_SUBMIT_CREATE

    return (
      <FormModalWithMutation
        show={props.show}
        onClose={props.onClose}
        blueprint={blueprint}
        defaultValues={defaultValues}
        submitLabel={submitLabel}
        pendingLabel={props.pendingLabel}
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

  const defaultValues: UpdateTenantRequest = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
  }
  const submitLabel = props.submitLabel ?? UI_TENANT_FORM_SUBMIT_UPDATE

  const adapter: MutationAdapter<UpdateTenantRequest> = {
    mutateAsync: async (values) => {
      return await updateMutation.mutateAsync({
        id: props.tenantId,
        data: values,
      })
    },
    isPending: updateMutation.isPending,
  }

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={createTenantBlueprint('update')}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={props.pendingLabel}
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
