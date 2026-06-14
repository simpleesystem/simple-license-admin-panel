import { type ReactNode, useEffect, useRef, useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client, ProtectionBuildTokenMetadata, User } from '@/simpleLicense'
import { useDeleteProduct, useResumeProduct, useSuspendProduct } from '@/simpleLicense'
import { canDeleteProduct, canUpdateProduct } from '../../app/auth/permissions'
import { isSystemAdminUser } from '../../app/auth/userUtils'
import { useNotificationBus } from '../../notifications/useNotificationBus'
import { adaptMutation } from '../actions/mutationAdapter'
import {
  UI_BUTTON_VARIANT_GHOST,
  UI_PRODUCT_ACTION_BUILD_TOKENS,
  UI_PRODUCT_ACTION_DELETE,
  UI_PRODUCT_ACTION_EDIT,
  UI_PRODUCT_ACTION_PROTECTION_KEY,
  UI_PRODUCT_ACTION_RESUME,
  UI_PRODUCT_ACTION_SUSPEND,
  UI_PRODUCT_BUILD_TOKEN_DEFAULT_EXPIRY_DAYS,
  UI_PRODUCT_BUILD_TOKENS_CLOSE,
  UI_PRODUCT_BUILD_TOKENS_CURRENT,
  UI_PRODUCT_BUILD_TOKENS_EMPTY,
  UI_PRODUCT_BUILD_TOKENS_ERROR,
  UI_PRODUCT_BUILD_TOKENS_ISSUE,
  UI_PRODUCT_BUILD_TOKENS_ISSUING,
  UI_PRODUCT_BUILD_TOKENS_LABEL_EXPIRES,
  UI_PRODUCT_BUILD_TOKENS_LABEL_ISSUED_TOKEN,
  UI_PRODUCT_BUILD_TOKENS_LABEL_LAST_USED,
  UI_PRODUCT_BUILD_TOKENS_LABEL_PREFIX,
  UI_PRODUCT_BUILD_TOKENS_LABEL_RELEASE_ENDPOINT,
  UI_PRODUCT_BUILD_TOKENS_LABEL_STATUS,
  UI_PRODUCT_BUILD_TOKENS_LABEL_USAGE_NOTE,
  UI_PRODUCT_BUILD_TOKENS_LOADING,
  UI_PRODUCT_BUILD_TOKENS_MODAL_TITLE,
  UI_PRODUCT_BUILD_TOKENS_RELEASE_ENDPOINT,
  UI_PRODUCT_BUILD_TOKENS_REVOKE,
  UI_PRODUCT_BUILD_TOKENS_REVOKING,
  UI_PRODUCT_BUILD_TOKENS_STATUS_ACTIVE,
  UI_PRODUCT_BUILD_TOKENS_STATUS_EXPIRED,
  UI_PRODUCT_BUILD_TOKENS_STATUS_REVOKED,
  UI_PRODUCT_BUILD_TOKENS_TOKEN_ONCE,
  UI_PRODUCT_BUILD_TOKENS_USAGE_NOTE,
  UI_PRODUCT_BUTTON_BUILD_TOKENS,
  UI_PRODUCT_BUTTON_DELETE,
  UI_PRODUCT_BUTTON_PROTECTION_KEY,
  UI_PRODUCT_BUTTON_RESUME,
  UI_PRODUCT_BUTTON_SUSPEND,
  UI_PRODUCT_CONFIRM_DELETE_BODY,
  UI_PRODUCT_CONFIRM_DELETE_CANCEL,
  UI_PRODUCT_CONFIRM_DELETE_CONFIRM,
  UI_PRODUCT_CONFIRM_DELETE_TITLE,
  UI_PRODUCT_CONFIRM_RESUME_BODY,
  UI_PRODUCT_CONFIRM_RESUME_CANCEL,
  UI_PRODUCT_CONFIRM_RESUME_CONFIRM,
  UI_PRODUCT_CONFIRM_RESUME_TITLE,
  UI_PRODUCT_CONFIRM_SUSPEND_BODY,
  UI_PRODUCT_CONFIRM_SUSPEND_CANCEL,
  UI_PRODUCT_CONFIRM_SUSPEND_CONFIRM,
  UI_PRODUCT_CONFIRM_SUSPEND_TITLE,
  UI_PRODUCT_PROTECTION_KEY_CLOSE,
  UI_PRODUCT_PROTECTION_KEY_ERROR,
  UI_PRODUCT_PROTECTION_KEY_LABEL_PRODUCT,
  UI_PRODUCT_PROTECTION_KEY_LABEL_PUBLIC_KEY,
  UI_PRODUCT_PROTECTION_KEY_LABEL_SIGNING_KEY_ID,
  UI_PRODUCT_PROTECTION_KEY_LOADING,
  UI_PRODUCT_PROTECTION_KEY_MODAL_TITLE,
  UI_STACK_GAP_SMALL,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableControls } from '../data/TableControls'
import { TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS, useTableBatchBus } from '../data/tableBatchBus'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps, UiDataTableColumn, UiDataTableSelection } from '../types'
import { KeyValueList } from '../typography/KeyValueList'
import { VisibilityGate } from '../utils/PermissionGate'
import { notifyCrudError, notifyProductSuccess } from './notifications'

type ProductRowActionsProps = UiCommonProps & {
  client: Client
  productId: string
  productSlug?: string
  isActive: boolean
  vendorId: string
  onEdit?: (product: { id: string }) => void
  onCompleted?: () => void
  currentUser?: User | null
}

type ProtectionKeyMetadata = {
  productSlug: string
  signingKeyId: string
  publicKey: string
}

export function ProductRowActions({
  client,
  productId,
  productSlug = '',
  isActive,
  vendorId,
  onEdit,
  onCompleted,
  currentUser,
  ...rest
}: ProductRowActionsProps) {
  const deleteMutation = adaptMutation(useDeleteProduct(client))
  const suspendMutation = adaptMutation(useSuspendProduct(client))
  const resumeMutation = adaptMutation(useResumeProduct(client))
  const notificationBus = useNotificationBus()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false)
  const [showResumeConfirm, setShowResumeConfirm] = useState(false)
  const [showProtectionKeyModal, setShowProtectionKeyModal] = useState(false)
  const [isProtectionKeyLoading, setIsProtectionKeyLoading] = useState(false)
  const [protectionKeyError, setProtectionKeyError] = useState<string | null>(null)
  const [protectionKeyMetadata, setProtectionKeyMetadata] = useState<ProtectionKeyMetadata | null>(null)
  const [showBuildTokensModal, setShowBuildTokensModal] = useState(false)
  const [isBuildTokensLoading, setIsBuildTokensLoading] = useState(false)
  const [isIssuingBuildToken, setIsIssuingBuildToken] = useState(false)
  const [revokingBuildTokenId, setRevokingBuildTokenId] = useState<string | null>(null)
  const [buildTokensError, setBuildTokensError] = useState<string | null>(null)
  const [buildTokens, setBuildTokens] = useState<ProtectionBuildTokenMetadata[]>([])
  const [issuedBuildToken, setIssuedBuildToken] = useState<string | null>(null)

  const allowUpdate = canUpdateProduct(currentUser ?? null)
  const allowDelete = canDeleteProduct(currentUser ?? null)
  const isSystemAdmin = isSystemAdminUser(currentUser ?? null)

  // Check ownership for non-admin users
  const ownsProduct = isSystemAdmin || currentUser?.vendorId === vendorId

  // Only show buttons if user has permissions and owns the product (or is system admin)
  const canShowButtons = (allowDelete || allowUpdate) && (ownsProduct || isSystemAdmin)

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(productId)
      notifyProductSuccess(notificationBus, 'delete')
      onCompleted?.()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  const handleSuspend = async () => {
    try {
      await suspendMutation.mutateAsync(productId)
      notifyProductSuccess(notificationBus, 'suspend')
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
      await resumeMutation.mutateAsync(productId)
      notifyProductSuccess(notificationBus, 'resume')
      onCompleted?.()
    } catch (error) {
      notifyCrudError(notificationBus)
      throw error
    } finally {
      setShowResumeConfirm(false)
    }
  }

  // Epochs increment when their modal closes, so slow responses resolving
  // after close can't reapply loading/error/data state to a hidden modal.
  const protectionKeyEpochRef = useRef(0)
  const buildTokensEpochRef = useRef(0)

  const handleOpenProtectionKey = async () => {
    const epoch = protectionKeyEpochRef.current
    const isCurrent = () => protectionKeyEpochRef.current === epoch

    setShowProtectionKeyModal(true)
    setIsProtectionKeyLoading(true)
    setProtectionKeyError(null)
    setProtectionKeyMetadata(null)
    if (productSlug.trim().length === 0) {
      setProtectionKeyError(UI_PRODUCT_PROTECTION_KEY_ERROR)
      setIsProtectionKeyLoading(false)
      return
    }
    try {
      const signingMetadata = await client.getProtectionSigningPublicKey(productSlug)
      if (!isCurrent()) {
        return
      }
      setProtectionKeyMetadata({
        productSlug: signingMetadata.product_slug,
        signingKeyId: signingMetadata.signing_key_id,
        publicKey: signingMetadata.public_key,
      })
    } catch {
      if (isCurrent()) {
        setProtectionKeyError(UI_PRODUCT_PROTECTION_KEY_ERROR)
      }
    } finally {
      if (isCurrent()) {
        setIsProtectionKeyLoading(false)
      }
    }
  }

  const loadBuildTokens = async () => {
    const epoch = buildTokensEpochRef.current
    const isCurrent = () => buildTokensEpochRef.current === epoch

    setIsBuildTokensLoading(true)
    setBuildTokensError(null)
    try {
      const response = await client.listProtectionBuildTokens(productId)
      if (isCurrent()) {
        setBuildTokens(Array.isArray(response.tokens) ? response.tokens : [])
      }
    } catch {
      if (isCurrent()) {
        setBuildTokensError(UI_PRODUCT_BUILD_TOKENS_ERROR)
      }
    } finally {
      if (isCurrent()) {
        setIsBuildTokensLoading(false)
      }
    }
  }

  const handleOpenBuildTokens = async () => {
    setShowBuildTokensModal(true)
    setIssuedBuildToken(null)
    await loadBuildTokens()
  }

  const handleIssueBuildToken = async () => {
    setIsIssuingBuildToken(true)
    setBuildTokensError(null)
    try {
      const response = await client.issueProtectionBuildToken(productId, {
        expires_in_days: UI_PRODUCT_BUILD_TOKEN_DEFAULT_EXPIRY_DAYS,
      })
      setIssuedBuildToken(response.token)
      await loadBuildTokens()
    } catch {
      setBuildTokensError(UI_PRODUCT_BUILD_TOKENS_ERROR)
    } finally {
      setIsIssuingBuildToken(false)
    }
  }

  const handleRevokeBuildToken = async (tokenId: string) => {
    setRevokingBuildTokenId(tokenId)
    setBuildTokensError(null)
    try {
      await client.revokeProtectionBuildToken(productId, tokenId)
      await loadBuildTokens()
    } catch {
      setBuildTokensError(UI_PRODUCT_BUILD_TOKENS_ERROR)
    } finally {
      setRevokingBuildTokenId(null)
    }
  }

  const getBuildTokenStatusLabel = (token: ProtectionBuildTokenMetadata): string => {
    if (token.revoked_at !== null) {
      return UI_PRODUCT_BUILD_TOKENS_STATUS_REVOKED
    }
    if (token.expires_at !== null) {
      const expiresAtMs = Date.parse(token.expires_at)
      if (!Number.isNaN(expiresAtMs) && expiresAtMs <= Date.now()) {
        return UI_PRODUCT_BUILD_TOKENS_STATUS_EXPIRED
      }
    }
    return UI_PRODUCT_BUILD_TOKENS_STATUS_ACTIVE
  }

  const getOptionalTimestamp = (value: string | null): string => value ?? UI_VALUE_PLACEHOLDER

  const { selection, batchBar, clearSelection } = useTableBatchBus<
    ProtectionBuildTokenMetadata,
    typeof TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS
  >({
    tableId: TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS,
    enabled: showBuildTokensModal && allowUpdate && ownsProduct,
    visibleRows: buildTokens,
    rowKey: (row) => row.id,
    context: { client, productId, onRefresh: () => void loadBuildTokens() },
  })

  useEffect(() => {
    if (!showBuildTokensModal) {
      clearSelection()
    }
  }, [clearSelection, showBuildTokensModal])

  const buildTokenColumns: UiDataTableColumn<ProtectionBuildTokenMetadata>[] = [
    {
      id: 'build-token-prefix',
      header: UI_PRODUCT_BUILD_TOKENS_LABEL_PREFIX,
      cell: (row) => <code>{row.token_prefix}</code>,
    },
    {
      id: 'build-token-status',
      header: UI_PRODUCT_BUILD_TOKENS_LABEL_STATUS,
      cell: (row) => getBuildTokenStatusLabel(row),
    },
    {
      id: 'build-token-expires',
      header: UI_PRODUCT_BUILD_TOKENS_LABEL_EXPIRES,
      cell: (row) => getOptionalTimestamp(row.expires_at),
    },
    {
      id: 'build-token-last-used',
      header: UI_PRODUCT_BUILD_TOKENS_LABEL_LAST_USED,
      cell: (row) => getOptionalTimestamp(row.last_used_at),
    },
    {
      id: 'build-token-actions',
      header: UI_PRODUCT_BUILD_TOKENS_REVOKE,
      cell: (row) => {
        const tokenStatusLabel = getBuildTokenStatusLabel(row)
        const isTokenRevokable = tokenStatusLabel === UI_PRODUCT_BUILD_TOKENS_STATUS_ACTIVE
        return (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => {
              void handleRevokeBuildToken(row.id)
            }}
            disabled={!isTokenRevokable || revokingBuildTokenId === row.id}
          >
            {revokingBuildTokenId === row.id ? UI_PRODUCT_BUILD_TOKENS_REVOKING : UI_PRODUCT_BUILD_TOKENS_REVOKE}
          </Button>
        )
      },
    },
  ]

  if (!canShowButtons) {
    return null
  }

  return (
    <VisibilityGate
      ability={rest.ability}
      permissionKey={rest.permissionKey}
      permissionFallback={rest.permissionFallback}
    >
      <Stack direction="row" gap={UI_STACK_GAP_SMALL} {...rest}>
        {allowUpdate && ownsProduct ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => onEdit?.({ id: productId })}
            aria-label={UI_PRODUCT_ACTION_EDIT}
          >
            {UI_PRODUCT_ACTION_EDIT}
          </Button>
        ) : null}

        {allowUpdate && ownsProduct ? (
          isActive ? (
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => setShowSuspendConfirm(true)}
              disabled={suspendMutation.isPending}
              aria-label={UI_PRODUCT_ACTION_SUSPEND}
            >
              {UI_PRODUCT_BUTTON_SUSPEND}
            </Button>
          ) : (
            <Button
              variant={UI_BUTTON_VARIANT_GHOST}
              onClick={() => setShowResumeConfirm(true)}
              disabled={resumeMutation.isPending}
              aria-label={UI_PRODUCT_ACTION_RESUME}
            >
              {UI_PRODUCT_BUTTON_RESUME}
            </Button>
          )
        ) : null}

        {allowDelete && ownsProduct ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteMutation.isPending}
            aria-label={UI_PRODUCT_ACTION_DELETE}
          >
            {UI_PRODUCT_BUTTON_DELETE}
          </Button>
        ) : null}

        {allowUpdate && ownsProduct ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => {
              void handleOpenProtectionKey()
            }}
            disabled={isProtectionKeyLoading}
            aria-label={UI_PRODUCT_ACTION_PROTECTION_KEY}
          >
            {UI_PRODUCT_BUTTON_PROTECTION_KEY}
          </Button>
        ) : null}

        {allowUpdate && ownsProduct ? (
          <Button
            variant={UI_BUTTON_VARIANT_GHOST}
            onClick={() => {
              void handleOpenBuildTokens()
            }}
            disabled={isBuildTokensLoading || isIssuingBuildToken}
            aria-label={UI_PRODUCT_ACTION_BUILD_TOKENS}
          >
            {UI_PRODUCT_BUTTON_BUILD_TOKENS}
          </Button>
        ) : null}

        <ProtectionKeyModal
          show={showProtectionKeyModal}
          isLoading={isProtectionKeyLoading}
          error={protectionKeyError}
          metadata={protectionKeyMetadata}
          onClose={() => {
            protectionKeyEpochRef.current += 1
            setShowProtectionKeyModal(false)
          }}
        />

        <BuildTokensModal
          show={showBuildTokensModal}
          isLoading={isBuildTokensLoading}
          error={buildTokensError}
          isIssuing={isIssuingBuildToken}
          issuedToken={issuedBuildToken}
          tokens={buildTokens}
          columns={buildTokenColumns}
          selection={selection}
          batchBar={batchBar}
          onIssue={() => {
            void handleIssueBuildToken()
          }}
          onClose={() => {
            buildTokensEpochRef.current += 1
            setShowBuildTokensModal(false)
          }}
        />

        <ModalDialog
          show={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          title={UI_PRODUCT_CONFIRM_SUSPEND_TITLE}
          body={UI_PRODUCT_CONFIRM_SUSPEND_BODY}
          primaryAction={{
            id: 'suspend-confirm',
            label: UI_PRODUCT_CONFIRM_SUSPEND_CONFIRM,
            onClick: handleSuspend,
            disabled: suspendMutation.isPending,
          }}
          secondaryAction={{
            id: 'suspend-cancel',
            label: UI_PRODUCT_CONFIRM_SUSPEND_CANCEL,
            onClick: () => setShowSuspendConfirm(false),
          }}
        />

        <ModalDialog
          show={showResumeConfirm}
          onClose={() => setShowResumeConfirm(false)}
          title={UI_PRODUCT_CONFIRM_RESUME_TITLE}
          body={UI_PRODUCT_CONFIRM_RESUME_BODY}
          primaryAction={{
            id: 'resume-confirm',
            label: UI_PRODUCT_CONFIRM_RESUME_CONFIRM,
            onClick: handleResume,
            disabled: resumeMutation.isPending,
          }}
          secondaryAction={{
            id: 'resume-cancel',
            label: UI_PRODUCT_CONFIRM_RESUME_CANCEL,
            onClick: () => setShowResumeConfirm(false),
          }}
        />

        <ModalDialog
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title={UI_PRODUCT_CONFIRM_DELETE_TITLE}
          body={UI_PRODUCT_CONFIRM_DELETE_BODY}
          primaryAction={{
            id: 'delete-confirm',
            label: UI_PRODUCT_CONFIRM_DELETE_CONFIRM,
            onClick: handleDelete,
            disabled: deleteMutation.isPending,
          }}
          secondaryAction={{
            id: 'delete-cancel',
            label: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
            onClick: () => setShowDeleteConfirm(false),
          }}
        />
      </Stack>
    </VisibilityGate>
  )
}

