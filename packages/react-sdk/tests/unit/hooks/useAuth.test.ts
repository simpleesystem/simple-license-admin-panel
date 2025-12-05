/**
 * Tests for useAuth hooks
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLogin, useLogout } from '@/hooks/useAuth'
import {
  TEST_ADMIN_ROLE,
  TEST_AUTH_TOKEN,
  TEST_AUTH_TOKEN_EXPIRES_IN,
  TEST_EMAIL,
  TEST_PASSWORD,
  TEST_USER_ID,
  TEST_USERNAME,
} from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper, createTestQueryClient } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useAuth', () => {
  describe('useLogin', () => {
    it('should login successfully', async () => {
      const client = createTestClient()
      const loginData = {
        token: TEST_AUTH_TOKEN,
        token_type: 'Bearer',
        expires_in: TEST_AUTH_TOKEN_EXPIRES_IN,
        user: {
          id: TEST_USER_ID,
          username: TEST_USERNAME,
          email: TEST_EMAIL,
          role: TEST_ADMIN_ROLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(loginData)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useLogin(client), { wrapper })

      result.current.mutate({ username: TEST_USERNAME, password: TEST_PASSWORD })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.token).toBe(TEST_AUTH_TOKEN)
      expect(result.current.data?.user.username).toBe(TEST_USERNAME)
    })

    it('should handle login error', async () => {
      const client = createTestClient()
      const mockPost = vi.fn().mockRejectedValue(new Error('Login failed'))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useLogin(client), { wrapper })

      result.current.mutate({ username: TEST_USERNAME, password: TEST_PASSWORD })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useLogout', () => {
    it('should logout successfully', async () => {
      const client = createTestClient()
      const queryClient = createTestQueryClient()
      const wrapper = createQueryClientWrapper(queryClient)

      // Set some query data to verify it gets cleared
      queryClient.setQueryData(['auth', 'token'], TEST_AUTH_TOKEN)

      const { result } = renderHook(() => useLogout(client), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify token is cleared
      expect(client.getToken()).toBeNull()
    })
  })
})
