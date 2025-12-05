/**
 * React Query hooks for admin tenant management
 */
import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  CreateTenantBackupResponse,
  CreateTenantRequest,
  CreateTenantResponse,
  GetQuotaConfigResponse,
  GetQuotaUsageResponse,
  ListTenantsResponse,
  UpdateQuotaLimitsRequest,
  UpdateTenantRequest,
  UpdateTenantResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useAdminTenants(
  client: Client,
  options?: Omit<UseQueryOptions<ListTenantsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListTenantsResponse, Error>({
    queryKey: QUERY_KEYS.adminTenants.all(),
    queryFn: async () => {
      return await client.listTenants()
    },
    ...options,
  })
}

export function useCreateTenant(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<CreateTenantResponse, Error, CreateTenantRequest>({
    mutationFn: async (request) => {
      return await client.createTenant(request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.all() })
    },
  })
}

export function useUpdateTenant(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<UpdateTenantResponse, Error, { id: string; data: UpdateTenantRequest }>({
    mutationFn: async ({ id, data }) => {
      return await client.updateTenant(id, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.detail(variables.id) })
    },
  })
}

export function useSuspendTenant(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.suspendTenant(id)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.detail(id) })
    },
  })
}

export function useResumeTenant(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.resumeTenant(id)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.detail(id) })
    },
  })
}

export function useCreateTenantBackup(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<CreateTenantBackupResponse, Error, string>({
    mutationFn: async (tenantId) => {
      return await client.createTenantBackup(tenantId)
    },
    onSuccess: (_data, tenantId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.detail(tenantId) })
    },
  })
}

export function useQuotaUsage(
  client: Client,
  tenantId: string,
  options?: Omit<UseQueryOptions<GetQuotaUsageResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetQuotaUsageResponse, Error>({
    queryKey: QUERY_KEYS.adminTenants.quotaUsage(tenantId),
    queryFn: async () => {
      return await client.getQuotaUsage(tenantId)
    },
    enabled: Boolean(tenantId),
    ...options,
  })
}

export function useQuotaConfig(
  client: Client,
  tenantId: string,
  options?: Omit<UseQueryOptions<GetQuotaConfigResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetQuotaConfigResponse, Error>({
    queryKey: QUERY_KEYS.adminTenants.quotaConfig(tenantId),
    queryFn: async () => {
      return await client.getQuotaConfig(tenantId)
    },
    enabled: Boolean(tenantId),
    ...options,
  })
}

export function useUpdateQuotaLimits(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, { tenantId: string; data: UpdateQuotaLimitsRequest }>({
    mutationFn: async ({ tenantId, data }) => {
      return await client.updateQuotaLimits(tenantId, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.quotaUsage(variables.tenantId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminTenants.quotaConfig(variables.tenantId) })
    },
  })
}
