import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client } from '@/simpleLicense'
import type { PluginRelease } from '@/simpleLicense/types/api'
import { NOTIFICATION_EVENT_TOAST, NOTIFICATION_VARIANT_ERROR } from '../../app/constants'
import { useNotificationBus } from '../../notifications/useNotificationBus'

import { useDeleteRelease, usePromoteRelease } from '../../simpleLicense/hooks'
import {
  UI_BUTTON_VARIANT_DANGER,
  UI_BUTTON_VARIANT_OUTLINE,
  UI_BUTTON_VARIANT_OUTLINE_DANGER,
  UI_BUTTON_VARIANT_OUTLINE_SECONDARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_CLASS_MARGIN_BOTTOM_SMALL,
  UI_CLASS_TEXT_MUTED_SMALL_RESET,
  UI_RELEASE_ACTION_DELETE,
  UI_RELEASE_ACTION_DELETING,
  UI_RELEASE_ACTION_DOWNLOAD,
  UI_RELEASE_ACTION_DOWNLOADING,
  UI_RELEASE_ACTION_PROMOTE,
  UI_RELEASE_ACTION_PROMOTING,
  UI_RELEASE_CONFIRM_DELETE_BODY,
  UI_RELEASE_CONFIRM_DELETE_BUTTON,
  UI_RELEASE_CONFIRM_DELETE_TITLE,
  UI_RELEASE_CONFIRM_PROMOTE_BODY,
  UI_RELEASE_CONFIRM_PROMOTE_TITLE,
  UI_RELEASE_DOWNLOAD_ERROR_GENERIC,
  UI_RELEASE_DOWNLOAD_ERROR_MISSING,
  UI_RELEASE_MODAL_CANCEL,
  UI_RELEASE_VERSION_PREFIX,
  UI_SIZE_SMALL,
  UI_STACK_GAP_SMALL,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'

type ReleaseRowActionsProps = {
  client: Client
  release?: PluginRelease
  productId: string
  releaseId: string
  releaseVersion: string
  releaseFileName: string
  downloadUrl: string
  isPromoted: boolean
  allowPromote: boolean
  allowDelete: boolean
  onCompleted?: () => void
}

const UI_RELEASE_PROMOTE_ERROR_MISSING = 'Cannot set live because the release file is missing from storage.'
const UI_RELEASE_PROMOTE_ERROR_GENERIC = 'Unable to set this release live right now.'

export function ReleaseRowActions({
  client,
  release,
  productId,
  releaseId,
  releaseVersion,
  releaseFileName,
  downloadUrl,
  isPromoted,
  allowPromote,
  allowDelete,
  onCompleted,
}: ReleaseRowActionsProps) {
  const promoteMutation = usePromoteRelease(client, productId)
  const deleteMutation = useDeleteRelease(client, productId)
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [repairFile, setRepairFile] = useState<File | null>(null)
  const [isRepairing, setIsRepairing] = useState(false)
  const [repairForm] = useState(() => new FormData())
  const notificationBus = useNotificationBus()

  const showPromoteButton = allowPromote && !isPromoted
  const showDeleteButton = allowDelete

  if (!showPromoteButton && !showDeleteButton && !downloadUrl) {
    return null
  }

  const handleConfirmPromote = async () => {
    if (!release) {
      notifyDownloadError('Refresh the displayed release before choosing its exact revision.')
      return
    }
    let retained: Awaited<ReturnType<Client['prepareReleaseMaintenance']>>
    try {
      retained = await client.prepareReleaseMaintenance(productId, 'promote', release)
    } catch (error) {
      notifyDownloadError(error instanceof Error ? error.message : UI_RELEASE_PROMOTE_ERROR_GENERIC)
      return
    }
    if (!retained.expected) {
      return
    }
    promoteMutation.mutate(
      {
        releaseId,
        operation: {
          operationId: retained.id,
          expected: retained.expected,
          scopeFingerprint: retained.scopeFingerprint,
        },
      },
      {
        onSuccess: () => {
          setShowPromoteConfirm(false)
          onCompleted?.()
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : UI_RELEASE_PROMOTE_ERROR_GENERIC
          const normalizedMessage =
            message === 'Release file is missing'
              ? UI_RELEASE_PROMOTE_ERROR_MISSING
              : message || UI_RELEASE_PROMOTE_ERROR_GENERIC
          notifyDownloadError(normalizedMessage)
        },
      }
    )
  }

  const handleConfirmDelete = async () => {
    if (!release) {
      notifyDownloadError('Refresh the displayed release before choosing its exact revision.')
      return
    }
    let retained: Awaited<ReturnType<Client['prepareReleaseMaintenance']>>
    try {
      retained = await client.prepareReleaseMaintenance(productId, 'delete', release)
    } catch (error) {
      notifyDownloadError(error instanceof Error ? error.message : 'Unable to prepare the retained delete operation.')
      return
    }
    if (!retained.expected) {
      return
    }
    deleteMutation.mutate(
      {
        releaseId,
        operation: {
          operationId: retained.id,
          expected: retained.expected,
          scopeFingerprint: retained.scopeFingerprint,
        },
      },
      {
        onSuccess: () => {
          setShowDeleteConfirm(false)
          onCompleted?.()
        },
      }
    )
  }

  const notifyDownloadError = (message: string) => {
    notificationBus.emit(NOTIFICATION_EVENT_TOAST, {
      titleKey: UI_RELEASE_DOWNLOAD_ERROR_GENERIC,
      message,
      variant: NOTIFICATION_VARIANT_ERROR,
    })
  }

  const repairMissing = async () => {
    if (!release || !repairFile || isRepairing) {
      return
    }
    setIsRepairing(true)
    repairForm.set('file', repairFile)
    try {
      const result = await client.repairReleaseMissing(productId, release, repairForm)
      if (!result.publication?.eligible) {
        notifyDownloadError('Repair recorded; current download eligibility remains held. Check its retained operation.')
      }
      onCompleted?.()
    } catch (error) {
      notifyDownloadError(
        `${error instanceof Error ? error.message : 'Repair outcome is unresolved.'} Original operation: ${String(repairForm.get('operationId') ?? 'not dispatched')}`
      )
    } finally {
      setIsRepairing(false)
    }
  }

  const parseDownloadErrorMessage = async (response: Response): Promise<string> => {
    if (response.status === 404) {
      return UI_RELEASE_DOWNLOAD_ERROR_MISSING
    }
    try {
      const body = (await response.json()) as {
        error?: { message?: string }
      }
      const apiMessage = body.error?.message
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage
      }
    } catch {
      // fallback to generic message
    }
    return UI_RELEASE_DOWNLOAD_ERROR_GENERIC
  }

  const handleDownload = async () => {
    if (!downloadUrl || isDownloading) {
      return
    }

    setIsDownloading(true)
    try {
      const authToken = client.getToken()
      const response = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      })
      if (!response.ok) {
        notifyDownloadError(await parseDownloadErrorMessage(response))
        return
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = releaseFileName
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(objectUrl)
    } catch {
      notifyDownloadError(UI_RELEASE_DOWNLOAD_ERROR_GENERIC)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Stack direction="row" gap={UI_STACK_GAP_SMALL}>
      {downloadUrl ? (
        <Button
          variant={UI_BUTTON_VARIANT_OUTLINE_SECONDARY}
          size={UI_SIZE_SMALL}
          onClick={() => {
            void handleDownload()
          }}
          disabled={isDownloading}
          aria-label={`${UI_RELEASE_ACTION_DOWNLOAD} ${releaseVersion}`}
        >
          {isDownloading ? UI_RELEASE_ACTION_DOWNLOADING : UI_RELEASE_ACTION_DOWNLOAD}
        </Button>
      ) : null}
      {showPromoteButton ? (
        <Button
          variant={UI_BUTTON_VARIANT_OUTLINE}
          size={UI_SIZE_SMALL}
          onClick={() => setShowPromoteConfirm(true)}
          disabled={promoteMutation.isPending}
          aria-label={`${UI_RELEASE_ACTION_PROMOTE} ${releaseVersion}`}
        >
          {promoteMutation.isPending ? UI_RELEASE_ACTION_PROMOTING : UI_RELEASE_ACTION_PROMOTE}
        </Button>
      ) : null}
      {showDeleteButton ? (
        <Button
          variant={UI_BUTTON_VARIANT_OUTLINE_DANGER}
          size={UI_SIZE_SMALL}
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteMutation.isPending}
          aria-label={`${UI_RELEASE_ACTION_DELETE} ${releaseVersion}`}
        >
          {deleteMutation.isPending ? UI_RELEASE_ACTION_DELETING : UI_RELEASE_ACTION_DELETE}
        </Button>
      ) : null}

      {allowPromote && release?.publicationState === 'READY' && release.publicationOperationId ? (
        <details>
          <summary>Repair missing artifact</summary>
          <p>
            Select the identical retained ZIP for this displayed revision. Existing or ambiguous objects are preserved.
          </p>
          <input
            type="file"
            accept=".zip"
            aria-label={`Identical repair ZIP ${releaseVersion}`}
            disabled={isRepairing}
            onChange={(event) => setRepairFile(event.currentTarget.files?.[0] ?? null)}
          />
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={!repairFile || isRepairing}
            onClick={() => {
              void repairMissing()
            }}
          >
            Repair missing artifact
          </Button>
        </details>
      ) : null}

      <ModalDialog
        show={showPromoteConfirm}
        onClose={() => setShowPromoteConfirm(false)}
        title={UI_RELEASE_CONFIRM_PROMOTE_TITLE}
        body={
          <p>
            {UI_RELEASE_CONFIRM_PROMOTE_BODY} ({UI_RELEASE_VERSION_PREFIX}
            {releaseVersion})
          </p>
        }
        primaryAction={{
          id: 'release-promote-confirm',
          label: promoteMutation.isPending ? UI_RELEASE_ACTION_PROMOTING : UI_RELEASE_ACTION_PROMOTE,
          onClick: handleConfirmPromote,
          disabled: promoteMutation.isPending,
        }}
        secondaryAction={{
          id: 'release-promote-cancel',
          label: UI_RELEASE_MODAL_CANCEL,
          onClick: () => setShowPromoteConfirm(false),
          variant: UI_BUTTON_VARIANT_SECONDARY,
        }}
      />

      <ModalDialog
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={UI_RELEASE_CONFIRM_DELETE_TITLE}
        body={
          <>
            <p className={UI_CLASS_MARGIN_BOTTOM_SMALL}>{UI_RELEASE_CONFIRM_DELETE_BODY}</p>
            <p className={UI_CLASS_TEXT_MUTED_SMALL_RESET}>
              {UI_RELEASE_VERSION_PREFIX}
              {releaseVersion} — {releaseFileName}
            </p>
          </>
        }
        primaryAction={{
          id: 'release-delete-confirm',
          label: deleteMutation.isPending ? UI_RELEASE_ACTION_DELETING : UI_RELEASE_CONFIRM_DELETE_BUTTON,
          onClick: handleConfirmDelete,
          disabled: deleteMutation.isPending,
          variant: UI_BUTTON_VARIANT_DANGER,
        }}
        secondaryAction={{
          id: 'release-delete-cancel',
          label: UI_RELEASE_MODAL_CANCEL,
          onClick: () => setShowDeleteConfirm(false),
          variant: UI_BUTTON_VARIANT_SECONDARY,
        }}
      />
    </Stack>
  )
}
