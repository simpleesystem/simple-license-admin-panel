/**
 * React Query hooks for authentication
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type { LoginRequest, LoginResponse } from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useLogin(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (request: LoginRequest) => {
      return await client.login(request.username, request.password)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth.currentUser(), data.user)
      queryClient.setQueryData(QUERY_KEYS.auth.token(), data.token)
    },
  })
}

export function useLogout(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      client.setToken(null, null)
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
