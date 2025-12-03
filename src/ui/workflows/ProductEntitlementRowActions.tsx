import type { Client, Entitlement } from '@simple-license/react-sdk'
import { useDeleteEntitlement } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'
import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN,
  UI_ENTITLEMENT_VALUE_TYPE_NUMBER,
  UI_ENTITLEMENT_VALUE_TYPE_STRING,
} from '../constants'

export type ProductEntitlementSummary = Pick<Entitlement, 'id' | 'key'>

export type ProductEntitlementListItem = ProductEntitlementSummary & {
  valueType: typeof UI_ENTITLEMENT_VALUE_TYPE_NUMBER | typeof UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN | typeof UI_ENTITLEMENT_VALUE_TYPE_STRING
  defaultValue: string | number | boolean
  usageLimit?: number | null
}

type ProductEntitlementRowActionsProps = UiCommonProps & {
  client: Client
  entitlement: ProductEntitlementListItem
  onEdit: (entitlement: ProductEntitlementListItem) => void
  onCompleted?: () => void
  buttonLabel?: ReactNode
}

export function ProductEntitlementRowActions({
  client,
  entitlement,
  onEdit,
  onCompleted,
  buttonLabel,
  ...rest
}: ProductEntitlementRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteEntitlement(client))

  const actions = createCrudActions<string, unknown, ProductEntitlementSummary>('Entitlement', {
    update: {
      label: 'Edit Entitlement',
      buildPayload: () => entitlement,
      mutation: {
        mutateAsync: async () => entitlement,
        isPending: false,
      },
      onSuccess: () => onEdit(entitlement),
    },
    delete: {
      label: 'Delete Entitlement',
      buildPayload: () => entitlement.id,
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


