/**
 * Tests for useAdminProducts hooks
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  useAdminProduct,
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useResumeProduct,
  useSuspendProduct,
  useUpdateProduct,
} from '@/hooks/useAdminProducts'
import {
  TEST_BOOLEAN_TRUE,
  TEST_NUMBER_ONE,
  TEST_NUMBER_TEN,
  TEST_PRODUCT_ID,
  TEST_PRODUCT_NAME,
  TEST_PRODUCT_SLUG,
} from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useAdminProducts', () => {
  describe('useAdminProducts', () => {
    it('should fetch products list successfully', async () => {
      const client = createTestClient()
      const products = [
        {
          id: TEST_PRODUCT_ID,
          slug: TEST_PRODUCT_SLUG,
          name: TEST_PRODUCT_NAME,
          isActive: TEST_BOOLEAN_TRUE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const listResponse = {
        success: true,
        data: products,
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
      const { result } = renderHook(() => useAdminProducts(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toBeDefined()
    })
  })

  describe('useAdminProduct', () => {
    it('should fetch single product successfully', async () => {
      const client = createTestClient()
      const product = {
        id: TEST_PRODUCT_ID,
        slug: TEST_PRODUCT_SLUG,
        name: TEST_PRODUCT_NAME,
        isActive: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ product })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useAdminProduct(client, TEST_PRODUCT_ID), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.product).toBeDefined()
    })
  })

  describe('useCreateProduct', () => {
    it('should create product successfully', async () => {
      const client = createTestClient()
      const product = {
        id: TEST_PRODUCT_ID,
        slug: TEST_PRODUCT_SLUG,
        name: TEST_PRODUCT_NAME,
        isActive: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ product })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useCreateProduct(client), { wrapper })

      result.current.mutate({
        name: TEST_PRODUCT_NAME,
        slug: TEST_PRODUCT_SLUG,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.product).toBeDefined()
    })
  })

  describe('useUpdateProduct', () => {
    it('should update product successfully', async () => {
      const client = createTestClient()
      const product = {
        id: TEST_PRODUCT_ID,
        slug: TEST_PRODUCT_SLUG,
        name: TEST_PRODUCT_NAME,
        isActive: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockPut = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ product })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.put = mockPut

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useUpdateProduct(client), { wrapper })

      result.current.mutate({
        id: TEST_PRODUCT_ID,
        data: { name: TEST_PRODUCT_NAME },
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.product).toBeDefined()
    })
  })

  describe('useDeleteProduct', () => {
    it('should delete product successfully', async () => {
      const client = createTestClient()
      const mockDelete = vi
        .fn()
        .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.delete = mockDelete

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useDeleteProduct(client), { wrapper })

      result.current.mutate(TEST_PRODUCT_ID)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('useSuspendProduct', () => {
    it('should suspend product successfully', async () => {
      const client = createTestClient()
      const mockPost = vi
        .fn()
        .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useSuspendProduct(client), { wrapper })

      result.current.mutate(TEST_PRODUCT_ID)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('useResumeProduct', () => {
    it('should resume product successfully', async () => {
      const client = createTestClient()
      const mockPost = vi
        .fn()
        .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useResumeProduct(client), { wrapper })

      result.current.mutate(TEST_PRODUCT_ID)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })
})
