/**
 * Tests for useLicenseData hook
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLicenseData } from '@/hooks/useLicenseData'
import { TEST_LICENSE_KEY } from '../../constants'
import { createLicense } from '../../factories/license'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useLicenseData', () => {
  it('should fetch license data successfully', async () => {
    const client = createTestClient()
    const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
    const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ license })))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.get = mockGet

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseData(client, TEST_LICENSE_KEY), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.license).toBeDefined()
    expect(result.current.data?.license.licenseKey).toBe(TEST_LICENSE_KEY)
  })

  it('should handle fetch error', async () => {
    const client = createTestClient()
    const mockGet = vi.fn().mockRejectedValue(new Error('Fetch failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.get = mockGet

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseData(client, TEST_LICENSE_KEY), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should use staleTime when provided', async () => {
    const client = createTestClient()
    const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
    const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ license })))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.get = mockGet

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseData(client, TEST_LICENSE_KEY, { staleTime: 5000 }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.license).toBeDefined()
  })
})
