import type { AgentServiceCredential, Client, ProtectionBuildTokenMetadata, User } from '@/simpleLicense'
import {
  canBatchSoftDeleteLicenses,
  canDeleteEntitlement,
  canDeleteLicense,
  canDeleteProduct,
  canDeleteProductTier,
  canDeleteUser,
  canUpdateProduct,
} from '../../../app/auth/permissions'
import { isSystemAdminUser } from '../../../app/auth/userUtils'
import { useNotificationBus } from '../../../notifications/useNotificationBus'
import {
  UI_AGENT_CREDENTIAL_BATCH_CONFIRM_BODY,
  UI_AGENT_CREDENTIAL_BATCH_CONFIRM_BUTTON,
  UI_AGENT_CREDENTIAL_BATCH_CONFIRM_TITLE,
  UI_AGENT_CREDENTIAL_BATCH_REVOKE_LABEL,
  UI_AGENT_CREDENTIAL_BATCH_REVOKE_PENDING,
  UI_AGENT_CREDENTIAL_BATCH_TOAST_SUCCESS,
  UI_ENTITLEMENT_BATCH_CONFIRM_DELETE_BODY,
  UI_ENTITLEMENT_BATCH_CONFIRM_DELETE_BUTTON,
  UI_ENTITLEMENT_BATCH_CONFIRM_DELETE_TITLE,
  UI_ENTITLEMENT_BATCH_DELETE_LABEL,
  UI_ENTITLEMENT_BATCH_DELETE_PENDING,
  UI_LICENSE_BATCH_CONFIRM_BODY,
  UI_LICENSE_BATCH_CONFIRM_BUTTON,
  UI_LICENSE_BATCH_CONFIRM_TITLE,
  UI_LICENSE_BATCH_SOFT_DELETE_LABEL,
  UI_LICENSE_BATCH_SOFT_DELETE_PENDING,
  UI_LICENSE_BATCH_TOAST_SUCCESS,
  UI_LICENSE_CONFIRM_DELETE_CANCEL,
  UI_PRODUCT_BATCH_CONFIRM_DELETE_BODY,
  UI_PRODUCT_BATCH_CONFIRM_DELETE_BUTTON,
  UI_PRODUCT_BATCH_CONFIRM_DELETE_TITLE,
  UI_PRODUCT_BATCH_CONFIRM_RESUME_BODY,
  UI_PRODUCT_BATCH_CONFIRM_RESUME_BUTTON,
  UI_PRODUCT_BATCH_CONFIRM_RESUME_TITLE,
  UI_PRODUCT_BATCH_CONFIRM_SUSPEND_BODY,
  UI_PRODUCT_BATCH_CONFIRM_SUSPEND_BUTTON,
  UI_PRODUCT_BATCH_CONFIRM_SUSPEND_TITLE,
  UI_PRODUCT_BATCH_DELETE_LABEL,
  UI_PRODUCT_BATCH_DELETE_PENDING,
  UI_PRODUCT_BATCH_RESUME_LABEL,
  UI_PRODUCT_BATCH_RESUME_PENDING,
  UI_PRODUCT_BATCH_SUSPEND_LABEL,
  UI_PRODUCT_BATCH_SUSPEND_PENDING,
  UI_PRODUCT_CONFIRM_DELETE_CANCEL,
  UI_PRODUCT_TIER_BATCH_CONFIRM_DELETE_BODY,
  UI_PRODUCT_TIER_BATCH_CONFIRM_DELETE_BUTTON,
  UI_PRODUCT_TIER_BATCH_CONFIRM_DELETE_TITLE,
  UI_PRODUCT_TIER_BATCH_DELETE_LABEL,
  UI_PRODUCT_TIER_BATCH_DELETE_PENDING,
  UI_PROTECTION_BUILD_TOKEN_BATCH_CONFIRM_BODY,
  UI_PROTECTION_BUILD_TOKEN_BATCH_CONFIRM_BUTTON,
  UI_PROTECTION_BUILD_TOKEN_BATCH_CONFIRM_TITLE,
  UI_PROTECTION_BUILD_TOKEN_BATCH_REVOKE_LABEL,
  UI_PROTECTION_BUILD_TOKEN_BATCH_REVOKE_PENDING,
  UI_PROTECTION_BUILD_TOKEN_BATCH_TOAST_SUCCESS,
  UI_RELEASE_BATCH_CONFIRM_BODY,
  UI_RELEASE_BATCH_CONFIRM_BUTTON,
  UI_RELEASE_BATCH_CONFIRM_TITLE,
  UI_RELEASE_BATCH_DELETE_LABEL,
  UI_RELEASE_BATCH_DELETE_PENDING,
  UI_RELEASE_BATCH_TOAST_SUCCESS,
  UI_RELEASE_MODAL_CANCEL,
  UI_TABLE_BATCH_TOAST_PARTIAL,
  UI_TABLE_BATCH_TOAST_SUCCESS,
  UI_TENANT_BATCH_CONFIRM_RESUME_BODY,
  UI_TENANT_BATCH_CONFIRM_RESUME_BUTTON,
  UI_TENANT_BATCH_CONFIRM_RESUME_TITLE,
  UI_TENANT_BATCH_CONFIRM_SUSPEND_BODY,
  UI_TENANT_BATCH_CONFIRM_SUSPEND_BUTTON,
  UI_TENANT_BATCH_CONFIRM_SUSPEND_TITLE,
  UI_TENANT_BATCH_RESUME_LABEL,
  UI_TENANT_BATCH_RESUME_PENDING,
  UI_TENANT_BATCH_SUSPEND_LABEL,
  UI_TENANT_BATCH_SUSPEND_PENDING,
  UI_TENANT_STATUS_ACTIVE,
  UI_TENANT_STATUS_SUSPENDED,
  UI_USER_BATCH_CONFIRM_DELETE_BODY,
  UI_USER_BATCH_CONFIRM_DELETE_BUTTON,
  UI_USER_BATCH_CONFIRM_DELETE_TITLE,
  UI_USER_BATCH_DELETE_LABEL,
  UI_USER_BATCH_DELETE_PENDING,
  UI_USER_CONFIRM_DELETE_CANCEL,
  UI_USER_STATUS_DELETED,
} from '../../constants'
import type { UiTableBatchAction } from '../../types'
import type { LicenseListItem } from '../../workflows/LicenseManagementPanel'
import type { ProductEntitlementListItem } from '../../workflows/ProductEntitlementRowActions'
import type { ProductListItem } from '../../workflows/ProductManagementPanel'
import type { ProductTierListItem } from '../../workflows/ProductTierManagementPanel'
import type { ReleaseListItem } from '../../workflows/ReleasesPanel'
import type { TenantListItem } from '../../workflows/TenantManagementPanel'
import type { UserListItem } from '../../workflows/UserManagementPanel'
import { notifyBatchOperationResult } from './notifyBatchOperationResult'
import {
  TABLE_BATCH_TABLE_AGENT_CREDENTIALS,
  TABLE_BATCH_TABLE_ENTITLEMENTS,
  TABLE_BATCH_TABLE_LICENSES,
  TABLE_BATCH_TABLE_PRODUCT_TIERS,
  TABLE_BATCH_TABLE_PRODUCTS,
  TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS,
  TABLE_BATCH_TABLE_RELEASES,
  TABLE_BATCH_TABLE_TENANTS,
  TABLE_BATCH_TABLE_USERS,
  type TableBatchBusContextMap,
  type TableBatchTableId,
} from './types'

