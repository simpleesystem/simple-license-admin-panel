/**
 * Tests for useAdminTenants hooks
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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
} from '@/hooks/useAdminTenants'
import { TEST_BOOLEAN_TRUE, TEST_NUMBER_ONE, TEST_NUMBER_TEN, TEST_TENANT_ID, TEST_TENANT_NAME } from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useAdminTenants', () => {
  describe('useAdminTenants', () => {
    it('should fetch tenants list successfully', async () => {
      const client = createTestClient()
      const tenants = [
        {
          id: TEST_TENANT_ID,
          name: TEST_TENANT_NAME,
          status: 'ACTIVE' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const listResponse = {
        success: true,
        data: tenants,
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
      const { result } = renderHook(() => useAdminTenants(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toBeDefined()
    })
  })

  describe('useCreateTenant', () => {
    it('should create tenant successfully', async () => {
      const client = createTestClient()
      const tenant = {
        id: TEST_TENANT_ID,
        name: TEST_TENANT_NAME,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ tenant })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useCreateTenant(client), { wrapper })

      result.current.mutate({ name: TEST_TENANT_NAME })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.tenant).toBeDefined()
    })
  })

  describe('useUpdateTenant', () => {
    it('should update tenant successfully', async () => {
      const client = createTestClient()
      const tenant = {
        id: TEST_TENANT_ID,
        name: TEST_TENANT_NAME,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockPut = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ tenant })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.put = mockPut

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useUpdateTenant(client), { wrapper })

      result.current.mutate({
        id: TEST_TENANT_ID,
        data: { name: TEST_TENANT_NAME },
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.tenant).toBeDefined()
    })
  })

  describe('useSuspendTenant', () => {
    it('should suspend tenant successfully', async () => {
      const client = createTestClient()
      const mockPost = vi
        .fn()
        .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useSuspendTenant(client), { wrapper })

      result.current.mutate(TEST_TENANT_ID)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('useResumeTenant', () => {
    it('should resume tenant successfully', async () => {
      const client = createTestClient()
      const mockPost = vi
        .fn()
        .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useResumeTenant(client), { wrapper })

      result.current.mutate(TEST_TENANT_ID)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('useQuotaUsage', () => {
    it('should fetch quota usage successfully', async () => {
      const client = createTestClient()
      const quotaUsage = {
        usage: {
          products_count: TEST_NUMBER_ONE,
          activations_count: TEST_NUMBER_TEN,
        },
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(quotaUsage)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useQuotaUsage(client, TEST_TENANT_ID), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.usage).toBeDefined()
    })
  })

  describe('useQuotaConfig', () => {
    it('should fetch quota config successfully', async () => {
      const client = createTestClient()
      const quotaConfig = {
        config: {
          max_products: TEST_NUMBER_TEN,
        },
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(quotaConfig)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useQuotaConfig(client, TEST_TENANT_ID), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.config).toBeDefined()
    })
  })

  describe('useUpdateQuotaLimits', () => {
    it('should update quota limits successfully', async () => {
      const client = createTestClient()
      const mockPut = vi
        .fn()
        .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.put = mockPut

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useUpdateQuotaLimits(client), { wrapper })

      result.current.mutate({
        tenantId: TEST_TENANT_ID,
        data: {
          max_products: TEST_NUMBER_TEN,
        },
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('useCreateTenantBackup', () => {
    it('should create tenant backup successfully', async () => {
      const client = createTestClient()
      const backup = {
        backup: {
          id: 'backup-1',
          backupName: 'tenant-backup',
          backupType: 'database',
          createdAt: new Date().toISOString(),
        },
      }
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(backup)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useCreateTenantBackup(client), { wrapper })

      result.current.mutate(TEST_TENANT_ID)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.backup).toBeDefined()
    })
  })
})