type ProtectionKeyModalProps = {
  show: boolean
  isLoading: boolean
  error: string | null
  metadata: ProtectionKeyMetadata | null
  onClose: () => void
}

function ProtectionKeyModal({ show, isLoading, error, metadata, onClose }: ProtectionKeyModalProps) {
  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_PRODUCT_PROTECTION_KEY_MODAL_TITLE}
      body={
        isLoading ? (
          UI_PRODUCT_PROTECTION_KEY_LOADING
        ) : error ? (
          error
        ) : (
          <KeyValueList
            items={[
              {
                id: 'protection-product',
                label: UI_PRODUCT_PROTECTION_KEY_LABEL_PRODUCT,
                value: <code>{metadata?.productSlug ?? UI_VALUE_PLACEHOLDER}</code>,
              },
              {
                id: 'protection-signing-key-id',
                label: UI_PRODUCT_PROTECTION_KEY_LABEL_SIGNING_KEY_ID,
                value: <code>{metadata?.signingKeyId ?? UI_VALUE_PLACEHOLDER}</code>,
              },
              {
                id: 'protection-public-key',
                label: UI_PRODUCT_PROTECTION_KEY_LABEL_PUBLIC_KEY,
                value: <code>{metadata?.publicKey ?? UI_VALUE_PLACEHOLDER}</code>,
              },
            ]}
          />
        )
      }
      secondaryAction={{
        id: 'protection-key-close',
        label: UI_PRODUCT_PROTECTION_KEY_CLOSE,
        onClick: onClose,
      }}
    />
  )
}

