/**
 * Tests for useAdminLicenses hooks
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  useAdminLicense,
  useAdminLicenses,
  useCreateLicense,
  useFreezeLicense,
  useLicenseActivations,
  useResumeLicense,
  useRevokeLicense,
  useSuspendLicense,
  useUpdateLicense,
} from '@/hooks/useAdminLicenses'
import {
  TEST_CUSTOMER_EMAIL,
  TEST_LICENSE_KEY,
  TEST_NUMBER_ONE,
  TEST_NUMBER_TEN,
  TEST_PRODUCT_SLUG,
  TEST_TIER_CODE_PROFESSIONAL,
} from '../../constants'
import { createLicense } from '../../factories/license'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useAdminLicenses', () => {
  describe('useAdminLicenses', () => {
    it('should fetch licenses list successfully', async () => {
      const client = createTestClient()
      const licenses = [createLicense(), createLicense()]
      const listResponse = {
        success: true,
        data: licenses,
        pagination: {
          page: TEST_NUMBER_ONE,
          limit: TEST_NUMBER_TEN,
          total: TEST_NUMBER_TEN * 2,
          totalPages: TEST_NUMBER_ONE + 1,
        },
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(listResponse)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useAdminLicenses(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toBeDefined()
      expect(result.current.data?.pagination).toBeDefined()
    })

    it('should handle fetch error', async () => {
      const client = createTestClient()
      const mockGet = vi.fn().mockRejectedValue(new Error('Fetch failed'))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useAdminLicenses(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useAdminLicense', () => {
    it('should fetch single license successfully', async () => {
      const client = createTestClient()
      const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ license })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useAdminLicense(client, TEST_LICENSE_KEY), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.license).toBeDefined()
      expect(result.current.data?.license.licenseKey).toBe(TEST_LICENSE_KEY)
    })
  })

  describe('useCreateLicense', () => {
    it('should create license successfully', async () => {
      const client = createTestClient()
      const license = createLicense()
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ license })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useCreateLicense(client), { wrapper })

      result.current.mutate({
        customer_email: TEST_CUSTOMER_EMAIL,
        product_slug: TEST_PRODUCT_SLUG,
        tier_code: TEST_TIER_CODE_PROFESSIONAL,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.license).toBeDefined()
    })
  })

  describe('useUpdateLicense', () => {
    it('should update license successfully', async () => {
      const client = createTestClient()
      const license = createLicense()
      const mockPut = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ license })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.put = mockPut

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useUpdateLicense(client), { wrapper })

      result.current.mutate({
        id: TEST_LICENSE_KEY,
        data: {
          tier_code: TEST_TIER_CODE_PROFESSIONAL,
        },
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.license).toBeDefined()
    })
  })

  describe('useSuspendLicense', () => {
    it('should suspend license successfully', async () => {
      const client = createTestClient()
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ success: true })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useSuspendLicense(client), { wrapper })

      result.current.mutate(TEST_LICENSE_KEY)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
    })
  })

  describe('useResumeLicense', () => {
    it('should resume license successfully', async () => {
      const client = createTestClient()
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ success: true })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useResumeLicense(client), { wrapper })

      result.current.mutate(TEST_LICENSE_KEY)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
    })
  })

  describe('useFreezeLicense', () => {
    it('should freeze license successfully', async () => {
      const client = createTestClient()
      const license = createLicense()
      const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ license })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.post = mockPost

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useFreezeLicense(client), { wrapper })

      result.current.mutate({
        id: TEST_LICENSE_KEY,
        data: { freeze_entitlements: true },
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useRevokeLicense', () => {
    it('should revoke license successfully', async () => {
      const client = createTestClient()
      const mockDelete = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ success: true })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.delete = mockDelete

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useRevokeLicense(client), { wrapper })

      result.current.mutate(TEST_LICENSE_KEY)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
    })
  })

  describe('useLicenseActivations', () => {
    it('should fetch license activations successfully', async () => {
      const client = createTestClient()
      const activations = [
        {
          id: 'activation-1',
          licenseKey: TEST_LICENSE_KEY,
          domain: 'example.com',
          status: 'ACTIVE' as const,
          activatedAt: new Date().toISOString(),
        },
      ]
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ activations })))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useLicenseActivations(client, TEST_LICENSE_KEY), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.activations).toBeDefined()
    })
  })
})
