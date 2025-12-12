import type { Client, Tenant, User } from '@simple-license/react-sdk'
import { useResumeTenant, useSuspendTenant } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'
import { canUpdateTenant } from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import { UI_TENANT_ACTION_EDIT, UI_TENANT_ACTION_RESUME, UI_TENANT_ACTION_SUSPEND } from '../constants'
import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'
import { notifyCrudError, notifyTenantSuccess } from './notifications'

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
  const notificationBus = useNotificationBus()
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
          try {
            const result = await suspendMutation.mutateAsync(payload)
            onCompleted?.()
            notifyTenantSuccess(notificationBus, 'suspend')
            return result
          } catch (error) {
            notifyCrudError(notificationBus)
            throw error
          }
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
          try {
            const result = await resumeMutation.mutateAsync(payload)
            onCompleted?.()
            notifyTenantSuccess(notificationBus, 'resume')
            return result
          } catch (error) {
            notifyCrudError(notificationBus)
            throw error
          }
        },
        isPending: resumeMutation.isPending,
      },
    },
  })

  return <ActionMenu {...rest} items={actions} buttonLabel={buttonLabel} />
}
