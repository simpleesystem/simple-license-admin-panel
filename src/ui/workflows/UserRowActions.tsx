import type { Client, User } from '@simple-license/react-sdk'
import { useDeleteUser } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'
import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type UserRowActionsProps = UiCommonProps & {
  client: Client
  user: User
  onEdit: (user: User) => void
  onCompleted?: () => void
  buttonLabel?: ReactNode
}

export function UserRowActions({ client, user, onEdit, onCompleted, buttonLabel, ...rest }: UserRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteUser(client))

  const actions = createCrudActions<string, unknown, User>('User', {
    update: {
      label: 'Edit User',
      buildPayload: () => user,
      mutation: {
        mutateAsync: async () => user,
        isPending: false,
      },
      onSuccess: () => onEdit(user),
    },
    delete: {
      label: 'Delete User',
      buildPayload: () => user.id,
      mutation: {
        mutateAsync: async (payload) => {
          const result = await deleteMutation.mutateAsync(payload)
          onCompleted?.()
          return result
        },
        isPending: deleteMutation.isPending,
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


