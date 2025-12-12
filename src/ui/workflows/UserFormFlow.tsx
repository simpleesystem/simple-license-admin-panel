import type { Client, CreateUserRequest, UpdateUserRequest } from '@simple-license/react-sdk'
import { useAdminTenants, useCreateUser, useUpdateUser } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_USER_FORM_SUBMIT_CREATE,
  UI_USER_FORM_SUBMIT_UPDATE,
  UI_USER_ROLE_ADMIN,
  UI_USER_ROLE_API_CONSUMER_ACTIVATE,
  UI_USER_ROLE_API_READ_ONLY,
  UI_USER_ROLE_API_VENDOR_WRITE,
  UI_USER_ROLE_LABEL_ADMIN,
  UI_USER_ROLE_LABEL_API_CONSUMER_ACTIVATE,
  UI_USER_ROLE_LABEL_API_READ_ONLY,
  UI_USER_ROLE_LABEL_API_VENDOR_WRITE,
  UI_USER_ROLE_LABEL_SUPERUSER,
  UI_USER_ROLE_LABEL_VENDOR_ADMIN,
  UI_USER_ROLE_LABEL_VENDOR_MANAGER,
  UI_USER_ROLE_LABEL_VIEWER,
  UI_USER_ROLE_SUPERUSER,
  UI_USER_ROLE_VENDOR_ADMIN,
  UI_USER_ROLE_VENDOR_MANAGER,
  UI_USER_ROLE_VIEWER,
  UI_USER_STATUS_ACTIVE,
  UI_USER_STATUS_DELETED,
  UI_USER_STATUS_DISABLED,
  UI_USER_STATUS_LABEL_ACTIVE,
  UI_USER_STATUS_LABEL_DELETED,
  UI_USER_STATUS_LABEL_DISABLED,
} from '../constants'
import { createUserBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'
import type { UiSelectOption } from '../types'

type UserFormBaseProps = {
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
  onSuccess?: () => void,
  onError?: (error: unknown) => void
): MutationAdapter<TFieldValues> => ({
  mutateAsync: async (values) => {
    try {
      const result = await adapter.mutateAsync(values)
      onSuccess?.()
      onCompleted?.()
      onClose()
      return result
    } catch (error) {
      onError?.(error)
      throw error
    }
  },
  isPending: adapter.isPending,
})

export function UserFormFlow(props: UserFormFlowProps) {
  const createMutation = adaptMutation(useCreateUser(props.client))
  const updateMutation = useUpdateUser(props.client)
  const tenantsQuery = useAdminTenants(props.client)

  const roleOptions: UiSelectOption[] = useMemo(
    () => [
      { value: UI_USER_ROLE_SUPERUSER, label: UI_USER_ROLE_LABEL_SUPERUSER },
      { value: UI_USER_ROLE_ADMIN, label: UI_USER_ROLE_LABEL_ADMIN },
      { value: UI_USER_ROLE_VENDOR_MANAGER, label: UI_USER_ROLE_LABEL_VENDOR_MANAGER },
      { value: UI_USER_ROLE_VENDOR_ADMIN, label: UI_USER_ROLE_LABEL_VENDOR_ADMIN },
      { value: UI_USER_ROLE_VIEWER, label: UI_USER_ROLE_LABEL_VIEWER },
      { value: UI_USER_ROLE_API_READ_ONLY, label: UI_USER_ROLE_LABEL_API_READ_ONLY },
      { value: UI_USER_ROLE_API_VENDOR_WRITE, label: UI_USER_ROLE_LABEL_API_VENDOR_WRITE },
      { value: UI_USER_ROLE_API_CONSUMER_ACTIVATE, label: UI_USER_ROLE_LABEL_API_CONSUMER_ACTIVATE },
    ],
    []
  )

  const statusOptions: UiSelectOption[] = useMemo(
    () => [
      { value: UI_USER_STATUS_ACTIVE, label: UI_USER_STATUS_LABEL_ACTIVE },
      { value: UI_USER_STATUS_DISABLED, label: UI_USER_STATUS_LABEL_DISABLED },
      { value: UI_USER_STATUS_DELETED, label: UI_USER_STATUS_LABEL_DELETED, disabled: true },
    ],
    []
  )

  const vendorOptions: UiSelectOption[] = useMemo(() => {
    const tenants = Array.isArray(tenantsQuery.data) ? tenantsQuery.data : (tenantsQuery.data?.data ?? [])
    return tenants.map((tenant) => ({
      value: String(tenant.id),
      label: tenant.name,
    }))
  }, [tenantsQuery.data])

  if (props.mode === 'create') {
    const blueprint = createUserBlueprint('create', { roleOptions, vendorOptions, statusOptions })
    const defaultValues: CreateUserRequest = {
      ...baseCreateDefaults,
      ...props.defaultValues,
      status: UI_USER_STATUS_ACTIVE,
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
        mutation={withOnClose(createMutation, props.onClose, props.onCompleted, props.onSuccess, props.onError)}
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
      blueprint={createUserBlueprint('update', { roleOptions, vendorOptions, statusOptions })}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      pendingLabel={props.pendingLabel}
      secondaryActions={props.secondaryActions}
      mutation={withOnClose(adapter, props.onClose, props.onCompleted, props.onSuccess, props.onError)}
    />
  )
}
