import type { Client, CreateUserRequest, UpdateUserRequest } from '@simple-license/react-sdk'
import { useAdminTenants, useCreateUser, useUpdateUser } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
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
  UI_USER_ROLE_LABEL_VENDOR_ADMIN,
  UI_USER_ROLE_LABEL_VENDOR_MANAGER,
  UI_USER_ROLE_LABEL_VIEWER,
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
import { wrapMutationAdapter } from './mutationHelpers'

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

export function UserFormFlow(props: UserFormFlowProps) {
  const { user: currentUser } = useAuth()
  const createMutation = adaptMutation(useCreateUser(props.client))
  const updateMutation = useUpdateUser(props.client)
  const tenantsQuery = useAdminTenants(props.client)
  // Treat vendor manager as scoped even if vendorId is missing
  const vendorScoped = currentUser?.role === UI_USER_ROLE_VENDOR_MANAGER || isVendorScopedUser(currentUser)

  const roleOptions: UiSelectOption[] = useMemo(() => {
    const allRoles = [
      { value: UI_USER_ROLE_ADMIN, label: UI_USER_ROLE_LABEL_ADMIN },
      { value: UI_USER_ROLE_VENDOR_MANAGER, label: UI_USER_ROLE_LABEL_VENDOR_MANAGER },
      { value: UI_USER_ROLE_VENDOR_ADMIN, label: UI_USER_ROLE_LABEL_VENDOR_ADMIN },
      { value: UI_USER_ROLE_VIEWER, label: UI_USER_ROLE_LABEL_VIEWER },
      { value: UI_USER_ROLE_API_READ_ONLY, label: UI_USER_ROLE_LABEL_API_READ_ONLY },
      { value: UI_USER_ROLE_API_VENDOR_WRITE, label: UI_USER_ROLE_LABEL_API_VENDOR_WRITE },
      { value: UI_USER_ROLE_API_CONSUMER_ACTIVATE, label: UI_USER_ROLE_LABEL_API_CONSUMER_ACTIVATE },
    ]

    return allRoles.filter((option) => {
      // Superuser can see all roles (except Superuser which is already excluded)
      // Admin cannot assign Admin
      if (currentUser?.role === UI_USER_ROLE_ADMIN) {
        if (option.value === UI_USER_ROLE_ADMIN) {
          return false
        }
      }

      // Vendor Manager cannot assign Admin or Vendor Manager
      if (currentUser?.role === UI_USER_ROLE_VENDOR_MANAGER) {
        if (option.value === UI_USER_ROLE_ADMIN) {
          return false
        }
        if (option.value === UI_USER_ROLE_VENDOR_MANAGER) {
          return false
        }
      }

      return true
    })
  }, [currentUser?.role])

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

  const removeVendorField = (
    sections: ReadonlyArray<{ fields: ReadonlyArray<{ name: string }> }>
  ): Array<{ fields: Array<{ name: string }> }> =>
    sections.map((section) => ({
      ...section,
      fields: section.fields.filter((field) => field.name !== 'vendor_id'),
    }))

  const buildBlueprint = <TMode extends 'create' | 'update'>(
    mode: TMode,
    options: Parameters<typeof createUserBlueprint<TMode>>[1]
  ) => {
    if (!vendorScoped) {
      return createUserBlueprint(mode, options)
    }
    const customize = (blueprint: ReturnType<typeof createUserBlueprint<TMode>>) => ({
      ...blueprint,
      sections: removeVendorField(blueprint.sections) as any,
    })
    return createUserBlueprint(mode, { ...options, customize })
  }

  if (props.mode === 'create') {
    const blueprint = buildBlueprint('create', {
      roleOptions,
      vendorOptions: vendorScoped ? [] : vendorOptions,
      statusOptions,
    })
    const defaultValues: CreateUserRequest = {
      ...baseCreateDefaults,
      ...props.defaultValues,
      // status: UI_USER_STATUS_ACTIVE, // Not supported in CreateUserRequest yet?
      vendor_id:
        currentUser?.vendorId !== undefined && currentUser?.vendorId !== null
          ? currentUser.vendorId
          : vendorScoped
            ? ''
            : (props.defaultValues?.vendor_id ?? ''),
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
        mutation={wrapMutationAdapter(createMutation, {
          onClose: props.onClose,
          onCompleted: props.onCompleted,
          onSuccess: props.onSuccess,
          onError: props.onError,
        })}
      />
    )
  }

  const defaultValues: UpdateUserRequest = {
    ...baseUpdateDefaults,
    ...props.defaultValues,
    vendor_id:
      currentUser?.vendorId !== undefined && currentUser?.vendorId !== null
        ? currentUser.vendorId
        : vendorScoped
          ? ''
          : props.defaultValues?.vendor_id,
  }
  const submitLabel = props.submitLabel ?? UI_USER_FORM_SUBMIT_UPDATE

  const adapter: MutationAdapter<UpdateUserRequest> = {
    mutateAsync: async (values) => {
      if (vendorScoped) {
        values.vendor_id =
          currentUser?.vendorId !== undefined && currentUser?.vendorId !== null
            ? currentUser.vendorId
            : (values.vendor_id ?? '')
      }
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
      blueprint={buildBlueprint('update', {
        roleOptions,
        vendorOptions: vendorScoped ? [] : vendorOptions,
        statusOptions,
      })}
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
