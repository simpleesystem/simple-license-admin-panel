import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { ProductTierFormFlow } from '../../../src/ui/workflows/ProductTierFormFlow'

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

  test('submits create tier for selected product', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <ProductTierFormFlow
        client={{} as never}
        mode="create"
        productId="prod-1"
        show
        onClose={onClose}
        submitLabel="Create tier"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Create tier' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  test('submits update tier with tier id', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)

    const { getByRole } = render(
      <ProductTierFormFlow
        client={{} as never}
        mode="update"
        show
        onClose={() => {}}
        submitLabel="Save tier"
        tierId="tier-1"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Save tier' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'tier-1',
        data: expect.any(Object),
      }),
    )
  })
})


