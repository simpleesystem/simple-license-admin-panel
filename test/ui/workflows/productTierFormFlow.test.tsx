import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { UI_PRODUCT_TIER_FORM_SUBMIT_CREATE, UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE } from '../../../src/ui/constants'
import { ProductTierFormFlow } from '../../../src/ui/workflows/ProductTierFormFlow'
import { buildProductTier } from '../../factories/productTierFactory'
import { buildText } from '../../ui/factories/uiFactories'

const useCreateProductTierMock = vi.hoisted(() => vi.fn())
const useUpdateProductTierMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateProductTier: useCreateProductTierMock,
    useUpdateProductTier: useUpdateProductTierMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('ProductTierFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits create tier and triggers callbacks', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductTierFormFlow
        client={{} as never}
        mode="create"
        productId={buildText()}
        show
        onClose={onClose}
        submitLabel={UI_PRODUCT_TIER_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
    expect(onCompleted).toHaveBeenCalled()
  })

  test('submits update tier with tier id and triggers onCompleted', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const tier = buildProductTier()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductTierFormFlow
        client={{} as never}
        mode="update"
        show
        onClose={() => {}}
        submitLabel={UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE}
        tierId={tier.id}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: tier.id,
        data: expect.any(Object),
      }),
    )
    expect(onCompleted).toHaveBeenCalled()
  })

  test('does not call onCompleted when mutation fails', async () => {
    const mutationError = new Error(buildText())
    const createMutation = {
      mutateAsync: vi.fn(async () => {
        throw mutationError
      }),
      isPending: false,
    }
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductTierFormFlow
        client={{} as never}
        mode="create"
        productId={buildText()}
        show
        onClose={onClose}
        submitLabel={UI_PRODUCT_TIER_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const mutateCall = createMutation.mutateAsync.mock.results[0]?.value as Promise<unknown>
    await expect(mutateCall).rejects.toThrow(mutationError)
    expect(onCompleted).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})


