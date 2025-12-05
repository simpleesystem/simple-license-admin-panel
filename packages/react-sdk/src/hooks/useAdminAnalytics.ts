/**
 * React Query hooks for admin analytics
 */
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  ActivationDistributionResponse,
  AlertThresholdsResponse,
  LicenseUsageDetailsResponse,
  SystemStatsResponse,
  TopLicensesResponse,
  UpdateAlertThresholdsRequest,
  UsageSummaryResponse,
  UsageTrendsResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useSystemStats(
  client: Client,
  options?: Omit<UseQueryOptions<SystemStatsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SystemStatsResponse, Error>({
    queryKey: QUERY_KEYS.adminAnalytics.stats(),
    queryFn: async () => {
      return await client.getSystemStats()
    },
    ...options,
  })
}

export function useUsageSummaries(
  client: Client,
  options?: Omit<UseQueryOptions<UsageSummaryResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UsageSummaryResponse, Error>({
    queryKey: QUERY_KEYS.adminAnalytics.usage(),
    queryFn: async () => {
      return await client.getUsageSummaries()
    },
    ...options,
  })
}

export function useUsageTrends(
  client: Client,
  options?: Omit<UseQueryOptions<UsageTrendsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UsageTrendsResponse, Error>({
    queryKey: QUERY_KEYS.adminAnalytics.trends(),
    queryFn: async () => {
      return await client.getUsageTrends()
    },
    ...options,
  })
}

export function useActivationDistribution(
  client: Client,
  options?: Omit<UseQueryOptions<ActivationDistributionResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ActivationDistributionResponse, Error>({
    queryKey: QUERY_KEYS.adminAnalytics.distribution(),
    queryFn: async () => {
      return await client.getActivationDistribution()
    },
    ...options,
  })
}

export function useLicenseUsageDetails(
  client: Client,
  licenseKey: string,
  params?: { periodStart?: string; periodEnd?: string },
  options?: Omit<UseQueryOptions<LicenseUsageDetailsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<LicenseUsageDetailsResponse, Error>({
    queryKey: QUERY_KEYS.adminAnalytics.licenseDetails(
      licenseKey,
      params?.periodStart ?? null,
      params?.periodEnd ?? null
    ),
    queryFn: async () => {
      return await client.getLicenseUsageDetails(licenseKey, params)
    },
    enabled: Boolean(licenseKey),
    ...options,
  })
}

export function useTopLicenses(
  client: Client,
  options?: Omit<UseQueryOptions<TopLicensesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TopLicensesResponse, Error>({
    queryKey: QUERY_KEYS.adminAnalytics.topLicenses(),
    queryFn: async () => {
      return await client.getTopLicenses()
    },
    ...options,
  })
}

export function useAlertThresholds(
  client: Client,
  options?: Omit<UseQueryOptions<AlertThresholdsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AlertThresholdsResponse, Error>({
    queryKey: QUERY_KEYS.adminAnalytics.thresholds(),
    queryFn: async () => {
      return await client.getAlertThresholds()
    },
    ...options,
  })
}

export function useUpdateAlertThresholds(
  client: Client,
  options?: UseMutationOptions<AlertThresholdsResponse, Error, UpdateAlertThresholdsRequest>
) {
  const queryClient = useQueryClient()

  return useMutation<AlertThresholdsResponse, Error, UpdateAlertThresholdsRequest>({
    mutationFn: async (request) => {
      return await client.updateAlertThresholds(request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminAnalytics.thresholds() })
    },
    ...options,
  })
}
