import type { Client } from '@simple-license/react-sdk'
import {
  useDeleteProduct,
  useResumeProduct,
  useSuspendProduct,
} from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'

type ProductRowActionsProps = UiCommonProps & {
  client: Client
  productId: string
  isActive: boolean
  onCompleted?: () => void
  buttonLabel?: ReactNode
}

export function ProductRowActions({
  client,
  productId,
  isActive,
  onCompleted,
  buttonLabel,
  ...rest
}: ProductRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteProduct(client))
  const suspendMutation = adaptMutation(useSuspendProduct(client))
  const resumeMutation = adaptMutation(useResumeProduct(client))

  const actions = createCrudActions<string>('Product', {
    delete: {
      mutation: {
        mutateAsync: async (payload) => {
          const result = await deleteMutation.mutateAsync(payload)
          onCompleted?.()
          return result
        },
        isPending: deleteMutation.isPending,
      },
      buildPayload: () => productId,
    },
    suspend: {
      mutation: {
        mutateAsync: async (payload) => {
          const result = await suspendMutation.mutateAsync(payload)
          onCompleted?.()
          return result
        },
        isPending: suspendMutation.isPending,
      },
      buildPayload: () => productId,
      disabled: !isActive,
    },
    resume: {
      mutation: {
        mutateAsync: async (payload) => {
          const result = await resumeMutation.mutateAsync(payload)
          onCompleted?.()
          return result
        },
        isPending: resumeMutation.isPending,
      },
      buildPayload: () => productId,
      disabled: isActive,
    },
  })

  return (
    <ActionMenu
      {...rest}
      items={actions}
      buttonLabel={buttonLabel}
      variant="outline-secondary"
    />
  )
}


