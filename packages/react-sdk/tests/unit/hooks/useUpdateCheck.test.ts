/**
 * Tests for useUpdateCheck hook
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useUpdateCheck } from '@/hooks/useUpdateCheck'
import {
  TEST_BOOLEAN_FALSE,
  TEST_CLIENT_VERSION,
  TEST_DOMAIN,
  TEST_LICENSE_KEY,
  TEST_PRODUCT_SLUG,
} from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useUpdateCheck', () => {
  it('should check for updates successfully', async () => {
    const client = createTestClient()
    const updateData = {
      update_available: TEST_BOOLEAN_FALSE,
      latest_version: TEST_CLIENT_VERSION,
    }
    const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(updateData)))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useUpdateCheck(client), { wrapper })

    result.current.mutate({
      license_key: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
      slug: TEST_PRODUCT_SLUG,
      current_version: TEST_CLIENT_VERSION,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.update_available).toBeDefined()
  })

  it('should handle update check error', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockRejectedValue(new Error('Update check failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useUpdateCheck(client), { wrapper })

    result.current.mutate({
      license_key: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
      slug: TEST_PRODUCT_SLUG,
      current_version: TEST_CLIENT_VERSION,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})
