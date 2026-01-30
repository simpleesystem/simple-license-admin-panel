import { useMemo, useState } from 'react'
import { Button, Form, Table } from 'react-bootstrap'
import { useApiClient } from '../../api/apiContext'
import { isProductOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import { RELEASE_UPLOAD_FIELD_NAME } from '../../simpleLicense/constants'
import { useAdminProducts, useAdminReleases, useCreateRelease } from '../../simpleLicense/hooks'
import {
  UI_PAGE_SUBTITLE_RELEASES,
  UI_PAGE_TITLE_RELEASES,
  UI_RELEASE_BUTTON_NEW,
  UI_RELEASE_COLUMN_CREATED,
  UI_RELEASE_COLUMN_FILE,
  UI_RELEASE_COLUMN_SIZE,
  UI_RELEASE_COLUMN_VERSION,
  UI_RELEASE_EMPTY_MESSAGE,
  UI_RELEASE_FORM_FIELD_CHANGELOG,
  UI_RELEASE_FORM_FIELD_FILE,
  UI_RELEASE_FORM_FIELD_PRERELEASE,
  UI_RELEASE_FORM_FIELD_VERSION,
  UI_RELEASE_FORM_PENDING,
  UI_RELEASE_FORM_SUBMIT,
  UI_RELEASE_FORM_TITLE,
  UI_RELEASE_FORM_VERSION_PLACEHOLDER,
  UI_RELEASE_MODAL_CANCEL,
  UI_RELEASE_SELECT_PRODUCT_BODY,
  UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER,
  UI_RELEASE_STATUS_ACTION_RETRY,
  UI_RELEASE_STATUS_ERROR_BODY,
  UI_RELEASE_STATUS_ERROR_TITLE,
  UI_RELEASE_STATUS_LOADING_BODY,
  UI_RELEASE_STATUS_LOADING_TITLE,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { Stack } from '../../ui/layout/Stack'
import { ModalDialog } from '../../ui/overlay/ModalDialog'
import type { UiSelectOption } from '../../ui/types'
import { EmptyState } from '../../ui/typography/EmptyState'
import { formatDate as formatReleaseDate } from '../../utils/date'

export function ReleasesRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data: productsData } = useAdminProducts(client)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createVersion, setCreateVersion] = useState('')
  const [createChangelog, setCreateChangelog] = useState('')
  const [createIsPrerelease, setCreateIsPrerelease] = useState(false)
  const [createFile, setCreateFile] = useState<File | null>(null)

  const productOptions = useMemo((): UiSelectOption[] => {
    const list = Array.isArray(productsData) ? productsData : (productsData?.data ?? [])
    let filtered = list
    if (currentUser && isVendorScopedUser(currentUser)) {
      filtered = list.filter((p) => isProductOwnedByUser(currentUser, p))
    }
    return filtered.map((p) => ({ value: p.id, label: `${p.name} (${p.slug})` }))
  }, [productsData, currentUser])

  const {
    data: releasesData,
    isLoading: releasesLoading,
    isError: releasesError,
    refetch: refetchReleases,
  } = useAdminReleases(client, selectedProductId, { enabled: Boolean(selectedProductId) })

  const createReleaseMutation = useCreateRelease(client, selectedProductId)

  const releases = Array.isArray(releasesData) ? releasesData : []

  const handleCreateSubmit = () => {
    if (!selectedProductId || !createVersion.trim() || !createFile) {
      return
    }
    const formData = new FormData()
    formData.append(RELEASE_UPLOAD_FIELD_NAME, createFile)
    formData.append('version', createVersion.trim())
    if (createChangelog.trim()) {
      formData.append('changelogMd', createChangelog.trim())
    }
    formData.append('isPrerelease', String(createIsPrerelease))
    createReleaseMutation.mutate(formData, {
      onSuccess: () => {
        setShowCreateModal(false)
        setCreateVersion('')
        setCreateChangelog('')
        setCreateIsPrerelease(false)
        setCreateFile(null)
      },
    })
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
    setCreateVersion('')
    setCreateChangelog('')
    setCreateIsPrerelease(false)
    setCreateFile(null)
  }

  const formatReleaseDateSafe = (dateStr: string) => {
    try {
      return formatReleaseDate(dateStr)
    } catch {
      return dateStr
    }
  }

  return (
    <Page>
      <Stack direction="column" gap="medium">
        <PageHeader title={UI_PAGE_TITLE_RELEASES} subtitle={UI_PAGE_SUBTITLE_RELEASES} />
        <Form.Group className="mb-3">
          <Form.Label>{UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER}</Form.Label>
          <Form.Select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            aria-label={UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER}
          >
            <option value="">{UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER}</option>
            {productOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {!selectedProductId && (
          <EmptyState title={UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER} body={UI_RELEASE_SELECT_PRODUCT_BODY} />
        )}

        {selectedProductId && releasesLoading && (
          <SectionStatus
            status={UI_SECTION_STATUS_LOADING}
            title={UI_RELEASE_STATUS_LOADING_TITLE}
            message={UI_RELEASE_STATUS_LOADING_BODY}
          />
        )}

        {selectedProductId && releasesError && (
          <SectionStatus
            status={UI_SECTION_STATUS_ERROR}
            title={UI_RELEASE_STATUS_ERROR_TITLE}
            message={UI_RELEASE_STATUS_ERROR_BODY}
            actions={
              <Button variant="secondary" size="sm" onClick={() => refetchReleases()}>
                {UI_RELEASE_STATUS_ACTION_RETRY}
              </Button>
            }
          />
        )}

        {selectedProductId && !releasesLoading && !releasesError && (
          <>
            <div className="d-flex justify-content-between align-items-center">
              <span />
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                {UI_RELEASE_BUTTON_NEW}
              </Button>
            </div>
            {releases.length === 0 ? (
              <EmptyState title={UI_RELEASE_EMPTY_MESSAGE} body={UI_RELEASE_EMPTY_MESSAGE} />
            ) : (
              <Table striped={true} bordered={true} hover={true} responsive={true}>
                <thead>
                  <tr>
                    <th>{UI_RELEASE_COLUMN_VERSION}</th>
                    <th>{UI_RELEASE_COLUMN_FILE}</th>
                    <th>{UI_RELEASE_COLUMN_SIZE}</th>
                    <th>{UI_RELEASE_COLUMN_CREATED}</th>
                  </tr>
                </thead>
                <tbody>
                  {releases.map((rel) => (
                    <tr key={rel.id}>
                      <td>{rel.version}</td>
                      <td>{rel.fileName}</td>
                      <td>{rel.sizeBytes != null ? `${Number(rel.sizeBytes).toLocaleString()} B` : '—'}</td>
                      <td>{formatReleaseDateSafe(rel.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Stack>

      <ModalDialog
        show={showCreateModal}
        onClose={handleCloseCreateModal}
        title={UI_RELEASE_FORM_TITLE}
        body={
          <>
            <Form.Group className="mb-3">
              <Form.Label>{UI_RELEASE_FORM_FIELD_VERSION}</Form.Label>
              <Form.Control
                type="text"
                value={createVersion}
                onChange={(e) => setCreateVersion(e.target.value)}
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
                  const file = (e.target as HTMLInputElement).files?.[0]
                  setCreateFile(file ?? null)
                }}
                aria-label={UI_RELEASE_FORM_FIELD_FILE}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{UI_RELEASE_FORM_FIELD_CHANGELOG}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={createChangelog}
                onChange={(e) => setCreateChangelog(e.target.value)}
                aria-label={UI_RELEASE_FORM_FIELD_CHANGELOG}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="release-prerelease"
                label={UI_RELEASE_FORM_FIELD_PRERELEASE}
                checked={createIsPrerelease}
                onChange={(e) => setCreateIsPrerelease((e.target as HTMLInputElement).checked)}
              />
            </Form.Group>
          </>
        }
        primaryAction={{
          id: 'release-upload-submit',
          label: createReleaseMutation.isPending ? UI_RELEASE_FORM_PENDING : UI_RELEASE_FORM_SUBMIT,
          onClick: handleCreateSubmit,
          disabled: !createVersion.trim() || !createFile || createReleaseMutation.isPending,
        }}
        secondaryAction={{
          id: 'release-upload-cancel',
          label: UI_RELEASE_MODAL_CANCEL,
          onClick: handleCloseCreateModal,
          variant: 'secondary',
        }}
      />
    </Page>
  )
}
