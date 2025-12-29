import type { Client, ProductTier, User } from '@/simpleLicense'
import { useUpdateProductTier } from '@/simpleLicense'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { canDeleteProductTier, canUpdateProductTier } from '../../app/auth/permissions'
import { isSystemAdminUser } from '../../app/auth/userUtils'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_PRODUCT_TIER_ACTION_DELETE,
  UI_PRODUCT_TIER_ACTION_EDIT,
  UI_PRODUCT_TIER_BUTTON_DELETE,
  UI_PRODUCT_TIER_CONFIRM_DELETE_BODY,
  UI_PRODUCT_TIER_CONFIRM_DELETE_CANCEL,
  UI_PRODUCT_TIER_CONFIRM_DELETE_CONFIRM,
  UI_PRODUCT_TIER_CONFIRM_DELETE_TITLE,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'
import { notifyCrudError, notifyProductTierSuccess } from './notifications'

type ProductTierSummary = Pick<ProductTier, 'id' | 'tierCode' | 'tierName'>

type ProductTierRowActionsProps = UiCommonProps & {
  client: Client
  tier: ProductTierSummary
  onEdit: (tier: ProductTierSummary) => void
  onCompleted?: () => void
  currentUser?: User | null
  vendorId?: string | null
}

export function ProductTierRowActions({
  client,
  tier,
  vendorId,
  onEdit,
  onCompleted,
  currentUser,
  ...rest
}: ProductTierRowActionsProps) {
  // Hooks must be called before any early returns (React rules of hooks)
  const updateMutation = adaptMutation(useUpdateProductTier(client))
  const notificationBus = useNotificationBus()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const allowUpdate = canUpdateProductTier(currentUser ?? null)
  const allowDelete = canDeleteProductTier(currentUser ?? null)
  const isSystemAdmin = isSystemAdminUser(currentUser ?? null)

  // Check ownership for non-admin users
  const ownsTier = isSystemAdmin || (vendorId && currentUser?.vendorId === vendorId)

  if ((!allowUpdate && !allowDelete) || (!ownsTier && !isSystemAdmin)) {
    return null
  }

  const handleDelete = async () => {
    try {
      // Soft delete: set is_active to false
      await updateMutation.mutateAsync({ id: tier.id, data: { is_active: false } })
      notifyProductTierSuccess(notificationBus, 'delete')
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
            onClick={() => onEdit(tier)}
            aria-label={UI_PRODUCT_TIER_ACTION_EDIT}
          >
            {UI_PRODUCT_TIER_ACTION_EDIT}
          </Button>
        ) : null}

        {allowDelete ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={updateMutation.isPending}
            aria-label={UI_PRODUCT_TIER_ACTION_DELETE}
          >
            {UI_PRODUCT_TIER_BUTTON_DELETE}
          </Button>
        ) : null}

        <ModalDialog
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title={UI_PRODUCT_TIER_CONFIRM_DELETE_TITLE}
          body={UI_PRODUCT_TIER_CONFIRM_DELETE_BODY}
          primaryAction={{
            id: 'delete-confirm',
            label: UI_PRODUCT_TIER_CONFIRM_DELETE_CONFIRM,
            onClick: handleDelete,
            disabled: updateMutation.isPending,
          }}
          secondaryAction={{
            id: 'delete-cancel',
            label: UI_PRODUCT_TIER_CONFIRM_DELETE_CANCEL,
            onClick: () => setShowDeleteConfirm(false),
          }}
        />
      </Stack>
    </VisibilityGate>
  )
}
