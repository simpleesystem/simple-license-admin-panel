import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client, User } from '@/simpleLicense'
import { useDeleteUser, useResetUserPassword, useSetServiceAccountPassword } from '@/simpleLicense'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_CLASS_FORM_CONTROL_BASE,
  UI_CLASS_FORM_LABEL_BASE,
  UI_STACK_GAP_SMALL,
  UI_USER_ACTION_DELETE,
  UI_USER_ACTION_EDIT,
  UI_USER_ACTION_RESET_PASSWORD,
  UI_USER_ACTION_SET_SERVICE_PASSWORD,
  UI_USER_BUTTON_DELETE,
  UI_USER_BUTTON_RESET_PASSWORD,
  UI_USER_BUTTON_SET_SERVICE_PASSWORD,
  UI_USER_CONFIRM_DELETE_BODY,
  UI_USER_CONFIRM_DELETE_CANCEL,
  UI_USER_CONFIRM_DELETE_CONFIRM,
  UI_USER_CONFIRM_DELETE_TITLE,
  UI_USER_CONFIRM_RESET_PASSWORD_BODY,
  UI_USER_CONFIRM_RESET_PASSWORD_CANCEL,
  UI_USER_CONFIRM_RESET_PASSWORD_CONFIRM,
  UI_USER_CONFIRM_RESET_PASSWORD_TITLE,
  UI_USER_CONFIRM_SET_SERVICE_PASSWORD_BODY,
  UI_USER_CONFIRM_SET_SERVICE_PASSWORD_CANCEL,
  UI_USER_CONFIRM_SET_SERVICE_PASSWORD_CONFIRM,
  UI_USER_CONFIRM_SET_SERVICE_PASSWORD_TITLE,
  UI_USER_RESET_PASSWORD_FIELD_AUTOCOMPLETE,
  UI_USER_RESET_PASSWORD_FIELD_ID,
  UI_USER_RESET_PASSWORD_FIELD_LABEL,
  UI_USER_RESET_PASSWORD_FIELD_PLACEHOLDER,
  UI_USER_RESET_PASSWORD_FIELD_TYPE,
  UI_USER_RESET_PASSWORD_HELP_TEXT,
  UI_USER_RESET_PASSWORD_MIN_LENGTH,
  UI_USER_SERVICE_ACCOUNT_ROLES,
  UI_USER_SET_SERVICE_PASSWORD_FIELD_AUTOCOMPLETE,
  UI_USER_SET_SERVICE_PASSWORD_FIELD_ID,
  UI_USER_SET_SERVICE_PASSWORD_FIELD_LABEL,
  UI_USER_SET_SERVICE_PASSWORD_FIELD_PLACEHOLDER,
  UI_USER_SET_SERVICE_PASSWORD_FIELD_TYPE,
  UI_USER_SET_SERVICE_PASSWORD_HELP_TEXT,
  UI_USER_SET_SERVICE_PASSWORD_MIN_LENGTH,
  UI_USER_STATUS_DELETED,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'
import {
  notifyCrudError,
  notifyServiceAccountPasswordSetSuccess,
  notifyUserPasswordResetSuccess,
  notifyUserSuccess,
} from './notifications'

const RESET_PASSWORD_FIELD_EMPTY = '' as const
const SET_SERVICE_PASSWORD_FIELD_EMPTY = '' as const

