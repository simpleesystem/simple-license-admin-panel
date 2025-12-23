import type { Client, User } from '@/simpleLicense'
import { useDeleteUser } from '@/simpleLicense'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_USER_ACTION_DELETE,
  UI_USER_ACTION_EDIT,
  UI_USER_BUTTON_DELETE,
  UI_USER_CONFIRM_DELETE_BODY,
  UI_USER_CONFIRM_DELETE_CANCEL,
  UI_USER_CONFIRM_DELETE_CONFIRM,
  UI_USER_CONFIRM_DELETE_TITLE,
  UI_USER_STATUS_DELETED,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'
import { notifyCrudError, notifyUserSuccess } from './notifications'

type UserRowActionsProps = UiCommonProps & {
  client: Client
  user: User
  onEdit: (user: User) => void
  onCompleted?: () => void
  allowUpdate?: boolean
  allowDelete?: boolean
  currentUserId?: string
}

export function UserRowActions({
  client,
  user,
  onEdit,
  onCompleted,
  allowUpdate = true,
  allowDelete = true,
  currentUserId,
  ...rest
}: UserRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteUser(client))
  const notificationBus = useNotificationBus()
  const [showConfirm, setShowConfirm] = useState(false)

  const isSelf = currentUserId === user.id
  const isDeleted = (user as unknown as { status: string }).status === UI_USER_STATUS_DELETED
  const canEdit = allowUpdate && !isSelf
  const canDelete = allowDelete && !isSelf && !isDeleted
  const showDeleteButton = allowDelete && !isSelf

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(user.id)
      notifyUserSuccess(notificationBus, 'delete')
      onCompleted?.()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    } finally {
      setShowConfirm(false)
    }
  }

  if (!canEdit && !canDelete) {
    return null
  }

  return (
    <VisibilityGate
      ability={rest.ability}
      permissionKey={rest.permissionKey}
      permissionFallback={rest.permissionFallback}
    >
      <Stack direction="row" gap="small" {...rest}>
        {canEdit ? (
          <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => onEdit(user)} aria-label={UI_USER_ACTION_EDIT}>
            {UI_USER_ACTION_EDIT}
          </Button>
        ) : null}
        {showDeleteButton ? (
          <>
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => {
                if (isDeleted) {
                  return
                }
                setShowConfirm(true)
              }}
              disabled={deleteMutation.isPending || isDeleted}
              aria-label={UI_USER_ACTION_DELETE}
            >
              {UI_USER_BUTTON_DELETE}
            </Button>
            <ModalDialog
              show={showConfirm}
              onClose={() => setShowConfirm(false)}
              title={UI_USER_CONFIRM_DELETE_TITLE}
              body={UI_USER_CONFIRM_DELETE_BODY}
              primaryAction={{
                id: 'delete-confirm',
                label: UI_USER_CONFIRM_DELETE_CONFIRM,
                onClick: handleConfirmDelete,
                disabled: deleteMutation.isPending,
              }}
              secondaryAction={{
                id: 'delete-cancel',
                label: UI_USER_CONFIRM_DELETE_CANCEL,
                onClick: () => setShowConfirm(false),
              }}
              ability={rest.ability}
              permissionKey={rest.permissionKey}
              permissionFallback={rest.permissionFallback}
            />
          </>
        ) : null}
      </Stack>
    </VisibilityGate>
  )
}
