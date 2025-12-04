import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { UI_PRODUCT_FORM_SUBMIT_CREATE, UI_PRODUCT_FORM_SUBMIT_UPDATE } from '../../../src/ui/constants'
import { ProductFormFlow } from '../../../src/ui/workflows/ProductFormFlow'
import { buildProduct } from '../../factories/productFactory'
import { buildText } from '../../ui/factories/uiFactories'

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

  test('submits create flow and triggers callbacks', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductFormFlow
        client={{} as never}
        mode="create"
        show
        onClose={onClose}
        submitLabel={UI_PRODUCT_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
    expect(onCompleted).toHaveBeenCalled()
  })

  test('submits update flow with provided product id and triggers onCompleted', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const product = buildProduct()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductFormFlow
        client={{} as never}
        mode="update"
        productId={product.id}
        show
        onClose={() => {}}
        submitLabel={UI_PRODUCT_FORM_SUBMIT_UPDATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: product.id,
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
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductFormFlow
        client={{} as never}
        mode="create"
        show
        onClose={onClose}
        submitLabel={UI_PRODUCT_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const mutateCall = createMutation.mutateAsync.mock.results[0]?.value as Promise<unknown>
    await expect(mutateCall).rejects.toThrow(mutationError)
    expect(onCompleted).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})


