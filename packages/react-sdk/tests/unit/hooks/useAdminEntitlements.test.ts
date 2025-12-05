/**
 * Tests for useAdminEntitlements hooks
 * @vitest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  useCreateEntitlement,
  useDeleteEntitlement,
  useProductEntitlements,
  useUpdateEntitlement,
} from '@/hooks/useAdminEntitlements'
import type { Entitlement } from '@/types/license'
import {
  TEST_ENTITLEMENT_KEY,
  TEST_NUMBER_ONE,
  TEST_NUMBER_TEN,
  TEST_PRODUCT_ID,
  TEST_STRING_VALUE,
} from '../../constants'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

const createEntitlementRecord = (): Entitlement => ({
  id: TEST_NUMBER_ONE,
  key: TEST_ENTITLEMENT_KEY,
  description: TEST_STRING_VALUE,
  valueType: 'string',
  defaultValue: TEST_STRING_VALUE,
  usageLimit: null,
  metadata: {},
  productId: TEST_PRODUCT_ID,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

describe('useAdminEntitlements', () => {
  it('fetches product entitlements successfully', async () => {
    const client = createTestClient()
    const entitlement = createEntitlementRecord()
    const listResponse = {
      success: true,
      data: [entitlement],
      pagination: {
        page: TEST_NUMBER_ONE,
        limit: TEST_NUMBER_TEN,
        total: TEST_NUMBER_TEN,
        totalPages: TEST_NUMBER_ONE,
      },
    }
    vi.spyOn(client, 'listEntitlements').mockResolvedValue(listResponse)

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useProductEntitlements(client, TEST_PRODUCT_ID), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.data?.[0]).toEqual(entitlement)
  })

  it('creates an entitlement', async () => {
    const client = createTestClient()
    const entitlement = createEntitlementRecord()
    vi.spyOn(client, 'createEntitlement').mockResolvedValue({ entitlement })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useCreateEntitlement(client, TEST_PRODUCT_ID), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        key: TEST_ENTITLEMENT_KEY,
        value_type: 'string',
        default_value: TEST_STRING_VALUE,
      })
    })

    expect(client.createEntitlement).toHaveBeenCalledWith(TEST_PRODUCT_ID, {
      key: TEST_ENTITLEMENT_KEY,
      value_type: 'string',
      default_value: TEST_STRING_VALUE,
    })
  })

  it('updates an entitlement', async () => {
    const client = createTestClient()
    const entitlement = createEntitlementRecord()
    vi.spyOn(client, 'updateEntitlement').mockResolvedValue({ entitlement })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useUpdateEntitlement(client), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        id: String(entitlement.id),
        data: {
          description: TEST_STRING_VALUE,
        },
      })
    })

    expect(client.updateEntitlement).toHaveBeenCalled()
  })

  it('deletes an entitlement', async () => {
    const client = createTestClient()
    vi.spyOn(client, 'deleteEntitlement').mockResolvedValue({ success: true })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useDeleteEntitlement(client), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(String(TEST_NUMBER_ONE))
    })

    expect(client.deleteEntitlement).toHaveBeenCalledWith(String(TEST_NUMBER_ONE))
  })
})
