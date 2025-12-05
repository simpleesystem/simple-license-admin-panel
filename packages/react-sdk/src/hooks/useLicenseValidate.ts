/**
 * React Query hook for validating a license
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type { ValidateLicenseResponse } from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export interface UseValidateLicenseOptions {
  onSuccess?: (data: ValidateLicenseResponse) => void
  onError?: (error: Error) => void
}

export function useLicenseValidate(client: Client, options?: UseValidateLicenseOptions) {
  const queryClient = useQueryClient()

  return useMutation<ValidateLicenseResponse, Error, { licenseKey: string; domain: string }>({
    mutationFn: async ({ licenseKey, domain }) => {
      return await client.validateLicense(licenseKey, domain)
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(QUERY_KEYS.licenses.detail(variables.licenseKey), data)
      options?.onSuccess?.(data)
    },
    ...(options?.onError ? { onError: options.onError } : {}),
  })
}
