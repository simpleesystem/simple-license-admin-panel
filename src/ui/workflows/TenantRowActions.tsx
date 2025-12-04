import type { Client, Tenant, User } from '@simple-license/react-sdk'
import { useResumeTenant, useSuspendTenant } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { adaptMutation } from '../actions/mutationAdapter'
import { createCrudActions } from '../actions/mutationActions'
import {
  UI_TENANT_ACTION_EDIT,
  UI_TENANT_ACTION_RESUME,
  UI_TENANT_ACTION_SUSPEND,
} from '../constants'
import { ActionMenu } from '../data/ActionMenu'
import { canUpdateTenant } from '../../app/auth/permissions'
import type { UiCommonProps } from '../types'

type TenantRowActionsProps = UiCommonProps & {
  client: Client
  tenant: Tenant
  onEdit: (tenant: Tenant) => void
  onCompleted?: () => void
  buttonLabel?: ReactNode
  currentUser?: User | null
}

export function TenantRowActions({
  client,
  tenant,
  onEdit,
  onCompleted,
  buttonLabel,
  currentUser,
  ...rest
}: TenantRowActionsProps) {
  const suspendMutation = adaptMutation(useSuspendTenant(client))
  const resumeMutation = adaptMutation(useResumeTenant(client))
  const allowUpdate = canUpdateTenant(currentUser, tenant)

  if (!allowUpdate) {
    return null
  }

  const actions = createCrudActions<string, unknown, Tenant>('Tenant', {
    update: {
      label: UI_TENANT_ACTION_EDIT,
      buildPayload: () => tenant,
      mutation: {
        mutateAsync: async () => tenant,
        isPending: false,
      },
      onSuccess: () => onEdit(tenant),
    },
    suspend: {
      label: UI_TENANT_ACTION_SUSPEND,
      buildPayload: () => tenant.id,
      disabled: tenant.status === 'SUSPENDED',
      mutation: {
        mutateAsync: async (payload) => {
          const result = await suspendMutation.mutateAsync(payload)
          onCompleted?.()
          return result
        },
        isPending: suspendMutation.isPending,
      },
    },
    resume: {
      label: UI_TENANT_ACTION_RESUME,
      buildPayload: () => tenant.id,
      disabled: tenant.status !== 'SUSPENDED',
      mutation: {
        mutateAsync: async (payload) => {
          const result = await resumeMutation.mutateAsync(payload)
          onCompleted?.()
          return result
        },
        isPending: resumeMutation.isPending,
      },
    },
  })

  return (
    <ActionMenu
      {...rest}
      items={actions}
      buttonLabel={buttonLabel}
    />
  )
}


