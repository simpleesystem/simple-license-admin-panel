import type { Client, User } from '@/simpleLicense'
import { useDeleteProduct, useResumeProduct, useSuspendProduct } from '@/simpleLicense'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { canDeleteProduct, canUpdateProduct } from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_PRODUCT_ACTION_DELETE,
  UI_PRODUCT_ACTION_EDIT,
  UI_PRODUCT_ACTION_RESUME,
  UI_PRODUCT_ACTION_SUSPEND,
  UI_PRODUCT_BUTTON_DELETE,
  UI_PRODUCT_BUTTON_RESUME,
  UI_PRODUCT_BUTTON_SUSPEND,
  UI_PRODUCT_CONFIRM_DELETE_BODY,
  UI_PRODUCT_CONFIRM_DELETE_CANCEL,
  UI_PRODUCT_CONFIRM_DELETE_CONFIRM,
  UI_PRODUCT_CONFIRM_DELETE_TITLE,
  UI_PRODUCT_CONFIRM_RESUME_BODY,
  UI_PRODUCT_CONFIRM_RESUME_CANCEL,
  UI_PRODUCT_CONFIRM_RESUME_CONFIRM,
  UI_PRODUCT_CONFIRM_RESUME_TITLE,
  UI_PRODUCT_CONFIRM_SUSPEND_BODY,
  UI_PRODUCT_CONFIRM_SUSPEND_CANCEL,
  UI_PRODUCT_CONFIRM_SUSPEND_CONFIRM,
  UI_PRODUCT_CONFIRM_SUSPEND_TITLE,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'
import { notifyCrudError, notifyProductSuccess } from './notifications'

type ProductRowActionsProps = UiCommonProps & {
  client: Client
  productId: string
  isActive: boolean
  onEdit: (product: { id: string }) => void
  onCompleted?: () => void
  currentUser?: User | null
}

export function ProductRowActions({
  client,
  productId,
  isActive,
  onEdit,
  onCompleted,
  currentUser,
  ...rest
}: ProductRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteProduct(client))
  const suspendMutation = adaptMutation(useSuspendProduct(client))
  const resumeMutation = adaptMutation(useResumeProduct(client))
  const notificationBus = useNotificationBus()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false)
  const [showResumeConfirm, setShowResumeConfirm] = useState(false)

  // const productContext = { vendorId }
  const allowUpdate = canUpdateProduct(currentUser ?? null)
  const allowDelete = canDeleteProduct(currentUser ?? null)

  if (!allowUpdate && !allowDelete) {
    return null
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(productId)
      notifyProductSuccess(notificationBus, 'delete')
      onCompleted?.()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  const handleSuspend = async () => {
    try {
      await suspendMutation.mutateAsync(productId)
      notifyProductSuccess(notificationBus, 'suspend')
      onCompleted?.()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    } finally {
      setShowSuspendConfirm(false)
    }
  }

  const handleResume = async () => {
    try {
      await resumeMutation.mutateAsync(productId)
      notifyProductSuccess(notificationBus, 'resume')
      onCompleted?.()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    } finally {
      setShowResumeConfirm(false)
    }
  }

  return (
    <VisibilityGate
      ability={rest.ability}
      permissionKey={rest.permissionKey}
      permissionFallback={rest.permissionFallback}
    >
      <Stack direction="row" gap="small" {...rest}>
        {allowUpdate ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => onEdit({ id: productId })}
            aria-label={UI_PRODUCT_ACTION_EDIT}
          >
            {UI_PRODUCT_ACTION_EDIT}
          </Button>
        ) : null}

        {allowUpdate ? (
          isActive ? (
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => setShowSuspendConfirm(true)}
              disabled={suspendMutation.isPending}
              aria-label={UI_PRODUCT_ACTION_SUSPEND}
            >
              {UI_PRODUCT_BUTTON_SUSPEND}
            </Button>
          ) : (
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => setShowResumeConfirm(true)}
              disabled={resumeMutation.isPending}
              aria-label={UI_PRODUCT_ACTION_RESUME}
            >
              {UI_PRODUCT_BUTTON_RESUME}
            </Button>
          )
        ) : null}

        {allowDelete ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteMutation.isPending}
            aria-label={UI_PRODUCT_ACTION_DELETE}
          >
            {UI_PRODUCT_BUTTON_DELETE}
          </Button>
        ) : null}

        <ModalDialog
          show={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          title={UI_PRODUCT_CONFIRM_SUSPEND_TITLE}
          body={UI_PRODUCT_CONFIRM_SUSPEND_BODY}
          primaryAction={{
            id: 'suspend-confirm',
            label: UI_PRODUCT_CONFIRM_SUSPEND_CONFIRM,
            onClick: handleSuspend,
            disabled: suspendMutation.isPending,
          }}
          secondaryAction={{
            id: 'suspend-cancel',
            label: UI_PRODUCT_CONFIRM_SUSPEND_CANCEL,
            onClick: () => setShowSuspendConfirm(false),
          }}
        />

        <ModalDialog
          show={showResumeConfirm}
          onClose={() => setShowResumeConfirm(false)}
          title={UI_PRODUCT_CONFIRM_RESUME_TITLE}
          body={UI_PRODUCT_CONFIRM_RESUME_BODY}
          primaryAction={{
            id: 'resume-confirm',
            label: UI_PRODUCT_CONFIRM_RESUME_CONFIRM,
            onClick: handleResume,
            disabled: resumeMutation.isPending,
          }}
          secondaryAction={{
            id: 'resume-cancel',
            label: UI_PRODUCT_CONFIRM_RESUME_CANCEL,
            onClick: () => setShowResumeConfirm(false),
          }}
        />

        <ModalDialog
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title={UI_PRODUCT_CONFIRM_DELETE_TITLE}
          body={UI_PRODUCT_CONFIRM_DELETE_BODY}
          primaryAction={{
            id: 'delete-confirm',
            label: UI_PRODUCT_CONFIRM_DELETE_CONFIRM,
            onClick: handleDelete,
            disabled: deleteMutation.isPending,
          }}
          secondaryAction={{
            id: 'delete-cancel',
            label: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
            onClick: () => setShowDeleteConfirm(false),
          }}
        />
      </Stack>
    </VisibilityGate>
  )
}
