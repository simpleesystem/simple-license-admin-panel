/**
 * React Query hooks for admin release management (plugin release files per product)
 */
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Client } from '../client'
import type { CreateReleaseResponse, ListReleasesResponse } from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useAdminReleases(
  client: Client,
  productId: string,
  options?: Omit<UseQueryOptions<ListReleasesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListReleasesResponse, Error>({
    queryKey: QUERY_KEYS.adminReleases.all(productId),
    queryFn: async () => {
      return await client.listReleases(productId)
    },
    enabled: Boolean(productId),
    ...options,
  })
}

export function useCreateRelease(
  client: Client,
  productId: string,
  options?: UseMutationOptions<CreateReleaseResponse, Error, FormData>
) {
  const queryClient = useQueryClient()

  return useMutation<CreateReleaseResponse, Error, FormData>({
    mutationFn: async (formData) => {
      return await client.createRelease(productId, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminReleases.all(productId) })
    },
    ...options,
  })
}