export function useBuildTableBatchActions<TData, TTableId extends TableBatchTableId>(
  tableId: TTableId,
  context: TableBatchBusContextMap[TTableId]
): readonly UiTableBatchAction<TData>[] {
  const notificationBus = useNotificationBus()
  const sharedClient = (context as { client: Client }).client
  const productId =
    tableId === TABLE_BATCH_TABLE_RELEASES ||
    tableId === TABLE_BATCH_TABLE_PRODUCT_TIERS ||
    tableId === TABLE_BATCH_TABLE_ENTITLEMENTS ||
    tableId === TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS
      ? ((context as { productId?: string }).productId ?? '')
      : ''

  if (tableId === TABLE_BATCH_TABLE_LICENSES) {
    const licenseContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_LICENSES]
    if (!canBatchSoftDeleteLicenses(licenseContext.currentUser ?? null)) {
      return []
    }
    return [
      {
        id: 'license-batch-soft-delete',
        label: UI_LICENSE_BATCH_SOFT_DELETE_LABEL,
        pendingLabel: UI_LICENSE_BATCH_SOFT_DELETE_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_LICENSE_BATCH_CONFIRM_TITLE,
        confirmBody: UI_LICENSE_BATCH_CONFIRM_BODY,
        confirmLabel: UI_LICENSE_BATCH_CONFIRM_BUTTON,
        cancelLabel: UI_LICENSE_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const licenses = rows as readonly LicenseListItem[]
          const result = await sharedClient.batchSoftDeleteLicenses({
            licenseKeys: licenses.map((row) => row.licenseKey),
          })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_LICENSE_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          licenseContext.onRefresh?.()
        },
      },
    ] as readonly UiTableBatchAction<TData>[]
  }

  if (tableId === TABLE_BATCH_TABLE_RELEASES) {
    const releaseContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_RELEASES]
    return [
      {
        id: 'release-batch-delete',
        label: UI_RELEASE_BATCH_DELETE_LABEL,
        pendingLabel: UI_RELEASE_BATCH_DELETE_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_RELEASE_BATCH_CONFIRM_TITLE,
        confirmBody: UI_RELEASE_BATCH_CONFIRM_BODY,
        confirmLabel: UI_RELEASE_BATCH_CONFIRM_BUTTON,
        cancelLabel: UI_RELEASE_MODAL_CANCEL,
        onExecute: async (rows) => {
          const releases = rows as readonly ReleaseListItem[]
          const result = await sharedClient.batchDeleteReleases(productId, {
            releaseIds: releases.map((row) => row.id),
          })
          notifyBatchOperationResult(notificationBus, result, UI_RELEASE_BATCH_TOAST_SUCCESS)
          releaseContext.onRefresh?.()
        },
      },
    ] as readonly UiTableBatchAction<TData>[]
  }

  if (tableId === TABLE_BATCH_TABLE_PRODUCTS) {
    const productContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_PRODUCTS]
    const actions: UiTableBatchAction<ProductListItem>[] = []
    if (canDeleteProduct(productContext.currentUser ?? null)) {
      actions.push({
        id: 'product-batch-delete',
        label: UI_PRODUCT_BATCH_DELETE_LABEL,
        pendingLabel: UI_PRODUCT_BATCH_DELETE_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_PRODUCT_BATCH_CONFIRM_DELETE_TITLE,
        confirmBody: UI_PRODUCT_BATCH_CONFIRM_DELETE_BODY,
        confirmLabel: UI_PRODUCT_BATCH_CONFIRM_DELETE_BUTTON,
        cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const result = await sharedClient.batchDeleteProducts({ productIds: rows.map((row) => row.id) })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_TABLE_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          productContext.onRefresh?.()
        },
      })
    }
    if (canUpdateProduct(productContext.currentUser ?? null)) {
      actions.push(
        {
          id: 'product-batch-suspend',
          label: UI_PRODUCT_BATCH_SUSPEND_LABEL,
          pendingLabel: UI_PRODUCT_BATCH_SUSPEND_PENDING,
          variant: 'outline-danger',
          confirmTitle: UI_PRODUCT_BATCH_CONFIRM_SUSPEND_TITLE,
          confirmBody: UI_PRODUCT_BATCH_CONFIRM_SUSPEND_BODY,
          confirmLabel: UI_PRODUCT_BATCH_CONFIRM_SUSPEND_BUTTON,
          cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
          onExecute: async (rows) => {
            const result = await sharedClient.batchSuspendProducts({ productIds: rows.map((row) => row.id) })
            notifyBatchOperationResult(
              notificationBus,
              result,
              UI_TABLE_BATCH_TOAST_SUCCESS,
              UI_TABLE_BATCH_TOAST_PARTIAL
            )
            productContext.onRefresh?.()
          },
        },
        {
          id: 'product-batch-resume',
          label: UI_PRODUCT_BATCH_RESUME_LABEL,
          pendingLabel: UI_PRODUCT_BATCH_RESUME_PENDING,
          variant: 'outline-secondary',
          confirmTitle: UI_PRODUCT_BATCH_CONFIRM_RESUME_TITLE,
          confirmBody: UI_PRODUCT_BATCH_CONFIRM_RESUME_BODY,
          confirmLabel: UI_PRODUCT_BATCH_CONFIRM_RESUME_BUTTON,
          cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
          onExecute: async (rows) => {
            const result = await sharedClient.batchResumeProducts({ productIds: rows.map((row) => row.id) })
            notifyBatchOperationResult(
              notificationBus,
              result,
              UI_TABLE_BATCH_TOAST_SUCCESS,
              UI_TABLE_BATCH_TOAST_PARTIAL
            )
            productContext.onRefresh?.()
          },
        }
      )
    }
    return actions as readonly UiTableBatchAction<TData>[]
  }

  if (tableId === TABLE_BATCH_TABLE_USERS) {
    const userContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_USERS]
    if (!canDeleteUser(userContext.currentUser as User)) {
      return []
    }
    return [
      {
        id: 'user-batch-delete',
        label: UI_USER_BATCH_DELETE_LABEL,
        pendingLabel: UI_USER_BATCH_DELETE_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_USER_BATCH_CONFIRM_DELETE_TITLE,
        confirmBody: UI_USER_BATCH_CONFIRM_DELETE_BODY,
        confirmLabel: UI_USER_BATCH_CONFIRM_DELETE_BUTTON,
        cancelLabel: UI_USER_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const users = rows as readonly UserListItem[]
          const result = await sharedClient.batchDeleteUsers({ userIds: users.map((row) => row.id) })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_TABLE_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          userContext.onRefresh?.()
        },
      },
    ] as readonly UiTableBatchAction<TData>[]
  }

  if (tableId === TABLE_BATCH_TABLE_TENANTS) {
    const tenantContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_TENANTS]
    return [
      {
        id: 'tenant-batch-suspend',
        label: UI_TENANT_BATCH_SUSPEND_LABEL,
        pendingLabel: UI_TENANT_BATCH_SUSPEND_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_TENANT_BATCH_CONFIRM_SUSPEND_TITLE,
        confirmBody: UI_TENANT_BATCH_CONFIRM_SUSPEND_BODY,
        confirmLabel: UI_TENANT_BATCH_CONFIRM_SUSPEND_BUTTON,
        cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const tenants = rows as readonly TenantListItem[]
          const result = await sharedClient.batchSuspendTenants({ tenantIds: tenants.map((row) => row.id) })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_TABLE_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          tenantContext.onRefresh?.()
        },
      },
      {
        id: 'tenant-batch-resume',
        label: UI_TENANT_BATCH_RESUME_LABEL,
        pendingLabel: UI_TENANT_BATCH_RESUME_PENDING,
        variant: 'outline-secondary',
        confirmTitle: UI_TENANT_BATCH_CONFIRM_RESUME_TITLE,
        confirmBody: UI_TENANT_BATCH_CONFIRM_RESUME_BODY,
        confirmLabel: UI_TENANT_BATCH_CONFIRM_RESUME_BUTTON,
        cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const tenants = rows as readonly TenantListItem[]
          const result = await sharedClient.batchResumeTenants({ tenantIds: tenants.map((row) => row.id) })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_TABLE_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          tenantContext.onRefresh?.()
        },
      },
    ] as readonly UiTableBatchAction<TData>[]
  }

  if (tableId === TABLE_BATCH_TABLE_PRODUCT_TIERS) {
    const tierContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_PRODUCT_TIERS]
    if (!canDeleteProductTier(tierContext.currentUser ?? null)) {
      return []
    }
    return [
      {
        id: 'tier-batch-delete',
        label: UI_PRODUCT_TIER_BATCH_DELETE_LABEL,
        pendingLabel: UI_PRODUCT_TIER_BATCH_DELETE_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_PRODUCT_TIER_BATCH_CONFIRM_DELETE_TITLE,
        confirmBody: UI_PRODUCT_TIER_BATCH_CONFIRM_DELETE_BODY,
        confirmLabel: UI_PRODUCT_TIER_BATCH_CONFIRM_DELETE_BUTTON,
        cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const tiers = rows as readonly ProductTierListItem[]
          const result = await sharedClient.batchDeleteProductTiers(productId, {
            tierIds: tiers.map((row) => row.id),
          })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_TABLE_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          tierContext.onRefresh?.()
        },
      },
    ] as readonly UiTableBatchAction<TData>[]
  }

  if (tableId === TABLE_BATCH_TABLE_ENTITLEMENTS) {
    const entitlementContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_ENTITLEMENTS]
    if (!canDeleteEntitlement(entitlementContext.currentUser ?? null)) {
      return []
    }
    return [
      {
        id: 'entitlement-batch-delete',
        label: UI_ENTITLEMENT_BATCH_DELETE_LABEL,
        pendingLabel: UI_ENTITLEMENT_BATCH_DELETE_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_ENTITLEMENT_BATCH_CONFIRM_DELETE_TITLE,
        confirmBody: UI_ENTITLEMENT_BATCH_CONFIRM_DELETE_BODY,
        confirmLabel: UI_ENTITLEMENT_BATCH_CONFIRM_DELETE_BUTTON,
        cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const entitlements = rows as readonly ProductEntitlementListItem[]
          const result = await sharedClient.batchDeleteEntitlements(productId, {
            entitlementIds: entitlements.map((row) => row.id),
          })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_TABLE_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          entitlementContext.onRefresh?.()
        },
      },
    ] as readonly UiTableBatchAction<TData>[]
  }

  if (tableId === TABLE_BATCH_TABLE_AGENT_CREDENTIALS) {
    const credentialContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_AGENT_CREDENTIALS]
    return [
      {
        id: 'agent-credential-batch-revoke',
        label: UI_AGENT_CREDENTIAL_BATCH_REVOKE_LABEL,
        pendingLabel: UI_AGENT_CREDENTIAL_BATCH_REVOKE_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_AGENT_CREDENTIAL_BATCH_CONFIRM_TITLE,
        confirmBody: UI_AGENT_CREDENTIAL_BATCH_CONFIRM_BODY,
        confirmLabel: UI_AGENT_CREDENTIAL_BATCH_CONFIRM_BUTTON,
        cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const credentials = rows as readonly AgentServiceCredential[]
          const result = await sharedClient.batchRevokeAgentServiceCredentials({
            credentialIds: credentials.map((row) => row.id),
          })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_AGENT_CREDENTIAL_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          credentialContext.onRefresh?.()
        },
      },
    ] as readonly UiTableBatchAction<TData>[]
  }

  if (tableId === TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS) {
    const tokenContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS]
    return [
      {
        id: 'protection-build-token-batch-revoke',
        label: UI_PROTECTION_BUILD_TOKEN_BATCH_REVOKE_LABEL,
        pendingLabel: UI_PROTECTION_BUILD_TOKEN_BATCH_REVOKE_PENDING,
        variant: 'outline-danger',
        confirmTitle: UI_PROTECTION_BUILD_TOKEN_BATCH_CONFIRM_TITLE,
        confirmBody: UI_PROTECTION_BUILD_TOKEN_BATCH_CONFIRM_BODY,
        confirmLabel: UI_PROTECTION_BUILD_TOKEN_BATCH_CONFIRM_BUTTON,
        cancelLabel: UI_PRODUCT_CONFIRM_DELETE_CANCEL,
        onExecute: async (rows) => {
          const tokens = rows as readonly ProtectionBuildTokenMetadata[]
          const result = await sharedClient.batchRevokeProtectionBuildTokens(productId, {
            tokenIds: tokens.map((row) => row.id),
          })
          notifyBatchOperationResult(
            notificationBus,
            result,
            UI_PROTECTION_BUILD_TOKEN_BATCH_TOAST_SUCCESS,
            UI_TABLE_BATCH_TOAST_PARTIAL
          )
          tokenContext.onRefresh?.()
        },
      },
    ] as readonly UiTableBatchAction<TData>[]
  }

  return []
}

