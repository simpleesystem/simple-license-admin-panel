import { type UseQueryOptions, useQuery } from '@tanstack/react-query'

import type { Client } from '../client'
import type { HealthMetricsResponse, HealthSnapshotResponse, MetricsResponse, ServerStatusResponse } from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useServerStatus(
  client: Client,
  options?: Omit<UseQueryOptions<ServerStatusResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ServerStatusResponse, Error>({
    queryKey: QUERY_KEYS.adminSystem.status(),
    queryFn: async () => {
      return await client.getServerStatus()
    },
    ...options,
  })
}

export function useHealthMetrics(
  client: Client,
  options?: Omit<UseQueryOptions<HealthMetricsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<HealthMetricsResponse, Error>({
    queryKey: QUERY_KEYS.adminSystem.health(),
    queryFn: async () => {
      return await client.getHealthMetrics()
    },
    ...options,
  })
}

export function useSystemMetrics(
  client: Client,
  options?: Omit<UseQueryOptions<MetricsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<MetricsResponse, Error>({
    queryKey: QUERY_KEYS.adminSystem.metrics(),
    queryFn: async () => {
      return await client.getSystemMetrics()
    },
    ...options,
  })
}

export function useHealthSnapshot(
  client: Client,
  options?: Omit<UseQueryOptions<HealthSnapshotResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<HealthSnapshotResponse, Error>({
    queryKey: QUERY_KEYS.adminSystem.healthSnapshot(),
    queryFn: async () => {
      return await client.getHealthSnapshot()
    },
    ...options,
  })
}
