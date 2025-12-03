import type { Client, Tenant } from '@simple-license/react-sdk'
import { useResumeTenant, useSuspendTenant } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'
import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type TenantRowActionsProps = UiCommonProps & {
  client: Client
  tenant: Tenant
  onEdit: (tenant: Tenant) => void
  onCompleted?: () => void
  buttonLabel?: ReactNode
}

export function TenantRowActions({ client, tenant, onEdit, onCompleted, buttonLabel, ...rest }: TenantRowActionsProps) {
  const suspendMutation = adaptMutation(useSuspendTenant(client))
  const resumeMutation = adaptMutation(useResumeTenant(client))

  const actions = createCrudActions<string, unknown, Tenant>('Tenant', {
    update: {
      label: 'Edit Tenant',
      buildPayload: () => tenant,
      mutation: {
        mutateAsync: async () => tenant,
        isPending: false,
      },
      onSuccess: () => onEdit(tenant),
    },
    suspend: {
      label: 'Suspend Tenant',
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
      label: 'Resume Tenant',
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


