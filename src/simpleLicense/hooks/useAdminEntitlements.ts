/**
 * React Query hooks for admin entitlement management
 */
import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  CreateEntitlementRequest,
  CreateEntitlementResponse,
  ListEntitlementsResponse,
  UpdateEntitlementRequest,
  UpdateEntitlementResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useProductEntitlements(
  client: Client,
  productId: string,
  options?: Omit<UseQueryOptions<ListEntitlementsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListEntitlementsResponse, Error>({
    queryKey: QUERY_KEYS.adminEntitlements.all(productId),
    queryFn: async () => {
      return await client.listEntitlements(productId)
    },
    enabled: Boolean(productId),
    ...options,
  })
}

export function useCreateEntitlement(client: Client, productId: string) {
  const queryClient = useQueryClient()

  return useMutation<CreateEntitlementResponse, Error, CreateEntitlementRequest>({
    mutationFn: async (request) => {
      return await client.createEntitlement(productId, request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminEntitlements.all(productId) })
    },
  })
}

export function useUpdateEntitlement(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<UpdateEntitlementResponse, Error, { id: string; data: UpdateEntitlementRequest }>({
    mutationFn: async ({ id, data }) => {
      return await client.updateEntitlement(id, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminEntitlements.detail(variables.id) })
    },
  })
}

export function useDeleteEntitlement(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.deleteEntitlement(id)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminEntitlements.detail(id) })
    },
  })
}
