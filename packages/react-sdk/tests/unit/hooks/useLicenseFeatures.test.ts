/**
 * Tests for useLicenseFeatures hook
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLicenseFeatures } from '@/hooks/useLicenseFeatures'
import {
  TEST_BOOLEAN_FALSE,
  TEST_BOOLEAN_TRUE,
  TEST_LICENSE_KEY,
  TEST_PRODUCT_ID,
  TEST_TIER_CODE_PROFESSIONAL,
} from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useLicenseFeatures', () => {
  it('should fetch license features successfully', async () => {
    const client = createTestClient()
    const featuresData = {
      features: {
        feature1: 'value1',
      },
      tier: {
        id: 'tier-123',
        productId: TEST_PRODUCT_ID,
        tierCode: TEST_TIER_CODE_PROFESSIONAL,
        tierName: 'Professional',
        isActive: TEST_BOOLEAN_TRUE,
        doesNotExpire: TEST_BOOLEAN_FALSE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
    const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(featuresData)))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.get = mockGet

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseFeatures(client, TEST_LICENSE_KEY), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.features).toBeDefined()
    expect(result.current.data?.tier).toBeDefined()
  })

  it('should handle fetch error', async () => {
    const client = createTestClient()
    const mockGet = vi.fn().mockRejectedValue(new Error('Fetch failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.get = mockGet

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseFeatures(client, TEST_LICENSE_KEY), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should use staleTime when provided', async () => {
    const client = createTestClient()
    const featuresData = {
      features: {
        feature1: 'value1',
      },
      tier: {
        id: 'tier-123',
        productId: TEST_PRODUCT_ID,
        tierCode: TEST_TIER_CODE_PROFESSIONAL,
        tierName: 'Professional',
        isActive: TEST_BOOLEAN_TRUE,
        doesNotExpire: TEST_BOOLEAN_FALSE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
    const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(featuresData)))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.get = mockGet

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseFeatures(client, TEST_LICENSE_KEY, { staleTime: 5000 }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.features).toBeDefined()
  })
})
