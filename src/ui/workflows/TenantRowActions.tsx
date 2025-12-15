import type { Client, Tenant, User } from '@simple-license/react-sdk'
import { useResumeTenant, useSuspendTenant } from '@simple-license/react-sdk'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { canUpdateTenant } from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/busContext'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_TENANT_ACTION_EDIT,
  UI_TENANT_ACTION_RESUME,
  UI_TENANT_ACTION_SUSPEND,
  UI_TENANT_BUTTON_RESUME,
  UI_TENANT_BUTTON_SUSPEND,
  UI_TENANT_CONFIRM_RESUME_BODY,
  UI_TENANT_CONFIRM_RESUME_CANCEL,
  UI_TENANT_CONFIRM_RESUME_CONFIRM,
  UI_TENANT_CONFIRM_RESUME_TITLE,
  UI_TENANT_CONFIRM_SUSPEND_BODY,
  UI_TENANT_CONFIRM_SUSPEND_CANCEL,
  UI_TENANT_CONFIRM_SUSPEND_CONFIRM,
  UI_TENANT_CONFIRM_SUSPEND_TITLE,
  UI_TENANT_STATUS_SUSPENDED,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'
import { notifyCrudError, notifyTenantSuccess } from './notifications'

type TenantRowActionsProps = UiCommonProps & {
  client: Client
  tenant: Tenant
  onEdit: (tenant: Tenant) => void
  onCompleted?: () => void
  currentUser?: User | null
}

export function TenantRowActions({ client, tenant, onEdit, onCompleted, currentUser, ...rest }: TenantRowActionsProps) {
  const suspendMutation = adaptMutation(useSuspendTenant(client))
  const resumeMutation = adaptMutation(useResumeTenant(client))
  const notificationBus = useNotificationBus()
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false)
  const [showResumeConfirm, setShowResumeConfirm] = useState(false)

  const allowUpdate = canUpdateTenant(currentUser, tenant)
  const isSuspended = tenant.status === UI_TENANT_STATUS_SUSPENDED

  if (!allowUpdate) {
    return null
  }

  const handleSuspend = async () => {
    try {
      await suspendMutation.mutateAsync(tenant.id)
      notifyTenantSuccess(notificationBus, 'suspend')
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
      await resumeMutation.mutateAsync(tenant.id)
      notifyTenantSuccess(notificationBus, 'resume')
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
        <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={() => onEdit(tenant)} aria-label={UI_TENANT_ACTION_EDIT}>
          {UI_TENANT_ACTION_EDIT}
        </Button>

        {isSuspended ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => setShowResumeConfirm(true)}
            disabled={resumeMutation.isPending}
            aria-label={UI_TENANT_ACTION_RESUME}
          >
            {UI_TENANT_BUTTON_RESUME}
          </Button>
        ) : (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => setShowSuspendConfirm(true)}
            disabled={suspendMutation.isPending}
            aria-label={UI_TENANT_ACTION_SUSPEND}
          >
            {UI_TENANT_BUTTON_SUSPEND}
          </Button>
        )}

        <ModalDialog
          show={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          title={UI_TENANT_CONFIRM_SUSPEND_TITLE}
          body={UI_TENANT_CONFIRM_SUSPEND_BODY}
          primaryAction={{
            label: UI_TENANT_CONFIRM_SUSPEND_CONFIRM,
            onClick: handleSuspend,
            disabled: suspendMutation.isPending,
          }}
          secondaryAction={{
            label: UI_TENANT_CONFIRM_SUSPEND_CANCEL,
            onClick: () => setShowSuspendConfirm(false),
          }}
        />

        <ModalDialog
          show={showResumeConfirm}
          onClose={() => setShowResumeConfirm(false)}
          title={UI_TENANT_CONFIRM_RESUME_TITLE}
          body={UI_TENANT_CONFIRM_RESUME_BODY}
          primaryAction={{
            label: UI_TENANT_CONFIRM_RESUME_CONFIRM,
            onClick: handleResume,
            disabled: resumeMutation.isPending,
          }}
          secondaryAction={{
            label: UI_TENANT_CONFIRM_RESUME_CANCEL,
            onClick: () => setShowResumeConfirm(false),
          }}
        />
      </Stack>
    </VisibilityGate>
  )
}
