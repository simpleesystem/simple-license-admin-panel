/**
 * Tests for useAdminUsers hooks
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  useAdminUser,
  useAdminUsers,
  useChangePassword,
  useCreateUser,
  useCurrentUser,
  useDeleteUser,
  useUpdateUser,
} from '@/hooks/useAdminUsers'
import {
  TEST_ADMIN_ROLE,
  TEST_BOOLEAN_TRUE,
  TEST_EMAIL,
  TEST_NUMBER_ONE,
  TEST_NUMBER_TEN,
  TEST_PASSWORD,
  TEST_USER_ID,
  TEST_USERNAME,
} from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useAdminUsers', () => {
  describe('useAdminUsers', () => {
    it('should fetch users list successfully', async () => {
      const client = createTestClient()
      const users = [
        {
          id: TEST_USER_ID,
          username: TEST_USERNAME,
          email: TEST_EMAIL,
          role: TEST_ADMIN_ROLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const listResponse = {
        success: true,
        data: users,
        pagination: {
          page: TEST_NUMBER_ONE,
          limit: TEST_NUMBER_TEN,
          total: TEST_NUMBER_ONE,
          totalPages: TEST_NUMBER_ONE,
        },
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(listResponse)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useAdminUsers(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toBeDefined()
    })
  })

  describe('useAdminUser', () => {
    it('should fetch single user successfully', async () => {
      const client = createTestClient()
      const user = {
        id: TEST_USER_ID,
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        role: TEST_ADMIN_ROLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ user })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useAdminUser(client, TEST_USER_ID), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.user).toBeDefined()
    })
  })

  describe('useCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      const client = createTestClient()
      const user = {
        id: TEST_USER_ID,
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        role: TEST_ADMIN_ROLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ user })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useCurrentUser(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.user).toBeDefined()
    })
  })

  describe('useCreateUser', () => {
    it('should create user successfully', async () => {
      const client = createTestClient()
      const user = {
        id: TEST_USER_ID,
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        role: TEST_ADMIN_ROLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ user })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useCreateUser(client), { wrapper })

      result.current.mutate({
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.user).toBeDefined()
    })
  })

  describe('useUpdateUser', () => {
    it('should update user successfully', async () => {
      const client = createTestClient()
      const user = {
        id: TEST_USER_ID,
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        role: TEST_ADMIN_ROLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockPut = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ user })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.put = mockPut

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useUpdateUser(client), { wrapper })

      result.current.mutate({
        id: TEST_USER_ID,
        data: { email: TEST_EMAIL },
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.user).toBeDefined()
    })
  })

  describe('useDeleteUser', () => {
    it('should delete user successfully', async () => {
      const client = createTestClient()
      const mockDelete = vi
        .fn()
        .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.delete = mockDelete

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useDeleteUser(client), { wrapper })

      result.current.mutate(TEST_USER_ID)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('useChangePassword', () => {
    it('should change password successfully', async () => {
      const client = createTestClient()
      const mockPatch = vi
        .fn()
        .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.patch = mockPatch

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useChangePassword(client), { wrapper })

      result.current.mutate({
        current_password: TEST_PASSWORD,
        new_password: TEST_PASSWORD,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })
})
