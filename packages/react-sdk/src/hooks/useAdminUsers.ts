/**
 * React Query hooks for admin user management
 */
import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../client'
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  CreateUserResponse,
  GetCurrentUserResponse,
  GetUserResponse,
  ListUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from '../types/api'
import { QUERY_KEYS } from './queryKeys'

export function useAdminUsers(
  client: Client,
  options?: Omit<UseQueryOptions<ListUsersResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListUsersResponse, Error>({
    queryKey: QUERY_KEYS.adminUsers.all(),
    queryFn: async () => {
      return await client.listUsers()
    },
    ...options,
  })
}

export function useAdminUser(
  client: Client,
  id: string,
  options?: Omit<UseQueryOptions<GetUserResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetUserResponse, Error>({
    queryKey: QUERY_KEYS.adminUsers.detail(id),
    queryFn: async () => {
      return await client.getUser(id)
    },
    enabled: Boolean(id),
    ...options,
  })
}

export function useCurrentUser(
  client: Client,
  options?: Omit<UseQueryOptions<GetCurrentUserResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetCurrentUserResponse, Error>({
    queryKey: QUERY_KEYS.adminUsers.current(),
    queryFn: async () => {
      return await client.getCurrentUser()
    },
    ...options,
  })
}

export function useCreateUser(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<CreateUserResponse, Error, CreateUserRequest>({
    mutationFn: async (request) => {
      return await client.createUser(request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers.all() })
    },
  })
}

export function useUpdateUser(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<UpdateUserResponse, Error, { id: string; data: UpdateUserRequest }>({
    mutationFn: async ({ id, data }) => {
      return await client.updateUser(id, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers.current() })
    },
  })
}

export function useDeleteUser(client: Client) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await client.deleteUser(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers.all() })
    },
  })
}

export function useChangePassword(client: Client) {
  return useMutation<{ success: boolean }, Error, ChangePasswordRequest>({
    mutationFn: async (request) => {
      return await client.changePassword(request)
    },
  })
}
