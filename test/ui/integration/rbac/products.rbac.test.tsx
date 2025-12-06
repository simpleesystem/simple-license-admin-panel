import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_PRODUCT_ACTION_DELETE,
  UI_PRODUCT_ACTION_RESUME,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_BUTTON_EDIT,
} from '../../../../src/ui/constants'
import { ProductManagementExample } from '../../../../src/ui/workflows/ProductManagementExample'
import { buildProduct } from '../../../factories/productFactory'
import { renderWithProviders } from '../../utils'

const useDeleteProductMock = vi.hoisted(() => vi.fn())
const useSuspendProductMock = vi.hoisted(() => vi.fn())
const useResumeProductMock = vi.hoisted(() => vi.fn())
const useUpdateProductMock = vi.hoisted(() => vi.fn())
const useCreateProductMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useDeleteProduct: useDeleteProductMock,
    useSuspendProduct: useSuspendProductMock,
    useResumeProduct: useResumeProductMock,
    useUpdateProduct: useUpdateProductMock,
    useCreateProduct: useCreateProductMock,
  }
})

vi.mock('../../../../src/ui/data/ActionMenu', () => ({
  ActionMenu: ({
    items,
  }: {
    items: Array<{ id: string; label: string; disabled?: boolean; onSelect: () => void }>
  }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={item.onSelect} disabled={item.disabled}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('Product RBAC & vendor scoping', () => {
  test('SUPERUSER can create/edit/delete any vendor product', async () => {
    const product = buildProduct({ status: 'ACTIVE' })
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useCreateProductMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() }}
        onRefresh={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_CREATE))
    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_EDIT))
    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_DELETE))

    await waitFor(() => {
      expect(useDeleteProductMock().mutateAsync).toHaveBeenCalledWith(product.id)
    })
  })

  test('VENDOR_MANAGER can edit own vendor product, cannot delete', async () => {
    const vendorId = faker.string.uuid()
    const product = buildProduct({ status: 'ACTIVE', vendorId })
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useCreateProductMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId }}
        onRefresh={vi.fn()}
      />,
    )

    expect(screen.queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_EDIT))
    expect(screen.queryByText(UI_PRODUCT_ACTION_DELETE)).toBeNull()
  })

  test('VENDOR_MANAGER cannot act on other vendor product', () => {
    const product = buildProduct({ status: 'ACTIVE' })
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useCreateProductMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: faker.string.uuid() }}
        onRefresh={vi.fn()}
      />,
    )

    expect(view.queryByText(UI_PRODUCT_BUTTON_EDIT)).toBeNull()
    expect(view.queryByText(UI_PRODUCT_ACTION_DELETE)).toBeNull()
  })

  test('VIEWER sees read-only (no actions)', () => {
    const product = buildProduct({ status: 'ACTIVE' })
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useCreateProductMock.mockReturnValue(mockMutation())

    const view = renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={{ role: 'VIEWER', vendorId: product.vendorId }}
        onRefresh={vi.fn()}
      />,
    )

    expect(view.queryByText(UI_PRODUCT_BUTTON_EDIT)).toBeNull()
    expect(view.queryByText(UI_PRODUCT_ACTION_DELETE)).toBeNull()
  })

  test('Resume action available only when suspended', async () => {
    const product = buildProduct({ status: 'SUSPENDED', isActive: false })
    const resumeMutation = mockMutation()
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(resumeMutation)
    useUpdateProductMock.mockReturnValue(mockMutation())
    useCreateProductMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={{ role: 'SUPERUSER', vendorId: product.vendorId }}
        onRefresh={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_RESUME))
    await waitFor(() => {
      expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(product.id)
    })
  })
})