export function resolveTableBatchRowSelectable<TData, TTableId extends TableBatchTableId>(
  tableId: TTableId,
  context: TableBatchBusContextMap[TTableId]
): ((row: TData) => boolean) | undefined {
  if (tableId === TABLE_BATCH_TABLE_LICENSES) {
    const licenseContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_LICENSES]
    const allowDelete = canDeleteLicense(licenseContext.currentUser ?? null)
    const isSystemAdmin = isSystemAdminUser(licenseContext.currentUser ?? null)
    return (row) => {
      const license = row as LicenseListItem
      const owns =
        isSystemAdmin || (Boolean(license.vendorId) && licenseContext.currentUser?.vendorId === license.vendorId)
      return license.softDeletedAt == null && allowDelete && owns
    }
  }

  if (tableId === TABLE_BATCH_TABLE_RELEASES) {
    return (row) => !(row as ReleaseListItem).isPromoted
  }

  if (tableId === TABLE_BATCH_TABLE_PRODUCTS) {
    const productContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_PRODUCTS]
    const isSystemAdmin = isSystemAdminUser(productContext.currentUser ?? null)
    return (row) => {
      const product = row as ProductListItem
      const owns = isSystemAdmin || productContext.currentUser?.vendorId === product.vendorId
      return (
        owns &&
        (canDeleteProduct(productContext.currentUser ?? null) || canUpdateProduct(productContext.currentUser ?? null))
      )
    }
  }

  if (tableId === TABLE_BATCH_TABLE_USERS) {
    const userContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_USERS]
    return (row) => {
      const user = row as UserListItem
      return (
        canDeleteUser(userContext.currentUser as User, user) &&
        userContext.currentUser?.id !== user.id &&
        user.status !== UI_USER_STATUS_DELETED
      )
    }
  }

  if (tableId === TABLE_BATCH_TABLE_TENANTS) {
    return (row) => {
      const tenant = row as TenantListItem
      return tenant.status === UI_TENANT_STATUS_ACTIVE || tenant.status === UI_TENANT_STATUS_SUSPENDED
    }
  }

  if (tableId === TABLE_BATCH_TABLE_PRODUCT_TIERS) {
    const tierContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_PRODUCT_TIERS]
    const isSystemAdmin = isSystemAdminUser(tierContext.currentUser ?? null)
    return (row) => {
      const tier = row as ProductTierListItem
      const owns = isSystemAdmin || tierContext.currentUser?.vendorId === tier.vendorId
      return owns && canDeleteProductTier(tierContext.currentUser ?? null)
    }
  }

  if (tableId === TABLE_BATCH_TABLE_ENTITLEMENTS) {
    const entitlementContext = context as TableBatchBusContextMap[typeof TABLE_BATCH_TABLE_ENTITLEMENTS]
    return () => canDeleteEntitlement(entitlementContext.currentUser ?? null)
  }

  if (tableId === TABLE_BATCH_TABLE_AGENT_CREDENTIALS) {
    return (row) => !(row as AgentServiceCredential).revokedAt
  }

  if (tableId === TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS) {
    return (row) => {
      const token = row as ProtectionBuildTokenMetadata
      if (token.revoked_at !== null) {
        return false
      }
      if (token.expires_at !== null) {
        const expiresAtMs = Date.parse(token.expires_at)
        if (!Number.isNaN(expiresAtMs) && expiresAtMs <= Date.now()) {
          return false
        }
      }
      return true
    }
  }

  return undefined
}
