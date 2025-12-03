import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { ProductFormFlow } from '../../../src/ui/workflows/ProductFormFlow'

const useCreateProductMock = vi.hoisted(() => vi.fn())
const useUpdateProductMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateProduct: useCreateProductMock,
    useUpdateProduct: useUpdateProductMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('ProductFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles create flow submission', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <ProductFormFlow
        client={{} as never}
        mode="create"
        show
        onClose={onClose}
        submitLabel="Create"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  test('handles update flow submission', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)

    const { getByRole } = render(
      <ProductFormFlow
        client={{} as never}
        mode="update"
        productId="product-1"
        show
        onClose={vi.fn()}
        submitLabel="Save"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'product-1',
        data: expect.any(Object),
      }),
    )
  })
})


