import type { Client, ProductTier } from '@simple-license/react-sdk'
import { useDeleteProductTier } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'
import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type ProductTierSummary = Pick<ProductTier, 'id' | 'tierCode' | 'tierName'>

type ProductTierRowActionsProps = UiCommonProps & {
  client: Client
  tier: ProductTierSummary
  onEdit: (tier: ProductTierSummary) => void
  onCompleted?: () => void
  buttonLabel?: ReactNode
}

export function ProductTierRowActions({ client, tier, onEdit, onCompleted, buttonLabel, ...rest }: ProductTierRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteProductTier(client))

  const actions = createCrudActions<string, unknown, ProductTierSummary>('Tier', {
    update: {
      label: 'Edit Tier',
      buildPayload: () => tier,
      mutation: {
        mutateAsync: async () => tier,
        isPending: false,
      },
      onSuccess: () => onEdit(tier),
    },
    delete: {
      label: 'Delete Tier',
      buildPayload: () => tier.id,
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


