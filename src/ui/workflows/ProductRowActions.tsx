import { useState } from 'react'
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
  UI_PRODUCT_BUILD_TOKENS_LABEL_LAST_USED,
  UI_PRODUCT_BUILD_TOKENS_LABEL_PREFIX,
  UI_PRODUCT_BUILD_TOKENS_LABEL_STATUS,
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
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiCommonProps } from '../types'
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
  const [protectionKeyMetadata, setProtectionKeyMetadata] = useState<{
    productSlug: string
    signingKeyId: string
    publicKey: string
  } | null>(null)
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

  const handleOpenProtectionKey = async () => {
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
      setProtectionKeyMetadata({
        productSlug: signingMetadata.product_slug,
        signingKeyId: signingMetadata.signing_key_id,
        publicKey: signingMetadata.public_key,
      })
    } catch {
      setProtectionKeyError(UI_PRODUCT_PROTECTION_KEY_ERROR)
    } finally {
      setIsProtectionKeyLoading(false)
    }
  }

  const loadBuildTokens = async () => {
    setIsBuildTokensLoading(true)
    setBuildTokensError(null)
    try {
      const response = await client.listProtectionBuildTokens(productId)
      setBuildTokens(Array.isArray(response.tokens) ? response.tokens : [])
    } catch {
      setBuildTokensError(UI_PRODUCT_BUILD_TOKENS_ERROR)
    } finally {
      setIsBuildTokensLoading(false)
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

  if (!canShowButtons) {
    return null
  }

  return (
    <VisibilityGate
      ability={rest.ability}
      permissionKey={rest.permissionKey}
      permissionFallback={rest.permissionFallback}
    >
      <Stack direction="row" gap="small" {...rest}>
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

        <ModalDialog
          show={showProtectionKeyModal}
          onClose={() => setShowProtectionKeyModal(false)}
          title={UI_PRODUCT_PROTECTION_KEY_MODAL_TITLE}
          body={
            isProtectionKeyLoading ? (
              UI_PRODUCT_PROTECTION_KEY_LOADING
            ) : protectionKeyError ? (
              protectionKeyError
            ) : (
              <div className="d-flex flex-column gap-2">
                <div>
                  <div>{UI_PRODUCT_PROTECTION_KEY_LABEL_PRODUCT}</div>
                  <code>{protectionKeyMetadata?.productSlug ?? UI_VALUE_PLACEHOLDER}</code>
                </div>
                <div>
                  <div>{UI_PRODUCT_PROTECTION_KEY_LABEL_SIGNING_KEY_ID}</div>
                  <code>{protectionKeyMetadata?.signingKeyId ?? UI_VALUE_PLACEHOLDER}</code>
                </div>
                <div>
                  <div>{UI_PRODUCT_PROTECTION_KEY_LABEL_PUBLIC_KEY}</div>
                  <code>{protectionKeyMetadata?.publicKey ?? UI_VALUE_PLACEHOLDER}</code>
                </div>
              </div>
            )
          }
          secondaryAction={{
            id: 'protection-key-close',
            label: UI_PRODUCT_PROTECTION_KEY_CLOSE,
            onClick: () => setShowProtectionKeyModal(false),
          }}
        />

        <ModalDialog
          show={showBuildTokensModal}
          onClose={() => setShowBuildTokensModal(false)}
          title={UI_PRODUCT_BUILD_TOKENS_MODAL_TITLE}
          body={
            isBuildTokensLoading ? (
              UI_PRODUCT_BUILD_TOKENS_LOADING
            ) : buildTokensError ? (
              buildTokensError
            ) : (
              <div className="d-flex flex-column gap-3">
                <Button
                  variant={UI_BUTTON_VARIANT_GHOST}
                  onClick={() => {
                    void handleIssueBuildToken()
                  }}
                  disabled={isIssuingBuildToken}
                >
                  {isIssuingBuildToken ? UI_PRODUCT_BUILD_TOKENS_ISSUING : UI_PRODUCT_BUILD_TOKENS_ISSUE}
                </Button>
                {issuedBuildToken !== null ? (
                  <div className="d-flex flex-column gap-1">
                    <div>{UI_PRODUCT_BUILD_TOKENS_TOKEN_ONCE}</div>
                    <code>{issuedBuildToken}</code>
                  </div>
                ) : null}
                <div className="d-flex flex-column gap-1">
                  <div>{UI_PRODUCT_BUILD_TOKENS_USAGE_NOTE}</div>
                  <code>{UI_PRODUCT_BUILD_TOKENS_RELEASE_ENDPOINT}</code>
                </div>
                <div>{UI_PRODUCT_BUILD_TOKENS_CURRENT}</div>
                {buildTokens.length === 0 ? (
                  <div>{UI_PRODUCT_BUILD_TOKENS_EMPTY}</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {buildTokens.map((token) => {
                      const tokenStatusLabel = getBuildTokenStatusLabel(token)
                      const isTokenRevokable = tokenStatusLabel === UI_PRODUCT_BUILD_TOKENS_STATUS_ACTIVE
                      return (
                        <div key={token.id} className="border rounded p-2 d-flex flex-column gap-1">
                          <div>
                            <strong>{UI_PRODUCT_BUILD_TOKENS_LABEL_PREFIX}</strong>: <code>{token.token_prefix}</code>
                          </div>
                          <div>
                            <strong>{UI_PRODUCT_BUILD_TOKENS_LABEL_STATUS}</strong>: {tokenStatusLabel}
                          </div>
                          <div>
                            <strong>{UI_PRODUCT_BUILD_TOKENS_LABEL_EXPIRES}</strong>:{' '}
                            {getOptionalTimestamp(token.expires_at)}
                          </div>
                          <div>
                            <strong>{UI_PRODUCT_BUILD_TOKENS_LABEL_LAST_USED}</strong>:{' '}
                            {getOptionalTimestamp(token.last_used_at)}
                          </div>
                          <Button
                            variant={UI_BUTTON_VARIANT_GHOST}
                            onClick={() => {
                              void handleRevokeBuildToken(token.id)
                            }}
                            disabled={!isTokenRevokable || revokingBuildTokenId === token.id}
                          >
                            {revokingBuildTokenId === token.id
                              ? UI_PRODUCT_BUILD_TOKENS_REVOKING
                              : UI_PRODUCT_BUILD_TOKENS_REVOKE}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }
          secondaryAction={{
            id: 'build-tokens-close',
            label: UI_PRODUCT_BUILD_TOKENS_CLOSE,
            onClick: () => setShowBuildTokensModal(false),
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
