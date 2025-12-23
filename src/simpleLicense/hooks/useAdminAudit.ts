import { type UseQueryOptions, useQuery } from '@tanstack/react-query'

import type { Client } from '../client'
import type {
  AuditLogFilters,
  AuditVerificationParams,
  AuditVerificationResponse,
  GetAuditLogsResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useAuditLogs(
  client: Client,
  filters?: AuditLogFilters,
  options?: Omit<UseQueryOptions<GetAuditLogsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetAuditLogsResponse, Error>({
    queryKey: QUERY_KEYS.adminAudit.logs(filters ?? null),
    queryFn: async () => {
      return await client.getAuditLogs(filters)
    },
    ...options,
  })
}

export function useAuditVerification(
  client: Client,
  params?: AuditVerificationParams,
  options?: Omit<UseQueryOptions<AuditVerificationResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AuditVerificationResponse, Error>({
    queryKey: QUERY_KEYS.adminAudit.verify(params ?? null),
    queryFn: async () => {
      return await client.verifyAuditChain(params)
    },
    ...options,
  })
}
