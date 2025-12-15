import type { Client, Entitlement, User } from '@simple-license/react-sdk'
import { useDeleteEntitlement } from '@simple-license/react-sdk'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { canDeleteEntitlement, canUpdateEntitlement } from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_ENTITLEMENT_ACTION_DELETE,
  UI_ENTITLEMENT_ACTION_EDIT,
  UI_ENTITLEMENT_BUTTON_DELETE,
  type UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN,
  type UI_ENTITLEMENT_VALUE_TYPE_NUMBER,
  type UI_ENTITLEMENT_VALUE_TYPE_STRING,
  UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_BODY,
  UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_CANCEL,
  UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_CONFIRM,
  UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_TITLE,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'
import { notifyCrudError, notifyProductEntitlementSuccess } from './notifications'

export type ProductEntitlementSummary = Pick<Entitlement, 'id' | 'key'>

export type ProductEntitlementListItem = ProductEntitlementSummary & {
  valueType:
    | typeof UI_ENTITLEMENT_VALUE_TYPE_NUMBER
    | typeof UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN
    | typeof UI_ENTITLEMENT_VALUE_TYPE_STRING
  defaultValue: string | number | boolean
  usageLimit?: number | null
  vendorId?: string | null
}

type ProductEntitlementRowActionsProps = UiCommonProps & {
  client: Client
  entitlement: ProductEntitlementListItem
  onEdit: (entitlement: ProductEntitlementListItem) => void
  onCompleted?: () => void
  currentUser?: User | null
}

export function ProductEntitlementRowActions({
  client,
  entitlement,
  onEdit,
  onCompleted,
  currentUser,
  ...rest
}: ProductEntitlementRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteEntitlement(client))
  const notificationBus = useNotificationBus()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const allowUpdate = canUpdateEntitlement(currentUser, entitlement)
  const allowDelete = canDeleteEntitlement(currentUser)

  if (!allowUpdate && !allowDelete) {
    return null
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(entitlement.id)
      notifyProductEntitlementSuccess(notificationBus, 'delete')
      onCompleted?.()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    } finally {
      setShowDeleteConfirm(false)
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
            onClick={() => onEdit(entitlement)}
            aria-label={UI_ENTITLEMENT_ACTION_EDIT}
          >
            {UI_ENTITLEMENT_ACTION_EDIT}
          </Button>
        ) : null}

        {allowDelete ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteMutation.isPending}
            aria-label={UI_ENTITLEMENT_ACTION_DELETE}
          >
            {UI_ENTITLEMENT_BUTTON_DELETE}
          </Button>
        ) : null}

        <ModalDialog
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title={UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_TITLE}
          body={UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_BODY}
          primaryAction={{
            label: UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_CONFIRM,
            onClick: handleDelete,
            disabled: deleteMutation.isPending,
          }}
          secondaryAction={{
            label: UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_CANCEL,
            onClick: () => setShowDeleteConfirm(false),
          }}
        />
      </Stack>
    </VisibilityGate>
  )
}
