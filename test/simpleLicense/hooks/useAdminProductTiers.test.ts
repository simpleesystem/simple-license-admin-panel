import { describe, expect, it, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import type { Client } from '@/simpleLicense'
import {
  useProductTiers,
  useCreateProductTier,
  useUpdateProductTier,
  useDeleteProductTier,
} from '@/simpleLicense/hooks/useAdminProductTiers'
import { buildProductTier } from '@test/factories/licenseFactory'
import { renderHookWithQueryClient } from '@test/utils/renderHookWithQueryClient'
import { faker } from '@faker-js/faker'

describe('useAdminProductTiers hooks', () => {
  let mockClient: Client
  const mockProductId = faker.string.uuid()

  beforeEach(() => {
    mockClient = {
      listProductTiers: vi.fn(),
      createProductTier: vi.fn(),
      updateProductTier: vi.fn(),
      deleteProductTier: vi.fn(),
    } as unknown as Client
  })

  describe('useProductTiers', () => {
    it('fetches product tiers successfully', async () => {
      const tiers = [buildProductTier(), buildProductTier()]
      const mockResponse = { data: tiers }
      ;(mockClient.listProductTiers as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() =>
        useProductTiers(mockClient, mockProductId)
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.listProductTiers).toHaveBeenCalledWith(mockProductId)
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch product tiers')
      ;(mockClient.listProductTiers as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() =>
        useProductTiers(mockClient, mockProductId)
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })

    it('does not fetch when productId is empty', () => {
      const { result } = renderHookWithQueryClient(() => useProductTiers(mockClient, ''))

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.listProductTiers).not.toHaveBeenCalled()
    })

    it('respects enabled option', () => {
      const { result } = renderHookWithQueryClient(() =>
        useProductTiers(mockClient, mockProductId, { enabled: false })
      )

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.listProductTiers).not.toHaveBeenCalled()
    })
  })

  describe('useCreateProductTier', () => {
    it('creates product tier successfully and invalidates queries', async () => {
      const tier = buildProductTier()
      const mockRequest = {
        tierCode: tier.tierCode,
        tierName: tier.tierName,
        description: tier.description,
        isActive: tier.isActive,
        maxActivations: tier.maxActivations,
        doesNotExpire: tier.doesNotExpire,
        licenseTermDays: tier.licenseTermDays,
      }
      const mockResponse = { data: tier }
      ;(mockClient.createProductTier as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(
        () => useCreateProductTier(mockClient, mockProductId),
        { queryClient }
      )

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.createProductTier).toHaveBeenCalledWith(mockProductId, mockRequest)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles create error', async () => {
      const mockRequest = {
        tierCode: faker.helpers.arrayElement(['FREE', 'STARTER', 'PROFESSIONAL']),
        tierName: faker.commerce.productAdjective(),
        description: faker.commerce.productDescription(),
        isActive: faker.datatype.boolean(),
        maxActivations: faker.number.int({ min: 1, max: 100 }),
        doesNotExpire: faker.datatype.boolean(),
        licenseTermDays: faker.number.int({ min: 7, max: 365 }),
      }
      const mockError = new Error('Failed to create product tier')
      ;(mockClient.createProductTier as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() =>
        useCreateProductTier(mockClient, mockProductId)
      )

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUpdateProductTier', () => {
    it('updates product tier successfully and invalidates queries', async () => {
      const tier = buildProductTier()
      const mockRequest = {
        id: tier.id,
        data: {
          tierCode: tier.tierCode,
          tierName: tier.tierName,
          description: tier.description,
          isActive: tier.isActive,
          maxActivations: tier.maxActivations,
          doesNotExpire: tier.doesNotExpire,
          licenseTermDays: tier.licenseTermDays,
        },
      }
      const mockResponse = { data: tier }
      ;(mockClient.updateProductTier as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useUpdateProductTier(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.updateProductTier).toHaveBeenCalledWith(mockRequest.id, mockRequest.data)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles update error', async () => {
      const mockRequest = {
        id: faker.string.uuid(),
        data: {
          tierCode: faker.helpers.arrayElement(['FREE', 'STARTER', 'PROFESSIONAL']),
          tierName: faker.commerce.productAdjective(),
          description: faker.commerce.productDescription(),
          isActive: faker.datatype.boolean(),
          maxActivations: faker.number.int({ min: 1, max: 100 }),
          doesNotExpire: faker.datatype.boolean(),
          licenseTermDays: faker.number.int({ min: 7, max: 365 }),
        },
      }
      const mockError = new Error('Failed to update product tier')
      ;(mockClient.updateProductTier as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useUpdateProductTier(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useDeleteProductTier', () => {
    it('deletes product tier successfully and invalidates queries', async () => {
      const tierId = faker.string.uuid()
      const mockResponse = { success: true }
      ;(mockClient.deleteProductTier as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useDeleteProductTier(mockClient), {
        queryClient,
      })

      result.current.mutate(tierId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.deleteProductTier).toHaveBeenCalledWith(tierId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles delete error', async () => {
      const tierId = faker.string.uuid()
      const mockError = new Error('Failed to delete product tier')
      ;(mockClient.deleteProductTier as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useDeleteProductTier(mockClient))

      result.current.mutate(tierId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })
})