const isServiceAccountRole = (role: string | undefined): boolean =>
  role !== undefined && (UI_USER_SERVICE_ACCOUNT_ROLES as readonly string[]).includes(role)

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
  const resetPasswordMutation = adaptMutation(useResetUserPassword(client))
  const setServicePasswordMutation = adaptMutation(useSetServiceAccountPassword(client))
  const notificationBus = useNotificationBus()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetPasswordValue, setResetPasswordValue] = useState<string>(RESET_PASSWORD_FIELD_EMPTY)
  const [showSetServicePassword, setShowSetServicePassword] = useState(false)
  const [setServicePasswordValue, setSetServicePasswordValue] = useState<string>(SET_SERVICE_PASSWORD_FIELD_EMPTY)

  const isSelf = currentUserId === user.id
  const isDeleted = (user as unknown as { status: string }).status === UI_USER_STATUS_DELETED
  const isServiceAccount = isServiceAccountRole((user as unknown as { role?: string }).role)
  const canEdit = allowUpdate && !isSelf
  const canDelete = allowDelete && !isSelf && !isDeleted
  // Interactive users use the forced-change reset flow; service accounts use direct-set instead.
  const canResetPassword = allowUpdate && !isSelf && !isDeleted && !isServiceAccount
  const canSetServicePassword = allowUpdate && !isSelf && !isDeleted && isServiceAccount
  const showDeleteButton = allowDelete && !isSelf
  const isResetPasswordValid = resetPasswordValue.length >= UI_USER_RESET_PASSWORD_MIN_LENGTH
  const isSetServicePasswordValid = setServicePasswordValue.length >= UI_USER_SET_SERVICE_PASSWORD_MIN_LENGTH

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

  const closeResetPassword = () => {
    setShowResetPassword(false)
    setResetPasswordValue(RESET_PASSWORD_FIELD_EMPTY)
  }

  const handleConfirmResetPassword = async () => {
    if (!isResetPasswordValid) {
      return
    }
    try {
      await resetPasswordMutation.mutateAsync({ id: user.id, data: { new_password: resetPasswordValue } })
      notifyUserPasswordResetSuccess(notificationBus)
      onCompleted?.()
      closeResetPassword()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    }
  }

  const closeSetServicePassword = () => {
    setShowSetServicePassword(false)
    setSetServicePasswordValue(SET_SERVICE_PASSWORD_FIELD_EMPTY)
  }

  const handleConfirmSetServicePassword = async () => {
    if (!isSetServicePasswordValid) {
      return
    }
    try {
      await setServicePasswordMutation.mutateAsync({ id: user.id, data: { new_password: setServicePasswordValue } })
      notifyServiceAccountPasswordSetSuccess(notificationBus)
      onCompleted?.()
      closeSetServicePassword()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    }
  }

  if (!canEdit && !canDelete && !canResetPassword && !canSetServicePassword) {
    return null
  }

  return (
    <VisibilityGate
      ability={rest.ability}
      permissionKey={rest.permissionKey}
      permissionFallback={rest.permissionFallback}
    >
      <Stack direction="row" gap={UI_STACK_GAP_SMALL} {...rest}>
        {canEdit ? (
          <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => onEdit(user)} aria-label={UI_USER_ACTION_EDIT}>
            {UI_USER_ACTION_EDIT}
          </Button>
        ) : null}
        {canResetPassword ? (
          <>
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => setShowResetPassword(true)}
              disabled={resetPasswordMutation.isPending}
              aria-label={UI_USER_ACTION_RESET_PASSWORD}
            >
              {UI_USER_BUTTON_RESET_PASSWORD}
            </Button>
            <ModalDialog
              show={showResetPassword}
              onClose={closeResetPassword}
              title={UI_USER_CONFIRM_RESET_PASSWORD_TITLE}
              body={
                <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
                  <span>{UI_USER_CONFIRM_RESET_PASSWORD_BODY}</span>
                  <label className={UI_CLASS_FORM_LABEL_BASE} htmlFor={UI_USER_RESET_PASSWORD_FIELD_ID}>
                    {UI_USER_RESET_PASSWORD_FIELD_LABEL}
                  </label>
                  <input
                    id={UI_USER_RESET_PASSWORD_FIELD_ID}
                    type={UI_USER_RESET_PASSWORD_FIELD_TYPE}
                    className={UI_CLASS_FORM_CONTROL_BASE}
                    value={resetPasswordValue}
                    placeholder={UI_USER_RESET_PASSWORD_FIELD_PLACEHOLDER}
                    onChange={(event) => setResetPasswordValue(event.target.value)}
                    disabled={resetPasswordMutation.isPending}
                    minLength={UI_USER_RESET_PASSWORD_MIN_LENGTH}
                    autoComplete={UI_USER_RESET_PASSWORD_FIELD_AUTOCOMPLETE}
                  />
                  <small>{UI_USER_RESET_PASSWORD_HELP_TEXT}</small>
                </Stack>
              }
              primaryAction={{
                id: 'reset-password-confirm',
                label: UI_USER_CONFIRM_RESET_PASSWORD_CONFIRM,
                onClick: handleConfirmResetPassword,
                disabled: resetPasswordMutation.isPending || !isResetPasswordValid,
              }}
              secondaryAction={{
                id: 'reset-password-cancel',
                label: UI_USER_CONFIRM_RESET_PASSWORD_CANCEL,
                onClick: closeResetPassword,
              }}
              ability={rest.ability}
              permissionKey={rest.permissionKey}
              permissionFallback={rest.permissionFallback}
            />
          </>
        ) : null}
        {canSetServicePassword ? (
          <>
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => setShowSetServicePassword(true)}
              disabled={setServicePasswordMutation.isPending}
              aria-label={UI_USER_ACTION_SET_SERVICE_PASSWORD}
            >
              {UI_USER_BUTTON_SET_SERVICE_PASSWORD}
            </Button>
            <ModalDialog
              show={showSetServicePassword}
              onClose={closeSetServicePassword}
              title={UI_USER_CONFIRM_SET_SERVICE_PASSWORD_TITLE}
              body={
                <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
                  <span>{UI_USER_CONFIRM_SET_SERVICE_PASSWORD_BODY}</span>
                  <label className={UI_CLASS_FORM_LABEL_BASE} htmlFor={UI_USER_SET_SERVICE_PASSWORD_FIELD_ID}>
                    {UI_USER_SET_SERVICE_PASSWORD_FIELD_LABEL}
                  </label>
                  <input
                    id={UI_USER_SET_SERVICE_PASSWORD_FIELD_ID}
                    type={UI_USER_SET_SERVICE_PASSWORD_FIELD_TYPE}
                    className={UI_CLASS_FORM_CONTROL_BASE}
                    value={setServicePasswordValue}
                    placeholder={UI_USER_SET_SERVICE_PASSWORD_FIELD_PLACEHOLDER}
                    onChange={(event) => setSetServicePasswordValue(event.target.value)}
                    disabled={setServicePasswordMutation.isPending}
                    minLength={UI_USER_SET_SERVICE_PASSWORD_MIN_LENGTH}
                    autoComplete={UI_USER_SET_SERVICE_PASSWORD_FIELD_AUTOCOMPLETE}
                  />
                  <small>{UI_USER_SET_SERVICE_PASSWORD_HELP_TEXT}</small>
                </Stack>
              }
              primaryAction={{
                id: 'set-service-password-confirm',
                label: UI_USER_CONFIRM_SET_SERVICE_PASSWORD_CONFIRM,
                onClick: handleConfirmSetServicePassword,
                disabled: setServicePasswordMutation.isPending || !isSetServicePasswordValid,
              }}
              secondaryAction={{
                id: 'set-service-password-cancel',
                label: UI_USER_CONFIRM_SET_SERVICE_PASSWORD_CANCEL,
                onClick: closeSetServicePassword,
              }}
              ability={rest.ability}
              permissionKey={rest.permissionKey}
              permissionFallback={rest.permissionFallback}
            />
          </>
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
