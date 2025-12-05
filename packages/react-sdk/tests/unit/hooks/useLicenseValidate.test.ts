/**
 * Tests for useLicenseValidate hook
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLicenseValidate } from '@/hooks/useLicenseValidate'
import { TEST_DOMAIN, TEST_LICENSE_KEY } from '../../constants'
import { createLicense } from '../../factories/license'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useLicenseValidate', () => {
  it('should validate license successfully', async () => {
    const client = createTestClient()
    const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
    const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ license })))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseValidate(client), { wrapper })

    result.current.mutate({
      licenseKey: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.license).toBeDefined()
    expect(result.current.data?.license.licenseKey).toBe(TEST_LICENSE_KEY)
  })

  it('should handle validation error', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockRejectedValue(new Error('Validation failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseValidate(client), { wrapper })

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
    const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
    const mockPost = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse({ license })))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const onSuccessCallback = vi.fn()

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseValidate(client, { onSuccess: onSuccessCallback }), { wrapper })

    result.current.mutate({
      licenseKey: TEST_LICENSE_KEY,
      domain: TEST_DOMAIN,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(onSuccessCallback).toHaveBeenCalledWith(expect.objectContaining({ license }))
  })

  it('should call onError callback when provided', async () => {
    const client = createTestClient()
    const mockPost = vi.fn().mockRejectedValue(new Error('Validation failed'))
    // @ts-expect-error - accessing private property for testing
    client.httpClient.post = mockPost

    const onErrorCallback = vi.fn()

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useLicenseValidate(client, { onError: onErrorCallback }), { wrapper })

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
