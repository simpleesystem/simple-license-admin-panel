/**
 * Admin batch mutation hooks (table batch bus API layer)
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  BatchDeleteEntitlementsRequest,
  BatchDeleteReleasesRequest,
  BatchDeleteUsersRequest,
  BatchOperationResponse,
  BatchRevokeAgentCredentialsRequest,
  BatchRevokeProtectionBuildTokensRequest,
  BatchSoftDeleteLicensesRequest,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useBatchSoftDeleteLicenses(client: Client) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, BatchSoftDeleteLicensesRequest>({
    mutationFn: (request) => client.batchSoftDeleteLicenses(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.all() }),
  })
}

export function useBatchDeleteReleases(client: Client, productId: string) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, BatchDeleteReleasesRequest>({
    mutationFn: (request) => client.batchDeleteReleases(productId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminReleases.all(productId) }),
  })
}

export function useBatchDeleteProducts(client: Client) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, { productIds: string[] }>({
    mutationFn: (request) => client.batchDeleteProducts(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.all() }),
  })
}

export function useBatchSuspendProducts(client: Client) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, { productIds: string[] }>({
    mutationFn: (request) => client.batchSuspendProducts(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.all() }),
  })
}

export function useBatchResumeProducts(client: Client) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, { productIds: string[] }>({
    mutationFn: (request) => client.batchResumeProducts(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.all() }),
  })
}

export function useBatchDeleteUsers(client: Client) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, BatchDeleteUsersRequest>({
    mutationFn: (request) => client.batchDeleteUsers(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers.all() }),
  })
}

export function useBatchSuspendTenants(client: Client) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, { tenantIds: string[] }>({
    mutationFn: (request) => client.batchSuspendTenants(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.all() }),
  })
}

export function useBatchResumeTenants(client: Client) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, { tenantIds: string[] }>({
    mutationFn: (request) => client.batchResumeTenants(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.all() }),
  })
}

export function useBatchDeleteProductTiers(client: Client, productId: string) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, { tierIds: string[] }>({
    mutationFn: (request) => client.batchDeleteProductTiers(productId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProductTiers.all(productId) }),
  })
}

export function useBatchDeleteEntitlements(client: Client, productId: string) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, BatchDeleteEntitlementsRequest>({
    mutationFn: (request) => client.batchDeleteEntitlements(productId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminEntitlements.all(productId) }),
  })
}

export function useBatchRevokeAgentServiceCredentials(client: Client) {
  const queryClient = useQueryClient()
  return useMutation<BatchOperationResponse, Error, BatchRevokeAgentCredentialsRequest>({
    mutationFn: (request) => client.batchRevokeAgentServiceCredentials(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminAgentServiceAccounts.all() }),
  })
}

export function useBatchRevokeProtectionBuildTokens(client: Client, productId: string) {
  return useMutation<BatchOperationResponse, Error, BatchRevokeProtectionBuildTokensRequest>({
    mutationFn: (request) => client.batchRevokeProtectionBuildTokens(productId, request),
  })
}
