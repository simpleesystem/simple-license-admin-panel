import type { Client, ProductTier, User } from '@simple-license/react-sdk'
import { useDeleteProductTier } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { adaptMutation } from '../actions/mutationAdapter'
import { createCrudActions } from '../actions/mutationActions'
import {
  UI_ENTITY_PRODUCT_TIER,
  UI_PRODUCT_TIER_ACTION_DELETE,
  UI_PRODUCT_TIER_ACTION_EDIT,
  UI_PRODUCT_TIER_BUTTON_DELETE,
} from '../constants'
import { ActionMenu } from '../data/ActionMenu'
import { canDeleteProductTier, canUpdateProductTier } from '../../app/auth/permissions'
import type { UiCommonProps } from '../types'

type ProductTierSummary = Pick<ProductTier, 'id' | 'tierCode' | 'tierName'>

type ProductTierRowActionsProps = UiCommonProps & {
  client: Client
  tier: ProductTierSummary
  onEdit: (tier: ProductTierSummary) => void
  onCompleted?: () => void
  buttonLabel?: ReactNode
  currentUser?: User | null
  vendorId?: string | null
}

export function ProductTierRowActions({
  client,
  tier,
  onEdit,
  onCompleted,
  buttonLabel,
  currentUser,
  vendorId,
  ...rest
}: ProductTierRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteProductTier(client))
  const tierContext = { vendorId: vendorId ?? (tier as { vendorId?: string | null }).vendorId }
  const allowUpdate = canUpdateProductTier(currentUser, tierContext)
  const allowDelete = canDeleteProductTier(currentUser)

  if (!allowUpdate && !allowDelete) {
    return null
  }

  const actions = createCrudActions<string, unknown, ProductTierSummary>(UI_ENTITY_PRODUCT_TIER, {
    update: allowUpdate
      ? {
          label: UI_PRODUCT_TIER_ACTION_EDIT,
          buildPayload: () => tier,
          mutation: {
            mutateAsync: async () => tier,
            isPending: false,
          },
          onSuccess: () => onEdit(tier),
        }
      : undefined,
    delete: allowDelete
      ? {
          label: UI_PRODUCT_TIER_ACTION_DELETE,
          buildPayload: () => tier.id,
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

  const fallbackLabel = allowDelete ? UI_PRODUCT_TIER_BUTTON_DELETE : UI_PRODUCT_TIER_ACTION_EDIT

  return (
    <ActionMenu
      {...rest}
      items={actions}
      buttonLabel={buttonLabel ?? fallbackLabel}
    />
  )
}


