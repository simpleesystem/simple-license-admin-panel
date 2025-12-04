import type { Client, CreateTenantRequest, UpdateTenantRequest } from '@simple-license/react-sdk'
import { useCreateTenant, useUpdateTenant } from '@simple-license/react-sdk'
import type { FieldValues } from 'react-hook-form'
import type { ReactNode } from 'react'

import { UI_TENANT_FORM_SUBMIT_CREATE, UI_TENANT_FORM_SUBMIT_UPDATE } from '../constants'
import { createTenantBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type TenantFormBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  secondaryActions?: ReactNode
  onCompleted?: () => void
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
}

const baseUpdateDefaults: UpdateTenantRequest = {
  name: undefined,
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
        mutation={withOnClose(createMutation, props.onClose, props.onCompleted)}
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
      mutation={withOnClose(adapter, props.onClose, props.onCompleted)}
    />
  )
}


