import type { Client, User } from '@simple-license/react-sdk'
import { useDeleteUser } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { adaptMutation } from '../actions/mutationAdapter'
import { createCrudActions } from '../actions/mutationActions'
import {
  UI_ENTITY_USER,
  UI_USER_ACTION_DELETE,
  UI_USER_ACTION_EDIT,
  UI_USER_BUTTON_DELETE,
} from '../constants'
import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'

type UserRowActionsProps = UiCommonProps & {
  client: Client
  user: User
  onEdit: (user: User) => void
  onCompleted?: () => void
  buttonLabel?: ReactNode
  allowUpdate?: boolean
  allowDelete?: boolean
}

export function UserRowActions({
  client,
  user,
  onEdit,
  onCompleted,
  buttonLabel,
  allowUpdate = true,
  allowDelete = true,
  ...rest
}: UserRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteUser(client))

  const actions = createCrudActions<string, unknown, User>(UI_ENTITY_USER, {
    update: allowUpdate
      ? {
          label: UI_USER_ACTION_EDIT,
          buildPayload: () => user,
          mutation: {
            mutateAsync: async () => user,
            isPending: false,
          },
          onSuccess: () => onEdit(user),
        }
      : undefined,
    delete: allowDelete
      ? {
          label: UI_USER_ACTION_DELETE,
          buildPayload: () => user.id,
          mutation: {
            mutateAsync: async (payload) => {
              const result = await deleteMutation.mutateAsync(payload)
              onCompleted?.()
              return result
            },
            isPending: deleteMutation.isPending,
          },
        }
      : undefined,
  })

  if (actions.length === 0) {
    return null
  }

  return (
    <ActionMenu
      {...rest}
      items={actions}
      buttonLabel={buttonLabel ?? UI_USER_BUTTON_DELETE}
    />
  )
}


