import { describe, expect, it, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import type { Client } from '@/simpleLicense'
import {
  useAdminUsers,
  useAdminUser,
  useCurrentUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useChangePassword,
} from '@/simpleLicense/hooks/useAdminUsers'
import { buildUser } from '@test/factories/userFactory'
import { renderHookWithQueryClient } from '@test/utils/renderHookWithQueryClient'
import { faker } from '@faker-js/faker'

describe('useAdminUsers hooks', () => {
  let mockClient: Client
  const mockUserId = faker.string.uuid()

  beforeEach(() => {
    mockClient = {
      listUsers: vi.fn(),
      getUser: vi.fn(),
      getCurrentUser: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      changePassword: vi.fn(),
    } as unknown as Client
  })

  describe('useAdminUsers', () => {
    it('fetches users successfully', async () => {
      const users = [buildUser(), buildUser()]
      const mockResponse = { data: users, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } }
      ;(mockClient.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminUsers(mockClient))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.listUsers).toHaveBeenCalled()
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch users')
      ;(mockClient.listUsers as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useAdminUsers(mockClient))

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })

    it('passes filters to client', async () => {
      const filters = { role: 'ADMIN', search: 'test' }
      const mockResponse = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
      ;(mockClient.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminUsers(mockClient, filters))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockClient.listUsers).toHaveBeenCalledWith(filters)
    })
  })

  describe('useAdminUser', () => {
    it('fetches user successfully', async () => {
      const user = buildUser()
      const mockResponse = { user }
      ;(mockClient.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminUser(mockClient, mockUserId))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.getUser).toHaveBeenCalledWith(mockUserId)
    })

    it('does not fetch when id is empty', () => {
      const { result } = renderHookWithQueryClient(() => useAdminUser(mockClient, ''))

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.getUser).not.toHaveBeenCalled()
    })
  })

  describe('useCurrentUser', () => {
    it('fetches current user successfully', async () => {
      const user = buildUser()
      const mockResponse = { user }
      ;(mockClient.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useCurrentUser(mockClient))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.getCurrentUser).toHaveBeenCalled()
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch current user')
      ;(mockClient.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useCurrentUser(mockClient))

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useCreateUser', () => {
    it('creates user successfully and invalidates queries', async () => {
      const user = buildUser()
      const mockRequest = {
        username: user.username,
        email: user.email,
        password: faker.internet.password(),
        role: user.role,
        vendor_id: user.vendorId,
      }
      const mockResponse = { user }
      ;(mockClient.createUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useCreateUser(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.createUser).toHaveBeenCalledWith(mockRequest)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles create error', async () => {
      const mockRequest = {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      }
      const mockError = new Error('Failed to create user')
      ;(mockClient.createUser as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useCreateUser(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUpdateUser', () => {
    it('updates user successfully and invalidates queries', async () => {
      const user = buildUser()
      const mockRequest = {
        id: user.id,
        data: {
          username: user.username,
          email: user.email,
        },
      }
      const mockResponse = { user }
      ;(mockClient.updateUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useUpdateUser(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.updateUser).toHaveBeenCalledWith(mockRequest.id, mockRequest.data)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles update error', async () => {
      const mockRequest = {
        id: mockUserId,
        data: {
          username: faker.internet.username(),
        },
      }
      const mockError = new Error('Failed to update user')
      ;(mockClient.updateUser as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useUpdateUser(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useDeleteUser', () => {
    it('deletes user successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.deleteUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useDeleteUser(mockClient), {
        queryClient,
      })

      result.current.mutate(mockUserId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.deleteUser).toHaveBeenCalledWith(mockUserId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles delete error', async () => {
      const mockError = new Error('Failed to delete user')
      ;(mockClient.deleteUser as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useDeleteUser(mockClient))

      result.current.mutate(mockUserId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useChangePassword', () => {
    it('changes password successfully', async () => {
      const mockRequest = {
        current_password: faker.internet.password(),
        new_password: faker.internet.password(),
      }
      const mockResponse = { success: true }
      ;(mockClient.changePassword as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useChangePassword(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.changePassword).toHaveBeenCalledWith(mockRequest)
    })

    it('handles change password error', async () => {
      const mockRequest = {
        current_password: faker.internet.password(),
        new_password: faker.internet.password(),
      }
      const mockError = new Error('Failed to change password')
      ;(mockClient.changePassword as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useChangePassword(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })
})
