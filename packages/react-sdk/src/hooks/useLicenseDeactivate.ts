/**
 * React Query hook for deactivating a license
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type { DeactivateLicenseResponse } from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export interface UseDeactivateLicenseOptions {
  onSuccess?: (data: DeactivateLicenseResponse) => void
  onError?: (error: Error) => void
}

export function useLicenseDeactivate(client: Client, options?: UseDeactivateLicenseOptions) {
  const queryClient = useQueryClient()

  return useMutation<DeactivateLicenseResponse, Error, { licenseKey: string; domain: string }>({
    mutationFn: async ({ licenseKey, domain }) => {
      return await client.deactivateLicense(licenseKey, domain)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.licenses.detail(variables.licenseKey) })
      options?.onSuccess?.(_data)
    },
    ...(options?.onError ? { onError: options.onError } : {}),
  })
}
