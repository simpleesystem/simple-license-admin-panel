/**
 * React Query hook for activating a license
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type { ActivateLicenseResponse } from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export interface ActivateLicenseVariables {
  licenseKey: string
  domain: string
  site_name?: string
  os?: string
  region?: string
  client_version?: string
  device_hash?: string
}

export interface UseActivateLicenseOptions {
  onSuccess?: (data: ActivateLicenseResponse) => void
  onError?: (error: Error) => void
}

export function useLicenseActivate(client: Client, options?: UseActivateLicenseOptions) {
  const queryClient = useQueryClient()

  return useMutation<ActivateLicenseResponse, Error, ActivateLicenseVariables>({
    mutationFn: async ({ licenseKey, domain, ...opts }) => {
      return await client.activateLicense(licenseKey, domain, opts)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.licenses.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.licenses.detail(variables.licenseKey) })
      options?.onSuccess?.(data)
    },
    ...(options?.onError ? { onError: options.onError } : {}),
  })
}
