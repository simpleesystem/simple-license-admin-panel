/**
 * React Query hook for getting license data
 */
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import type { Client } from '../client'
import type { LicenseDataResponse } from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export interface UseLicenseDataOptions {
  enabled?: boolean
  staleTime?: number
}

export function useLicenseData(
  client: Client,
  licenseKey: string,
  options?: UseLicenseDataOptions & Omit<UseQueryOptions<LicenseDataResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const { enabled, staleTime, ...restOptions } = options || {}
  return useQuery<LicenseDataResponse, Error>({
    queryKey: QUERY_KEYS.licenses.data(licenseKey),
    queryFn: async () => {
      return await client.getLicenseData(licenseKey)
    },
    enabled: enabled !== false && Boolean(licenseKey),
    ...(staleTime !== undefined ? { staleTime } : {}),
    ...restOptions,
  })
}
