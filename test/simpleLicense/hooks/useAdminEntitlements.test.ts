import { describe, expect, it, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import type { Client } from '@/simpleLicense'
import {
  useProductEntitlements,
  useCreateEntitlement,
  useUpdateEntitlement,
  useDeleteEntitlement,
} from '@/simpleLicense/hooks/useAdminEntitlements'
import { buildEntitlement } from '@test/factories/entitlementFactory'
import { renderHookWithQueryClient } from '@test/utils/renderHookWithQueryClient'
import { faker } from '@faker-js/faker'

describe('useAdminEntitlements hooks', () => {
  let mockClient: Client
  const mockProductId = faker.string.uuid()

  beforeEach(() => {
    mockClient = {
      listEntitlements: vi.fn(),
      createEntitlement: vi.fn(),
      updateEntitlement: vi.fn(),
      deleteEntitlement: vi.fn(),
    } as unknown as Client
  })

  describe('useProductEntitlements', () => {
    it('fetches entitlements successfully', async () => {
      const entitlements = [buildEntitlement(), buildEntitlement()]
      const mockResponse = { data: entitlements }
      ;(mockClient.listEntitlements as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() =>
        useProductEntitlements(mockClient, mockProductId)
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.listEntitlements).toHaveBeenCalledWith(mockProductId)
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch entitlements')
      ;(mockClient.listEntitlements as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() =>
        useProductEntitlements(mockClient, mockProductId)
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })

    it('does not fetch when productId is empty', () => {
      const { result } = renderHookWithQueryClient(() =>
        useProductEntitlements(mockClient, '')
      )

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.listEntitlements).not.toHaveBeenCalled()
    })

    it('respects enabled option', () => {
      const { result } = renderHookWithQueryClient(() =>
        useProductEntitlements(mockClient, mockProductId, { enabled: false })
      )

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.listEntitlements).not.toHaveBeenCalled()
    })
  })

  describe('useCreateEntitlement', () => {
    it('creates entitlement successfully and invalidates queries', async () => {
      const entitlement = buildEntitlement()
      const mockRequest = {
        key: entitlement.key,
        valueType: entitlement.valueType,
        defaultValue: entitlement.defaultValue,
      }
      const mockResponse = { data: entitlement }
      ;(mockClient.createEntitlement as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(
        () => useCreateEntitlement(mockClient, mockProductId),
        { queryClient }
      )

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.createEntitlement).toHaveBeenCalledWith(mockProductId, mockRequest)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles create error', async () => {
      const mockRequest = {
        key: faker.word.sample(),
        valueType: 'string' as const,
        defaultValue: faker.word.sample(),
      }
      const mockError = new Error('Failed to create entitlement')
      ;(mockClient.createEntitlement as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() =>
        useCreateEntitlement(mockClient, mockProductId)
      )

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUpdateEntitlement', () => {
    it('updates entitlement successfully and invalidates queries', async () => {
      const entitlement = buildEntitlement()
      const mockRequest = {
        id: entitlement.id,
        data: {
          key: entitlement.key,
          valueType: entitlement.valueType,
          defaultValue: entitlement.defaultValue,
        },
      }
      const mockResponse = { data: entitlement }
      ;(mockClient.updateEntitlement as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useUpdateEntitlement(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.updateEntitlement).toHaveBeenCalledWith(mockRequest.id, mockRequest.data)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles update error', async () => {
      const mockRequest = {
        id: faker.string.uuid(),
        data: {
          key: faker.word.sample(),
          valueType: 'string' as const,
          defaultValue: faker.word.sample(),
        },
      }
      const mockError = new Error('Failed to update entitlement')
      ;(mockClient.updateEntitlement as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useUpdateEntitlement(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useDeleteEntitlement', () => {
    it('deletes entitlement successfully and invalidates queries', async () => {
      const entitlementId = faker.string.uuid()
      const mockResponse = { success: true }
      ;(mockClient.deleteEntitlement as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useDeleteEntitlement(mockClient), {
        queryClient,
      })

      result.current.mutate(entitlementId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.deleteEntitlement).toHaveBeenCalledWith(entitlementId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles delete error', async () => {
      const entitlementId = faker.string.uuid()
      const mockError = new Error('Failed to delete entitlement')
      ;(mockClient.deleteEntitlement as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useDeleteEntitlement(mockClient))

      result.current.mutate(entitlementId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })
})

