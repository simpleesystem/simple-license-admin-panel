/**
 * React Query hooks for admin product tier management
 */
import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  CreateProductTierRequest,
  CreateProductTierResponse,
  ListProductTiersResponse,
  UpdateProductTierRequest,
  UpdateProductTierResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useProductTiers(
  client: Client,
  productId: string,
  options?: Omit<UseQueryOptions<ListProductTiersResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListProductTiersResponse, Error>({
    queryKey: QUERY_KEYS.adminProductTiers.all(productId),
    queryFn: async () => {
      return await client.listProductTiers(productId)
    },
    enabled: Boolean(productId),
    ...options,
  })
}

export function useCreateProductTier(client: Client, productId: string) {
  const queryClient = useQueryClient()

  return useMutation<CreateProductTierResponse, Error, CreateProductTierRequest>({
    mutationFn: async (request) => {
      return await client.createProductTier(productId, request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProductTiers.all(productId) })
    },
  })
}

export function useUpdateProductTier(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<UpdateProductTierResponse, Error, { id: string; data: UpdateProductTierRequest }>({
    mutationFn: async ({ id, data }) => {
      return await client.updateProductTier(id, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProductTiers.detail(variables.id) })
    },
  })
}

export function useDeleteProductTier(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.deleteProductTier(id)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProductTiers.detail(id) })
    },
  })
}
