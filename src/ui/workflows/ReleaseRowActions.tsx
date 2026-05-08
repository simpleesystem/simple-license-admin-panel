import { useState } from 'react'
import Button from 'react-bootstrap/Button'

import type { Client } from '@/simpleLicense'

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
  UI_RELEASE_MODAL_CANCEL,
  UI_RELEASE_VERSION_PREFIX,
  UI_SIZE_SMALL,
  UI_STACK_GAP_SMALL,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'

type ReleaseRowActionsProps = {
  client: Client
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

export function ReleaseRowActions({
  client,
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

  const showPromoteButton = allowPromote && !isPromoted
  const showDeleteButton = allowDelete

  if (!showPromoteButton && !showDeleteButton && !downloadUrl) {
    return null
  }

  const handleConfirmPromote = () => {
    promoteMutation.mutate(releaseId, {
      onSuccess: () => {
        setShowPromoteConfirm(false)
        onCompleted?.()
      },
    })
  }

  const handleConfirmDelete = () => {
    deleteMutation.mutate(releaseId, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
        onCompleted?.()
      },
    })
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
        throw new Error(`Download failed with status ${response.status}`)
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
