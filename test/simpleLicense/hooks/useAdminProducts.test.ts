import { describe, expect, it, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import type { Client } from '@/simpleLicense'
import {
  useAdminProducts,
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useSuspendProduct,
  useResumeProduct,
} from '@/simpleLicense/hooks/useAdminProducts'
import { buildProduct } from '@test/factories/licenseFactory'
import { renderHookWithQueryClient } from '@test/utils/renderHookWithQueryClient'
import { faker } from '@faker-js/faker'

describe('useAdminProducts hooks', () => {
  let mockClient: Client
  const mockProductId = faker.string.uuid()

  beforeEach(() => {
    mockClient = {
      listProducts: vi.fn(),
      getProduct: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
      suspendProduct: vi.fn(),
      resumeProduct: vi.fn(),
    } as unknown as Client
  })

  describe('useAdminProducts', () => {
    it('fetches products successfully', async () => {
      const products = [buildProduct(), buildProduct()]
      const mockResponse = { data: products, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } }
      ;(mockClient.listProducts as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminProducts(mockClient))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.listProducts).toHaveBeenCalled()
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch products')
      ;(mockClient.listProducts as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useAdminProducts(mockClient))

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useAdminProduct', () => {
    it('fetches product successfully', async () => {
      const product = buildProduct()
      const mockResponse = { product }
      ;(mockClient.getProduct as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminProduct(mockClient, mockProductId))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.getProduct).toHaveBeenCalledWith(mockProductId)
    })

    it('does not fetch when id is empty', () => {
      const { result } = renderHookWithQueryClient(() => useAdminProduct(mockClient, ''))

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.getProduct).not.toHaveBeenCalled()
    })
  })

  describe('useCreateProduct', () => {
    it('creates product successfully and invalidates queries', async () => {
      const product = buildProduct()
      const mockRequest = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        is_active: product.isActive,
      }
      const mockResponse = { product }
      ;(mockClient.createProduct as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useCreateProduct(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.createProduct).toHaveBeenCalledWith(mockRequest)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles create error', async () => {
      const mockRequest = {
        name: faker.commerce.productName(),
        slug: faker.lorem.slug(),
      }
      const mockError = new Error('Failed to create product')
      ;(mockClient.createProduct as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useCreateProduct(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUpdateProduct', () => {
    it('updates product successfully and invalidates queries', async () => {
      const product = buildProduct()
      const mockRequest = {
        id: product.id,
        data: {
          name: product.name,
          description: product.description,
        },
      }
      const mockResponse = { product }
      ;(mockClient.updateProduct as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useUpdateProduct(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.updateProduct).toHaveBeenCalledWith(mockRequest.id, mockRequest.data)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles update error', async () => {
      const mockRequest = {
        id: mockProductId,
        data: {
          name: faker.commerce.productName(),
        },
      }
      const mockError = new Error('Failed to update product')
      ;(mockClient.updateProduct as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useUpdateProduct(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useDeleteProduct', () => {
    it('deletes product successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.deleteProduct as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useDeleteProduct(mockClient), {
        queryClient,
      })

      result.current.mutate(mockProductId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.deleteProduct).toHaveBeenCalledWith(mockProductId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles delete error', async () => {
      const mockError = new Error('Failed to delete product')
      ;(mockClient.deleteProduct as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useDeleteProduct(mockClient))

      result.current.mutate(mockProductId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useSuspendProduct', () => {
    it('suspends product successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.suspendProduct as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useSuspendProduct(mockClient), {
        queryClient,
      })

      result.current.mutate(mockProductId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.suspendProduct).toHaveBeenCalledWith(mockProductId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles suspend error', async () => {
      const mockError = new Error('Failed to suspend product')
      ;(mockClient.suspendProduct as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useSuspendProduct(mockClient))

      result.current.mutate(mockProductId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useResumeProduct', () => {
    it('resumes product successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.resumeProduct as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useResumeProduct(mockClient), {
        queryClient,
      })

      result.current.mutate(mockProductId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.resumeProduct).toHaveBeenCalledWith(mockProductId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles resume error', async () => {
      const mockError = new Error('Failed to resume product')
      ;(mockClient.resumeProduct as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useResumeProduct(mockClient))

      result.current.mutate(mockProductId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })
})
