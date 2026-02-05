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

export interface ListReleasesParams {
  sortBy?: 'version' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  isPrerelease?: boolean
}

export interface UseAdminReleasesOptions
  extends Omit<UseQueryOptions<ListReleasesResponse, Error>, 'queryKey' | 'queryFn'> {
  params?: ListReleasesParams
}

export function useAdminReleases(client: Client, productId: string, options?: UseAdminReleasesOptions) {
  const { params, ...queryOptions } = options ?? {}
  return useQuery<ListReleasesResponse, Error>({
    queryKey: [...QUERY_KEYS.adminReleases.all(productId), params],
    queryFn: async () => {
      return await client.listReleases(productId, params)
    },
    enabled: Boolean(productId),
    ...queryOptions,
  })
}

export function usePromoteRelease(
  client: Client,
  productId: string,
  options?: UseMutationOptions<CreateReleaseResponse, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation<CreateReleaseResponse, Error, string>({
    mutationFn: async (releaseId) => {
      return await client.promoteRelease(productId, releaseId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminReleases.all(productId) })
    },
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
