import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  AgentServiceAccount,
  CreateAgentServiceAccountRequest,
  CreateAgentServiceAccountResponse,
  IssueAgentServiceCredentialRequest,
  IssueAgentServiceCredentialResponse,
  RevokeAgentServiceCredentialResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useAdminAgentServiceAccounts(client: Client, vendorId?: string | null) {
  return useQuery<AgentServiceAccount[], Error>({
    queryKey: QUERY_KEYS.adminAgentServiceAccounts.all(vendorId ?? null),
    queryFn: async () => {
      return await client.listAgentServiceAccounts(vendorId ?? undefined)
    },
  })
}

export function useCreateAgentServiceAccount(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<CreateAgentServiceAccountResponse, Error, CreateAgentServiceAccountRequest>({
    mutationFn: async (request) => {
      return await client.createAgentServiceAccount(request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminAgentServiceAccounts.all() })
    },
  })
}

export function useIssueAgentServiceCredential(client: Client) {
  return useMutation<
    IssueAgentServiceCredentialResponse,
    Error,
    { serviceAccountId: string; request: IssueAgentServiceCredentialRequest }
  >({
    mutationFn: async ({ serviceAccountId, request }) => {
      return await client.issueAgentServiceCredential(serviceAccountId, request)
    },
  })
}

export function useRevokeAgentServiceCredential(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<RevokeAgentServiceCredentialResponse, Error, string>({
    mutationFn: async (credentialId) => {
      return await client.revokeAgentServiceCredential(credentialId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminAgentServiceAccounts.all() })
    },
  })
}
