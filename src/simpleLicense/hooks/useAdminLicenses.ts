/**
 * React Query hooks for admin license management
 */
import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  CreateLicenseRequest,
  CreateLicenseResponse,
  FreezeLicenseRequest,
  GetLicenseActivationsResponse,
  GetLicenseResponse,
  ListLicensesRequest,
  ListLicensesResponse,
  UpdateLicenseRequest,
  UpdateLicenseResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

// List licenses
export function useAdminLicenses(
  client: Client,
  filters?: ListLicensesRequest,
  options?: Omit<UseQueryOptions<ListLicensesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListLicensesResponse, Error>({
    queryKey: QUERY_KEYS.adminLicenses.all(
      filters as Record<string, string | number | boolean | null | undefined> | undefined
    ),
    queryFn: async () => {
      return await client.listLicenses(filters)
    },
    ...options,
  })
}

// Get license
export function useAdminLicense(
  client: Client,
  id: string,
  options?: Omit<UseQueryOptions<GetLicenseResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetLicenseResponse, Error>({
    queryKey: QUERY_KEYS.adminLicenses.detail(id),
    queryFn: async () => {
      return await client.getLicense(id)
    },
    enabled: Boolean(id),
    ...options,
  })
}

// Create license
export function useCreateLicense(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<CreateLicenseResponse, Error, CreateLicenseRequest>({
    mutationFn: async (request) => {
      return await client.createLicense(request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.all() })
    },
  })
}

// Update license
export function useUpdateLicense(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<UpdateLicenseResponse, Error, { id: string; data: UpdateLicenseRequest }>({
    mutationFn: async ({ id, data }) => {
      return await client.updateLicense(id, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.detail(variables.id) })
    },
  })
}

// Suspend license
export function useSuspendLicense(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.suspendLicense(id)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.detail(id) })
    },
  })
}

// Resume license
export function useResumeLicense(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.resumeLicense(id)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.detail(id) })
    },
  })
}

// Freeze license
export function useFreezeLicense(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, { id: string; data?: FreezeLicenseRequest }>({
    mutationFn: async ({ id, data }) => {
      return await client.freezeLicense(id, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.detail(variables.id) })
    },
  })
}

// Revoke license
export function useRevokeLicense(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.revokeLicense(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminLicenses.all() })
    },
  })
}

// Get license activations
export function useLicenseActivations(
  client: Client,
  id: string,
  options?: Omit<UseQueryOptions<GetLicenseActivationsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetLicenseActivationsResponse, Error>({
    queryKey: QUERY_KEYS.adminLicenses.activations(id),
    queryFn: async () => {
      return await client.getLicenseActivations(id)
    },
    enabled: Boolean(id),
    ...options,
  })
}
