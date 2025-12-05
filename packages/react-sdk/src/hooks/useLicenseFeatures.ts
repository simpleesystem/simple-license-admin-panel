/**
 * React Query hook for getting license features
 */
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import type { Client } from '../client'
import type { LicenseFeaturesResponse } from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export interface UseLicenseFeaturesOptions {
  enabled?: boolean
  staleTime?: number
}

export function useLicenseFeatures(
  client: Client,
  licenseKey: string,
  options?: UseLicenseFeaturesOptions & Omit<UseQueryOptions<LicenseFeaturesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const { enabled, staleTime, ...restOptions } = options || {}
  return useQuery<LicenseFeaturesResponse, Error>({
    queryKey: QUERY_KEYS.licenses.features(licenseKey),
    queryFn: async () => {
      return await client.getLicenseFeatures(licenseKey)
    },
    enabled: enabled !== false && Boolean(licenseKey),
    ...(staleTime !== undefined ? { staleTime } : {}),
    ...restOptions,
  })
}
