import { faker } from '@faker-js/faker'
import { buildTenant } from '@test/factories/tenantFactory'
import { renderHookWithQueryClient } from '@test/utils/renderHookWithQueryClient'
import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Client } from '@/simpleLicense'
import {
  useAdminTenants,
  useCreateTenant,
  useCreateTenantBackup,
  useQuotaConfig,
  useQuotaUsage,
  useResumeTenant,
  useSuspendTenant,
  useUpdateQuotaLimits,
  useUpdateTenant,
} from '@/simpleLicense/hooks/useAdminTenants'

describe('useAdminTenants hooks', () => {
  let mockClient: Client
  const mockTenantId = faker.string.uuid()

  beforeEach(() => {
    mockClient = {
      listTenants: vi.fn(),
      createTenant: vi.fn(),
      updateTenant: vi.fn(),
      suspendTenant: vi.fn(),
      resumeTenant: vi.fn(),
      createTenantBackup: vi.fn(),
      getQuotaUsage: vi.fn(),
      getQuotaConfig: vi.fn(),
      updateQuotaLimits: vi.fn(),
    } as unknown as Client
  })

  describe('useAdminTenants', () => {
    it('fetches tenants successfully', async () => {
      const tenants = [buildTenant(), buildTenant()]
      const mockResponse = { data: tenants, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } }
      ;(mockClient.listTenants as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminTenants(mockClient))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.listTenants).toHaveBeenCalled()
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch tenants')
      ;(mockClient.listTenants as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useAdminTenants(mockClient))

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useCreateTenant', () => {
    it('creates tenant successfully and invalidates queries', async () => {
      const tenant = buildTenant()
      const mockRequest = {
        name: tenant.name,
        status: tenant.status,
      }
      const mockResponse = { tenant }
      ;(mockClient.createTenant as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useCreateTenant(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.createTenant).toHaveBeenCalledWith(mockRequest)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles create error', async () => {
      const mockRequest = {
        name: faker.company.name(),
      }
      const mockError = new Error('Failed to create tenant')
      ;(mockClient.createTenant as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useCreateTenant(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUpdateTenant', () => {
    it('updates tenant successfully and invalidates queries', async () => {
      const tenant = buildTenant()
      const mockRequest = {
        id: tenant.id,
        data: {
          name: tenant.name,
        },
      }
      const mockResponse = { tenant }
      ;(mockClient.updateTenant as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useUpdateTenant(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.updateTenant).toHaveBeenCalledWith(mockRequest.id, mockRequest.data)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles update error', async () => {
      const mockRequest = {
        id: mockTenantId,
        data: {
          name: faker.company.name(),
        },
      }
      const mockError = new Error('Failed to update tenant')
      ;(mockClient.updateTenant as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useUpdateTenant(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useSuspendTenant', () => {
    it('suspends tenant successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.suspendTenant as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useSuspendTenant(mockClient), {
        queryClient,
      })

      result.current.mutate(mockTenantId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.suspendTenant).toHaveBeenCalledWith(mockTenantId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles suspend error', async () => {
      const mockError = new Error('Failed to suspend tenant')
      ;(mockClient.suspendTenant as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useSuspendTenant(mockClient))

      result.current.mutate(mockTenantId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useResumeTenant', () => {
    it('resumes tenant successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.resumeTenant as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useResumeTenant(mockClient), {
        queryClient,
      })

      result.current.mutate(mockTenantId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.resumeTenant).toHaveBeenCalledWith(mockTenantId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles resume error', async () => {
      const mockError = new Error('Failed to resume tenant')
      ;(mockClient.resumeTenant as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useResumeTenant(mockClient))

      result.current.mutate(mockTenantId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useCreateTenantBackup', () => {
    it('creates tenant backup successfully and invalidates queries', async () => {
      const mockResponse = { backupUrl: faker.internet.url() }
      ;(mockClient.createTenantBackup as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useCreateTenantBackup(mockClient), {
        queryClient,
      })

      result.current.mutate(mockTenantId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.createTenantBackup).toHaveBeenCalledWith(mockTenantId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles backup creation error', async () => {
      const mockError = new Error('Failed to create backup')
      ;(mockClient.createTenantBackup as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useCreateTenantBackup(mockClient))

      result.current.mutate(mockTenantId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useQuotaUsage', () => {
    it('fetches quota usage successfully', async () => {
      const mockResponse = {
        usage: {
          products_count: faker.number.int({ min: 0, max: 100 }),
          activations_count: faker.number.int({ min: 0, max: 1000 }),
          max_products: faker.number.int({ min: 1, max: 100 }),
          max_activations_per_product: faker.number.int({ min: 1, max: 1000 }),
          max_activations_total: faker.number.int({ min: 1, max: 10000 }),
        },
      }
      ;(mockClient.getQuotaUsage as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useQuotaUsage(mockClient, mockTenantId))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.getQuotaUsage).toHaveBeenCalledWith(mockTenantId)
    })

    it('does not fetch when tenantId is empty', () => {
      const { result } = renderHookWithQueryClient(() => useQuotaUsage(mockClient, ''))

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.getQuotaUsage).not.toHaveBeenCalled()
    })
  })

  describe('useQuotaConfig', () => {
    it('fetches quota config successfully', async () => {
      const mockResponse = {
        config: {
          max_products: faker.number.int({ min: 1, max: 100 }),
          max_products_soft: faker.number.int({ min: 1, max: 100 }),
          max_activations_per_product: faker.number.int({ min: 1, max: 1000 }),
          max_activations_per_product_soft: faker.number.int({ min: 1, max: 1000 }),
          max_activations_total: faker.number.int({ min: 1, max: 10000 }),
          max_activations_total_soft: faker.number.int({ min: 1, max: 10000 }),
          quota_warning_threshold: faker.number.float({ min: 0, max: 1 }),
        },
      }
      ;(mockClient.getQuotaConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useQuotaConfig(mockClient, mockTenantId))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.getQuotaConfig).toHaveBeenCalledWith(mockTenantId)
    })

    it('does not fetch when tenantId is empty', () => {
      const { result } = renderHookWithQueryClient(() => useQuotaConfig(mockClient, ''))

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.getQuotaConfig).not.toHaveBeenCalled()
    })
  })

  describe('useUpdateQuotaLimits', () => {
    it('updates quota limits successfully and invalidates queries', async () => {
      const mockRequest = {
        tenantId: mockTenantId,
        data: {
          max_products: faker.number.int({ min: 1, max: 100 }),
          max_activations_per_product: faker.number.int({ min: 1, max: 1000 }),
        },
      }
      const mockResponse = { success: true }
      ;(mockClient.updateQuotaLimits as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useUpdateQuotaLimits(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.updateQuotaLimits).toHaveBeenCalledWith(mockRequest.tenantId, mockRequest.data)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles update error', async () => {
      const mockRequest = {
        tenantId: mockTenantId,
        data: {
          max_products: faker.number.int({ min: 1, max: 100 }),
        },
      }
      const mockError = new Error('Failed to update quota limits')
      ;(mockClient.updateQuotaLimits as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useUpdateQuotaLimits(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })
})
