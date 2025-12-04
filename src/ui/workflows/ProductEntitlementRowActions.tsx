import type { Client, Entitlement, User } from '@simple-license/react-sdk'
import { useDeleteEntitlement } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { adaptMutation } from '../actions/mutationAdapter'
import { createCrudActions } from '../actions/mutationActions'
import {
  UI_ENTITLEMENT_ACTION_DELETE,
  UI_ENTITLEMENT_ACTION_EDIT,
  UI_ENTITLEMENT_BUTTON_DELETE,
  UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN,
  UI_ENTITLEMENT_VALUE_TYPE_NUMBER,
  UI_ENTITLEMENT_VALUE_TYPE_STRING,
  UI_ENTITY_ENTITLEMENT,
} from '../constants'
import { ActionMenu } from '../data/ActionMenu'
import { canDeleteEntitlement, canUpdateEntitlement } from '../../app/auth/permissions'
import type { UiCommonProps } from '../types'

export type ProductEntitlementSummary = Pick<Entitlement, 'id' | 'key'>

export type ProductEntitlementListItem = ProductEntitlementSummary & {
  valueType: typeof UI_ENTITLEMENT_VALUE_TYPE_NUMBER | typeof UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN | typeof UI_ENTITLEMENT_VALUE_TYPE_STRING
  defaultValue: string | number | boolean
  usageLimit?: number | null
  vendorId?: string | null
}

type ProductEntitlementRowActionsProps = UiCommonProps & {
  client: Client
  entitlement: ProductEntitlementListItem
  onEdit: (entitlement: ProductEntitlementListItem) => void
  onCompleted?: () => void
  buttonLabel?: ReactNode
  currentUser?: User | null
}

export function ProductEntitlementRowActions({
  client,
  entitlement,
  onEdit,
  onCompleted,
  buttonLabel,
  currentUser,
  ...rest
}: ProductEntitlementRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteEntitlement(client))

  const allowUpdate = canUpdateEntitlement(currentUser, entitlement)
  const allowDelete = canDeleteEntitlement(currentUser)

  if (!allowUpdate && !allowDelete) {
    return null
  }

  const actions = createCrudActions<string, unknown, ProductEntitlementSummary>(UI_ENTITY_ENTITLEMENT, {
    update: allowUpdate
      ? {
          label: UI_ENTITLEMENT_ACTION_EDIT,
          buildPayload: () => entitlement,
          mutation: {
            mutateAsync: async () => entitlement,
            isPending: false,
          },
          onSuccess: () => onEdit(entitlement),
        }
      : undefined,
    delete: allowDelete
      ? {
          label: UI_ENTITLEMENT_ACTION_DELETE,
          buildPayload: () => entitlement.id,
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

  const fallbackLabel = allowDelete ? UI_ENTITLEMENT_BUTTON_DELETE : UI_ENTITLEMENT_ACTION_EDIT

  return (
    <ActionMenu
      {...rest}
      items={actions}
      buttonLabel={buttonLabel ?? fallbackLabel}
    />
  )
}


