import type { Client, LicenseStatus, User } from '@simple-license/react-sdk'
import { useResumeLicense, useRevokeLicense, useSuspendLicense } from '@simple-license/react-sdk'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { canDeleteLicense, canUpdateLicense } from '../../app/auth/permissions'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_LICENSE_ACTION_DELETE,
  UI_LICENSE_ACTION_EDIT,
  UI_LICENSE_ACTION_RESUME,
  UI_LICENSE_ACTION_SUSPEND,
  UI_LICENSE_BUTTON_DELETE,
  UI_LICENSE_BUTTON_RESUME,
  UI_LICENSE_BUTTON_SUSPEND,
  UI_LICENSE_CONFIRM_DELETE_BODY,
  UI_LICENSE_CONFIRM_DELETE_CANCEL,
  UI_LICENSE_CONFIRM_DELETE_CONFIRM,
  UI_LICENSE_CONFIRM_DELETE_TITLE,
  UI_LICENSE_CONFIRM_RESUME_BODY,
  UI_LICENSE_CONFIRM_RESUME_CANCEL,
  UI_LICENSE_CONFIRM_RESUME_CONFIRM,
  UI_LICENSE_CONFIRM_RESUME_TITLE,
  UI_LICENSE_CONFIRM_SUSPEND_BODY,
  UI_LICENSE_CONFIRM_SUSPEND_CANCEL,
  UI_LICENSE_CONFIRM_SUSPEND_CONFIRM,
  UI_LICENSE_CONFIRM_SUSPEND_TITLE,
  UI_LICENSE_STATUS_SUSPENDED,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'
import { notifyCrudError, notifyLicenseSuccess } from './notifications'

type LicenseRowActionsProps = UiCommonProps & {
  client: Client
  licenseKey: string
  licenseStatus: LicenseStatus
  licenseVendorId?: string | null
  currentUser?: User | null
  onEdit?: (licenseKey: string) => void
  onCompleted?: () => void
}

export function LicenseRowActions({
  client,
  licenseKey,
  licenseStatus,
  currentUser,
  onEdit,
  onCompleted,
  ...rest
}: LicenseRowActionsProps) {
  const revokeMutation = adaptMutation(useRevokeLicense(client))
  const suspendMutation = adaptMutation(useSuspendLicense(client))
  const resumeMutation = adaptMutation(useResumeLicense(client))
  const notificationBus = useNotificationBus()

  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false)
  const [showResumeConfirm, setShowResumeConfirm] = useState(false)

  const allowDelete = canDeleteLicense(currentUser ?? null)
  const allowUpdate = canUpdateLicense(currentUser ?? null)
  const isSuspended = licenseStatus === UI_LICENSE_STATUS_SUSPENDED

  if (!allowDelete && !allowUpdate) {
    return null
  }

  const handleRevoke = async () => {
    try {
      await revokeMutation.mutateAsync(licenseKey)
      notifyLicenseSuccess(notificationBus, 'delete')
      onCompleted?.()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    } finally {
      setShowRevokeConfirm(false)
    }
  }

  const handleSuspend = async () => {
    try {
      await suspendMutation.mutateAsync(licenseKey)
      notifyLicenseSuccess(notificationBus, 'suspend')
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
      await resumeMutation.mutateAsync(licenseKey)
      notifyLicenseSuccess(notificationBus, 'resume')
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
        {allowUpdate && onEdit ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => onEdit(licenseKey)}
            aria-label={UI_LICENSE_ACTION_EDIT}
          >
            {UI_LICENSE_ACTION_EDIT}
          </Button>
        ) : null}

        {allowUpdate ? (
          isSuspended ? (
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => setShowResumeConfirm(true)}
              disabled={resumeMutation.isPending}
              aria-label={UI_LICENSE_ACTION_RESUME}
            >
              {UI_LICENSE_BUTTON_RESUME}
            </Button>
          ) : (
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => setShowSuspendConfirm(true)}
              disabled={suspendMutation.isPending}
              aria-label={UI_LICENSE_ACTION_SUSPEND}
            >
              {UI_LICENSE_BUTTON_SUSPEND}
            </Button>
          )
        ) : null}

        {allowDelete ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => setShowRevokeConfirm(true)}
            disabled={revokeMutation.isPending}
            aria-label={UI_LICENSE_ACTION_DELETE}
          >
            {UI_LICENSE_BUTTON_DELETE}
          </Button>
        ) : null}

        <ModalDialog
          show={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          title={UI_LICENSE_CONFIRM_SUSPEND_TITLE}
          body={UI_LICENSE_CONFIRM_SUSPEND_BODY}
          primaryAction={{
            id: 'suspend-confirm',
            label: UI_LICENSE_CONFIRM_SUSPEND_CONFIRM,
            onClick: handleSuspend,
            disabled: suspendMutation.isPending,
          }}
          secondaryAction={{
            id: 'suspend-cancel',
            label: UI_LICENSE_CONFIRM_SUSPEND_CANCEL,
            onClick: () => setShowSuspendConfirm(false),
          }}
        />

        <ModalDialog
          show={showResumeConfirm}
          onClose={() => setShowResumeConfirm(false)}
          title={UI_LICENSE_CONFIRM_RESUME_TITLE}
          body={UI_LICENSE_CONFIRM_RESUME_BODY}
          primaryAction={{
            id: 'resume-confirm',
            label: UI_LICENSE_CONFIRM_RESUME_CONFIRM,
            onClick: handleResume,
            disabled: resumeMutation.isPending,
          }}
          secondaryAction={{
            id: 'resume-cancel',
            label: UI_LICENSE_CONFIRM_RESUME_CANCEL,
            onClick: () => setShowResumeConfirm(false),
          }}
        />

        <ModalDialog
          show={showRevokeConfirm}
          onClose={() => setShowRevokeConfirm(false)}
          title={UI_LICENSE_CONFIRM_DELETE_TITLE}
          body={UI_LICENSE_CONFIRM_DELETE_BODY}
          primaryAction={{
            id: 'revoke-confirm',
            label: UI_LICENSE_CONFIRM_DELETE_CONFIRM,
            onClick: handleRevoke,
            disabled: revokeMutation.isPending,
          }}
          secondaryAction={{
            id: 'revoke-cancel',
            label: UI_LICENSE_CONFIRM_DELETE_CANCEL,
            onClick: () => setShowRevokeConfirm(false),
          }}
        />
      </Stack>
    </VisibilityGate>
  )
}
