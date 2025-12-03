import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { ProductManagementExample, type ProductListItem } from '../../../src/ui/workflows/ProductManagementExample'

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

vi.mock('../../../src/ui/workflows/ProductRowActions', () => ({
  ProductRowActions: ({ productId }: { productId: string }) => <div data-testid={`row-actions-${productId}`} />,
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const sampleProducts: readonly ProductListItem[] = [
  { id: 'prod-1', name: 'Product One', slug: 'prod-one', isActive: true },
]

describe('ProductManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('runs create flow from CTA button', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(
      <ProductManagementExample client={{} as never} products={sampleProducts} />,
    )

    fireEvent.click(getByText('Create Product'))
    fireEvent.click(getByRole('button', { name: 'Create product' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
  })

  test('runs update flow after clicking edit', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(
      <ProductManagementExample client={{} as never} products={sampleProducts} />,
    )

    fireEvent.click(getByText('Edit'))
    fireEvent.click(getByRole('button', { name: 'Save product' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'prod-1',
        data: expect.any(Object),
      }),
    )
  })
})


