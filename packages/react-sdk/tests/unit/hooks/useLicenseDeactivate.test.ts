/**
 * Tests for useLicenseDeactivate hook
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLicenseDeactivate } from '@/hooks/useLicenseDeactivate'
import { TEST_BOOLEAN_TRUE, TEST_DOMAIN, TEST_LICENSE_KEY } from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useLicenseDeactivate', () => {
  it('should deactivate license successfully', async () => {
    const client = createTestClient()
    const mockPost = vi
      .fn()
      .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseDeactivate(client), { wrapper })

    result.current.mutate({
      licenseKey: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.success).toBe(TEST_BOOLEAN_TRUE)
  })

  it('should handle deactivation error', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockRejectedValue(new Error('Deactivation failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseDeactivate(client), { wrapper })

    result.current.mutate({
      licenseKey: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should call onSuccess callback when provided', async () => {
    const client = createTestClient()
    const mockPost = vi
      .fn()
      .mockResolvedValue(createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE })))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const onSuccessCallback = vi.fn()

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseDeactivate(client, { onSuccess: onSuccessCallback }), { wrapper })

    result.current.mutate({
      licenseKey: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(onSuccessCallback).toHaveBeenCalled()
  })

  it('should call onError callback when provided', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockRejectedValue(new Error('Deactivation failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const onErrorCallback = vi.fn()

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseDeactivate(client, { onError: onErrorCallback }), { wrapper })

    result.current.mutate({
      licenseKey: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(onErrorCallback).toHaveBeenCalled()
    expect(onErrorCallback.mock.calls[0]?.[0]).toBeInstanceOf(Error)
  })
})
