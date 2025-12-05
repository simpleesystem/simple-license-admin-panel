/**
 * React Query hook for checking for updates
 */
import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import type { Client } from '../client'
import type { CheckUpdateRequest, CheckUpdateResponse } from '../types/api'

export interface UseUpdateCheckOptions {
  onSuccess?: (data: CheckUpdateResponse) => void
  onError?: (error: Error) => void
}

export function useUpdateCheck(client: Client, options?: UseUpdateCheckOptions) {
  return useMutation<CheckUpdateResponse, Error, CheckUpdateRequest>({
    mutationFn: async (request) => {
      return await client.checkUpdate(request)
    },
    ...(options as UseMutationOptions<CheckUpdateResponse, Error, CheckUpdateRequest>),
  })
}
