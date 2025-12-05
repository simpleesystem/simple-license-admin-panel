import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import {
  UI_PRODUCT_ACTION_DELETE,
  UI_PRODUCT_ACTION_RESUME,
  UI_PRODUCT_ACTION_SUSPEND,
} from '../../../src/ui/constants'
import { ProductRowActions } from '../../../src/ui/workflows/ProductRowActions'
import { buildProduct } from '../../factories/productFactory'
import { buildUser } from '../../factories/userFactory'

const useDeleteProductMock = vi.hoisted(() => vi.fn())
const useSuspendProductMock = vi.hoisted(() => vi.fn())
const useResumeProductMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useDeleteProduct: useDeleteProductMock,
    useSuspendProduct: useSuspendProductMock,
    useResumeProduct: useResumeProductMock,
  }
})

vi.mock('../../../src/ui/data/ActionMenu', () => ({
  ActionMenu: ({ items }: { items: Array<{ id: string; label: string; disabled?: boolean; onSelect: () => void }> }) => (
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

describe('ProductRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('superuser can delete and suspend/resume', () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useDeleteProductMock.mockReturnValue(deleteMutation)
    useSuspendProductMock.mockReturnValue(suspendMutation)
    useResumeProductMock.mockReturnValue(resumeMutation)
    const product = buildProduct({ isActive: true })
    const superuser = buildUser({ role: 'SUPERUSER' })

    render(
      <ProductRowActions
        client={{} as never}
        productId={product.id}
        isActive={product.isActive}
        currentUser={superuser}
        vendorId={product.vendorId}
      />,
    )

    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_DELETE))
    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(product.id)

    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_SUSPEND))
    expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(product.id)

    cleanup()
    render(
      <ProductRowActions
        client={{} as never}
        productId={product.id}
        isActive={false}
        currentUser={superuser}
        vendorId={product.vendorId}
      />,
    )
    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_RESUME))
    expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(product.id)
  })

  test('vendor manager can suspend/resume own product but not delete', () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useDeleteProductMock.mockReturnValue(deleteMutation)
    useSuspendProductMock.mockReturnValue(suspendMutation)
    useResumeProductMock.mockReturnValue(resumeMutation)
    const product = buildProduct({ isActive: true })
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: product.vendorId ?? undefined })

    render(
      <ProductRowActions
        client={{} as never}
        productId={product.id}
        isActive={product.isActive}
        currentUser={vendorManager}
        vendorId={product.vendorId}
      />,
    )

    expect(screen.queryByText(UI_PRODUCT_ACTION_DELETE)).toBeNull()
    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_SUSPEND))
    expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(product.id)
  })

  test('vendor manager cannot act on other vendor products', () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useDeleteProductMock.mockReturnValue(deleteMutation)
    useSuspendProductMock.mockReturnValue(suspendMutation)
    useResumeProductMock.mockReturnValue(resumeMutation)
    const product = buildProduct()
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: `${product.vendorId}-other` })

    const { container } = render(
      <ProductRowActions
        client={{} as never}
        productId={product.id}
        isActive={product.isActive}
        currentUser={vendorManager}
        vendorId={product.vendorId}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  test('vendor-scoped viewer renders no actions', () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useDeleteProductMock.mockReturnValue(deleteMutation)
    useSuspendProductMock.mockReturnValue(suspendMutation)
    useResumeProductMock.mockReturnValue(resumeMutation)
    const product = buildProduct()
    const viewer = buildUser({ role: 'VIEWER', vendorId: product.vendorId ?? undefined })

    const { container } = render(
      <ProductRowActions
        client={{} as never}
        productId={product.id}
        isActive={product.isActive}
        currentUser={viewer}
        vendorId={product.vendorId}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})


