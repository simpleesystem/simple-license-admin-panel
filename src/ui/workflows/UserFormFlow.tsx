import type { Client, CreateUserRequest, UpdateUserRequest } from '@simple-license/react-sdk'
import { useCreateUser, useUpdateUser } from '@simple-license/react-sdk'
import type { FieldValues } from 'react-hook-form'
import type { ReactNode } from 'react'

import {
  UI_USER_FORM_SUBMIT_CREATE,
  UI_USER_FORM_SUBMIT_UPDATE,
} from '../constants'
import { createUserBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type UserFormBaseProps = {
  client: Client
  show: boolean
  onClose: () => void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  secondaryActions?: ReactNode
  onCompleted?: () => void
}

type UserFormCreateProps = UserFormBaseProps & {
  mode: 'create'
  defaultValues?: Partial<CreateUserRequest>
}

type UserFormUpdateProps = UserFormBaseProps & {
  mode: 'update'
  userId: string
  defaultValues?: Partial<UpdateUserRequest>
}

export type UserFormFlowProps = UserFormCreateProps | UserFormUpdateProps

const baseCreateDefaults: CreateUserRequest = {
  username: '',
  email: '',
  password: '',
  role: '',
  vendor_id: '',
}

const baseUpdateDefaults: UpdateUserRequest = {
  username: undefined,
  email: undefined,
  password: undefined,
  role: undefined,
  vendor_id: undefined,
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

export function UserFormFlow(props: UserFormFlowProps) {
  const createMutation = adaptMutation(useCreateUser(props.client))
  const updateMutation = useUpdateUser(props.client)

  if (props.mode === 'create') {
    const blueprint = createUserBlueprint('create')
    const defaultValues: CreateUserRequest = {
      ...baseCreateDefaults,
      ...props.defaultValues,
    }
    const submitLabel = props.submitLabel ?? UI_USER_FORM_SUBMIT_CREATE

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

  const defaultValues: UpdateUserRequest = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
  }
  const submitLabel = props.submitLabel ?? UI_USER_FORM_SUBMIT_UPDATE

  const adapter: MutationAdapter<UpdateUserRequest> = {
    mutateAsync: async (values) => {
      return await updateMutation.mutateAsync({
        id: props.userId,
        data: values,
      })
    },
    isPending: updateMutation.isPending,
  }

  return (
    <FormModalWithMutation
      show={props.show}
      onClose={props.onClose}
      blueprint={createUserBlueprint('update')}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={props.pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={withOnClose(adapter, props.onClose, props.onCompleted)}
    />
  )
}


