/**
 * React Query hook for reporting license usage
 */
import { useMutation } from '@tanstack/react-query'
import type { Client } from '../client'
import type { ReportUsageRequest } from '../types/api'

export interface UseLicenseUsageOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useLicenseUsage(client: Client, options?: UseLicenseUsageOptions) {
  return useMutation<void, Error, ReportUsageRequest>({
    mutationFn: async (request) => {
      await client.reportUsage(request)
    },
    ...(options?.onSuccess ? { onSuccess: options.onSuccess } : {}),
    ...(options?.onError ? { onError: options.onError } : {}),
  })
}
