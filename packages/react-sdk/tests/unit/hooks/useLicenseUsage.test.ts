/**
 * Tests for useLicenseUsage hook
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLicenseUsage } from '@/hooks/useLicenseUsage'
import { TEST_DOMAIN, TEST_LICENSE_KEY } from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useLicenseUsage', () => {
  it('should report usage successfully', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ success: true })))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseUsage(client), { wrapper })

    result.current.mutate({
      license_key: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
      month: '2024-01',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle usage report error', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockRejectedValue(new Error('Report failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseUsage(client), { wrapper })

    result.current.mutate({
      license_key: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
      month: '2024-01',
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should call onSuccess callback when provided', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ success: true })))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const onSuccessCallback = vi.fn()

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseUsage(client, { onSuccess: onSuccessCallback }), { wrapper })

    result.current.mutate({
      license_key: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
      month: '2024-01',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(onSuccessCallback).toHaveBeenCalled()
  })

  it('should call onError callback when provided', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockRejectedValue(new Error('Report failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const onErrorCallback = vi.fn()

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseUsage(client, { onError: onErrorCallback }), { wrapper })

    result.current.mutate({
      license_key: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
      month: '2024-01',
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(onErrorCallback).toHaveBeenCalled()
    expect(onErrorCallback.mock.calls[0]?.[0]).toBeInstanceOf(Error)
  })
})
