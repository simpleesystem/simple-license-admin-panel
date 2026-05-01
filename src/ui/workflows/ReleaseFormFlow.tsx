import { useState } from 'react'
import Form from 'react-bootstrap/Form'

import type { Client } from '@/simpleLicense'
import { ERROR_CODE_UPLOAD_TIMEOUT, RELEASE_UPLOAD_FIELD_NAME } from '../../simpleLicense/constants'
import { useCreateRelease } from '../../simpleLicense/hooks'
import {
  UI_BUTTON_VARIANT_SECONDARY,
  UI_RELEASE_FORM_ERROR_FALLBACK,
  UI_RELEASE_FORM_ERROR_TIMEOUT_HINT,
  UI_RELEASE_FORM_FIELD_CHANGELOG,
  UI_RELEASE_FORM_FIELD_FILE,
  UI_RELEASE_FORM_FIELD_PRERELEASE,
  UI_RELEASE_FORM_FIELD_VERSION,
  UI_RELEASE_FORM_PENDING,
  UI_RELEASE_FORM_SUBMIT,
  UI_RELEASE_FORM_TITLE,
  UI_RELEASE_FORM_VERSION_PLACEHOLDER,
  UI_RELEASE_MODAL_CANCEL,
} from '../constants'
import { ModalDialog } from '../overlay/ModalDialog'

type ReleaseFormFlowProps = {
  client: Client
  productId: string
  show: boolean
  onClose: () => void
  onSuccess?: () => void
  onError?: () => void
}

export function ReleaseFormFlow({ client, productId, show, onClose, onSuccess, onError }: ReleaseFormFlowProps) {
  const createReleaseMutation = useCreateRelease(client, productId)
  const [version, setVersion] = useState('')
  const [changelog, setChangelog] = useState('')
  const [isPrerelease, setIsPrerelease] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorHint, setErrorHint] = useState<string | null>(null)

  const resetForm = () => {
    setVersion('')
    setChangelog('')
    setIsPrerelease(false)
    setFile(null)
    setErrorMessage(null)
    setErrorHint(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    if (!productId || !version.trim() || !file) {
      return
    }
    setErrorMessage(null)
    setErrorHint(null)
    const formData = new FormData()
    formData.append(RELEASE_UPLOAD_FIELD_NAME, file)
    formData.append('version', version.trim())
    if (changelog.trim()) {
      formData.append('changelogMd', changelog.trim())
    }
    formData.append('isPrerelease', String(isPrerelease))
    createReleaseMutation.mutate(formData, {
      onSuccess: () => {
        resetForm()
        onClose()
        onSuccess?.()
      },
      onError: (error) => {
        const nextMessage =
          error instanceof Error && error.message.trim().length > 0 ? error.message : UI_RELEASE_FORM_ERROR_FALLBACK
        const errorCode =
          typeof error === 'object' && error !== null && 'errorCode' in error && typeof error.errorCode === 'string'
            ? error.errorCode
            : ''
        setErrorMessage(nextMessage)
        setErrorHint(errorCode === ERROR_CODE_UPLOAD_TIMEOUT ? UI_RELEASE_FORM_ERROR_TIMEOUT_HINT : null)
        onError?.()
      },
    })
  }

  return (
    <ModalDialog
      show={show}
      onClose={handleClose}
      title={UI_RELEASE_FORM_TITLE}
      body={
        <>
          {errorMessage ? (
            <div className="alert alert-danger" role="alert">
              <div>{errorMessage}</div>
              {errorHint ? <div className="small mt-1">{errorHint}</div> : null}
            </div>
          ) : null}
          <Form.Group className="mb-3">
            <Form.Label>{UI_RELEASE_FORM_FIELD_VERSION}</Form.Label>
            <Form.Control
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder={UI_RELEASE_FORM_VERSION_PLACEHOLDER}
              aria-label={UI_RELEASE_FORM_FIELD_VERSION}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{UI_RELEASE_FORM_FIELD_FILE}</Form.Label>
            <Form.Control
              type="file"
              accept=".zip"
              onChange={(e) => {
                const next = (e.target as HTMLInputElement).files?.[0]
                setFile(next ?? null)
              }}
              aria-label={UI_RELEASE_FORM_FIELD_FILE}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{UI_RELEASE_FORM_FIELD_CHANGELOG}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              aria-label={UI_RELEASE_FORM_FIELD_CHANGELOG}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="release-prerelease"
              label={UI_RELEASE_FORM_FIELD_PRERELEASE}
              checked={isPrerelease}
              onChange={(e) => setIsPrerelease((e.target as HTMLInputElement).checked)}
            />
          </Form.Group>
        </>
      }
      primaryAction={{
        id: 'release-upload-submit',
        label: createReleaseMutation.isPending ? UI_RELEASE_FORM_PENDING : UI_RELEASE_FORM_SUBMIT,
        onClick: handleSubmit,
        disabled: !version.trim() || !file || createReleaseMutation.isPending,
      }}
      secondaryAction={{
        id: 'release-upload-cancel',
        label: UI_RELEASE_MODAL_CANCEL,
        onClick: handleClose,
        variant: UI_BUTTON_VARIANT_SECONDARY,
      }}
    />
  )
}
