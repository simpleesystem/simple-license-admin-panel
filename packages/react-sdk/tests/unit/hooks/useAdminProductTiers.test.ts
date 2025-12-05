/**
 * Tests for useAdminProductTiers hooks
 * @vitest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  useCreateProductTier,
  useDeleteProductTier,
  useProductTiers,
  useUpdateProductTier,
} from '@/hooks/useAdminProductTiers'
import type { ProductTier } from '@/types/license'
import {
  TEST_NUMBER_ONE,
  TEST_NUMBER_TEN,
  TEST_PRODUCT_DESCRIPTION,
  TEST_PRODUCT_ID,
  TEST_PRODUCT_NAME,
  TEST_TIER_CODE_PROFESSIONAL,
} from '../../constants'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

const createProductTierRecord = (): ProductTier => ({
  id: TEST_NUMBER_ONE,
  code: TEST_TIER_CODE_PROFESSIONAL,
  name: TEST_PRODUCT_NAME,
  description: TEST_PRODUCT_DESCRIPTION,
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

describe('useAdminProductTiers', () => {
  it('fetches product tiers successfully', async () => {
    const client = createTestClient()
    const tier = createProductTierRecord()
    const listResponse = {
      success: true,
      data: [tier],
      pagination: {
        page: TEST_NUMBER_ONE,
        limit: TEST_NUMBER_TEN,
        total: TEST_NUMBER_TEN,
        totalPages: TEST_NUMBER_ONE,
      },
    }
    vi.spyOn(client, 'listProductTiers').mockResolvedValue(listResponse)

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useProductTiers(client, TEST_PRODUCT_ID), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.data?.[0]).toEqual(tier)
  })

  it('creates a product tier', async () => {
    const client = createTestClient()
    const tier = createProductTierRecord()
    vi.spyOn(client, 'createProductTier').mockResolvedValue({ tier })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useCreateProductTier(client, TEST_PRODUCT_ID), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        code: TEST_TIER_CODE_PROFESSIONAL,
        name: TEST_PRODUCT_NAME,
      })
    })

    expect(client.createProductTier).toHaveBeenCalledWith(TEST_PRODUCT_ID, {
      code: TEST_TIER_CODE_PROFESSIONAL,
      name: TEST_PRODUCT_NAME,
    })
  })

  it('updates a product tier', async () => {
    const client = createTestClient()
    const tier = createProductTierRecord()
    vi.spyOn(client, 'updateProductTier').mockResolvedValue({ tier })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useUpdateProductTier(client), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        id: String(tier.id),
        data: { name: TEST_PRODUCT_NAME },
      })
    })

    expect(client.updateProductTier).toHaveBeenCalled()
  })

  it('deletes a product tier', async () => {
    const client = createTestClient()
    vi.spyOn(client, 'deleteProductTier').mockResolvedValue({ success: true })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useDeleteProductTier(client), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(String(TEST_NUMBER_ONE))
    })

    expect(client.deleteProductTier).toHaveBeenCalledWith(String(TEST_NUMBER_ONE))
  })
})