type BuildTokensModalProps = {
  show: boolean
  isLoading: boolean
  error: string | null
  isIssuing: boolean
  issuedToken: string | null
  tokens: readonly ProtectionBuildTokenMetadata[]
  columns: readonly UiDataTableColumn<ProtectionBuildTokenMetadata>[]
  selection?: UiDataTableSelection<ProtectionBuildTokenMetadata>
  batchBar: ReactNode
  onIssue: () => void
  onClose: () => void
}

function BuildTokensModal({
  show,
  isLoading,
  error,
  isIssuing,
  issuedToken,
  tokens,
  columns,
  selection,
  batchBar,
  onIssue,
  onClose,
}: BuildTokensModalProps) {
  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_PRODUCT_BUILD_TOKENS_MODAL_TITLE}
      body={
        isLoading ? (
          UI_PRODUCT_BUILD_TOKENS_LOADING
        ) : error ? (
          error
        ) : (
          <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
            <Button variant={UI_BUTTON_VARIANT_GHOST} onClick={onIssue} disabled={isIssuing}>
              {isIssuing ? UI_PRODUCT_BUILD_TOKENS_ISSUING : UI_PRODUCT_BUILD_TOKENS_ISSUE}
            </Button>
            {issuedToken !== null ? (
              <KeyValueList
                items={[
                  {
                    id: 'build-token-issued',
                    label: UI_PRODUCT_BUILD_TOKENS_LABEL_ISSUED_TOKEN,
                    value: <code>{issuedToken}</code>,
                  },
                ]}
              />
            ) : null}
            <div>{UI_PRODUCT_BUILD_TOKENS_TOKEN_ONCE}</div>
            <KeyValueList
              items={[
                {
                  id: 'build-token-usage-note',
                  label: UI_PRODUCT_BUILD_TOKENS_LABEL_USAGE_NOTE,
                  value: UI_PRODUCT_BUILD_TOKENS_USAGE_NOTE,
                },
                {
                  id: 'build-token-release-endpoint',
                  label: UI_PRODUCT_BUILD_TOKENS_LABEL_RELEASE_ENDPOINT,
                  value: <code>{UI_PRODUCT_BUILD_TOKENS_RELEASE_ENDPOINT}</code>,
                },
              ]}
            />
            <div>{UI_PRODUCT_BUILD_TOKENS_CURRENT}</div>
            <TableControls batch={batchBar} />
            <DataTable
              data={tokens}
              columns={columns}
              rowKey={(row) => row.id}
              emptyState={UI_PRODUCT_BUILD_TOKENS_EMPTY}
              isLoading={isLoading}
              selection={selection}
            />
          </Stack>
        )
      }
      secondaryAction={{
        id: 'build-tokens-close',
        label: UI_PRODUCT_BUILD_TOKENS_CLOSE,
        onClick: onClose,
      }}
    />
  )
}
