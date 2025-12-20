import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_BUTTON_EDIT,
  UI_PRODUCT_EMPTY_STATE_MESSAGE,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
} from '../../../src/ui/constants'
import { ProductManagementExample } from '../../../src/ui/workflows/ProductManagementExample'
import { buildProduct } from '../../factories/productFactory'
import { buildUser } from '../../factories/userFactory'
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

vi.mock('../../../src/ui/workflows/ProductRowActions', () => ({
  ProductRowActions: ({
    productId,
    onCompleted,
    onEdit,
  }: {
    productId: string
    onCompleted?: () => void
    onEdit?: () => void
  }) => (
    <div>
      <button type="button" onClick={() => onEdit?.()}>
        row-edit-{productId}
      </button>
      <button type="button" onClick={() => onCompleted?.()}>
        row-complete-{productId}
      </button>
    </div>
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('ProductManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('admin can create product and refreshes data', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const products = [buildProduct()]

    const { getByText, getByRole } = render(
      <ProductManagementExample
        client={{} as never}
        products={products}
        currentUser={adminUser}
        onRefresh={onRefresh}
      />
    )

    fireEvent.click(getByText(UI_PRODUCT_BUTTON_CREATE))
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onRefresh).toHaveBeenCalled()
  })

  test('admin can edit product and refreshes data', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const product = buildProduct()

    const { getByText, getByRole } = render(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={adminUser}
        onRefresh={onRefresh}
      />
    )

    fireEvent.click(getByText(UI_PRODUCT_BUTTON_EDIT))
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: product.id,
        data: expect.any(Object),
      })
    )
    expect(onRefresh).toHaveBeenCalled()
  })

  test('vendor manager cannot create but can edit own product', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const product = buildProduct()
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: product.vendorId ?? buildText() })

    const { queryByText, getByText, getByRole } = render(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={vendorManager}
        onRefresh={onRefresh}
      />
    )

    expect(queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()

    fireEvent.click(getByText(UI_PRODUCT_BUTTON_EDIT))
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: product.id,
        data: expect.any(Object),
      })
    )
    expect(onRefresh).toHaveBeenCalled()
  })

  test('vendor manager cannot edit products from other vendors', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const product = buildProduct()
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: `${product.vendorId}-other` })

    const { queryByText } = render(
      <ProductManagementExample client={{} as never} products={[product]} currentUser={vendorManager} />
    )

    expect(queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_PRODUCT_BUTTON_EDIT)).toBeNull()
  })

  test('vendor-scoped user sees only own products in view-only mode', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const ownProduct = buildProduct()
    const otherProduct = buildProduct({ vendorId: `${ownProduct.vendorId}-other` })
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId: ownProduct.vendorId ?? buildText() })

    const { getByText, queryByText } = render(
      <ProductManagementExample client={{} as never} products={[ownProduct, otherProduct]} currentUser={vendorUser} />
    )

    expect(getByText(ownProduct.name)).toBeInTheDocument()
    expect(queryByText(otherProduct.name)).toBeNull()
    expect(queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_PRODUCT_BUTTON_EDIT)).toBeNull()
  })

  test('vendor-scoped user with no products sees empty state', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId: buildText() })
    const otherProduct = buildProduct({ vendorId: `${vendorUser.vendorId}-other` })

    const { getByText } = render(
      <ProductManagementExample client={{} as never} products={[otherProduct]} currentUser={vendorUser} />
    )

    expect(getByText(UI_PRODUCT_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
  })

  test('does not refresh when create mutation fails', async () => {
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
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const product = buildProduct()

    const { getByText, getByRole } = render(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={adminUser}
        onRefresh={onRefresh}
      />
    )

    fireEvent.click(getByText(UI_PRODUCT_BUTTON_CREATE))
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const mutateCall = createMutation.mutateAsync.mock.results[0]?.value as Promise<unknown>
    await expect(mutateCall).rejects.toThrow(mutationError)
    expect(onRefresh).not.toHaveBeenCalled()
  })
})
