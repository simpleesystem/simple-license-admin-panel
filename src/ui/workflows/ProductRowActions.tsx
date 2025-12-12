import type { Client, User } from '@simple-license/react-sdk'
import { useDeleteProduct, useResumeProduct, useSuspendProduct } from '@simple-license/react-sdk'
import type { ReactNode } from 'react'
import { canDeleteProduct, canUpdateProduct } from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_ENTITY_PRODUCT,
  UI_PRODUCT_ACTION_DELETE,
  UI_PRODUCT_ACTION_RESUME,
  UI_PRODUCT_ACTION_SUSPEND,
  UI_PRODUCT_BUTTON_DELETE,
} from '../constants'
import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'
import { notifyCrudError, notifyProductSuccess } from './notifications'

type ProductRowActionsProps = UiCommonProps & {
  client: Client
  productId: string
  isActive: boolean
  onCompleted?: () => void
  buttonLabel?: ReactNode
  currentUser?: User | null
  vendorId?: string | null
}

export function ProductRowActions({
  client,
  productId,
  isActive,
  onCompleted,
  buttonLabel,
  currentUser,
  vendorId,
  ...rest
}: ProductRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteProduct(client))
  const suspendMutation = adaptMutation(useSuspendProduct(client))
  const resumeMutation = adaptMutation(useResumeProduct(client))
  const notificationBus = useNotificationBus()

  const productContext = { vendorId }
  const allowUpdate = canUpdateProduct(currentUser, productContext)
  const allowDelete = canDeleteProduct(currentUser)

  if (!allowUpdate && !allowDelete) {
    return null
  }

  const actions = createCrudActions<string>(UI_ENTITY_PRODUCT, {
    delete: allowDelete
      ? {
          label: UI_PRODUCT_ACTION_DELETE,
          mutation: {
            mutateAsync: async (payload) => {
              try {
                const result = await deleteMutation.mutateAsync(payload)
                onCompleted?.()
                notifyProductSuccess(notificationBus, 'delete')
                return result
              } catch (error) {
                notifyCrudError(notificationBus)
                throw error
              }
            },
            isPending: deleteMutation.isPending,
          },
          buildPayload: () => productId,
        }
      : undefined,
    suspend: allowUpdate
      ? {
          label: UI_PRODUCT_ACTION_SUSPEND,
          mutation: {
            mutateAsync: async (payload) => {
              try {
                const result = await suspendMutation.mutateAsync(payload)
                onCompleted?.()
                notifyProductSuccess(notificationBus, 'suspend')
                return result
              } catch (error) {
                notifyCrudError(notificationBus)
                throw error
              }
            },
            isPending: suspendMutation.isPending,
          },
          buildPayload: () => productId,
          disabled: !isActive,
        }
      : undefined,
    resume: allowUpdate
      ? {
          label: UI_PRODUCT_ACTION_RESUME,
          mutation: {
            mutateAsync: async (payload) => {
              try {
                const result = await resumeMutation.mutateAsync(payload)
                onCompleted?.()
                notifyProductSuccess(notificationBus, 'resume')
                return result
              } catch (error) {
                notifyCrudError(notificationBus)
                throw error
              }
            },
            isPending: resumeMutation.isPending,
          },
          buildPayload: () => productId,
          disabled: isActive,
        }
      : undefined,
  })

  const fallbackLabel = allowDelete ? UI_PRODUCT_BUTTON_DELETE : UI_PRODUCT_ACTION_SUSPEND

  return <ActionMenu {...rest} items={actions} buttonLabel={buttonLabel ?? fallbackLabel} variant="outline-secondary" />
}
