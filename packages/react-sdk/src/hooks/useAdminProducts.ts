/**
 * React Query hooks for admin product management
 */
import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  CreateProductRequest,
  CreateProductResponse,
  GetProductResponse,
  ListProductsResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useAdminProducts(
  client: Client,
  options?: Omit<UseQueryOptions<ListProductsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListProductsResponse, Error>({
    queryKey: QUERY_KEYS.adminProducts.all(),
    queryFn: async () => {
      return await client.listProducts()
    },
    ...options,
  })
}

export function useAdminProduct(
  client: Client,
  id: string,
  options?: Omit<UseQueryOptions<GetProductResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetProductResponse, Error>({
    queryKey: QUERY_KEYS.adminProducts.detail(id),
    queryFn: async () => {
      return await client.getProduct(id)
    },
    enabled: Boolean(id),
    ...options,
  })
}

export function useCreateProduct(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<CreateProductResponse, Error, CreateProductRequest>({
    mutationFn: async (request) => {
      return await client.createProduct(request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.all() })
    },
  })
}

export function useUpdateProduct(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<UpdateProductResponse, Error, { id: string; data: UpdateProductRequest }>({
    mutationFn: async ({ id, data }) => {
      return await client.updateProduct(id, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.detail(variables.id) })
    },
  })
}

export function useDeleteProduct(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.deleteProduct(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.all() })
    },
  })
}

export function useSuspendProduct(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.suspendProduct(id)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.detail(id) })
    },
  })
}

export function useResumeProduct(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.resumeProduct(id)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts.detail(id) })
    },
  })
}
