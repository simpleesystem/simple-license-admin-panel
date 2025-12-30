import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
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

  test('superuser can delete and suspend/resume', async () => {
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

    // Verify buttons are present
    expect(screen.getByRole('button', { name: UI_PRODUCT_ACTION_DELETE })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: UI_PRODUCT_ACTION_SUSPEND })).toBeInTheDocument()

    // Test suspend via modal
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_ACTION_SUSPEND }))
    const suspendDialog = await screen.findByRole('dialog')
    fireEvent.click(within(suspendDialog).getByRole('button', { name: /Suspend product/i }))
    await waitFor(() => expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(product.id))

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

    // Test resume via modal
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_ACTION_RESUME }))
    const resumeDialog = await screen.findByRole('dialog')
    fireEvent.click(within(resumeDialog).getByRole('button', { name: /Resume product/i }))
    await waitFor(() => expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(product.id))
  })

  test('vendor manager can suspend/resume own product but not delete', async () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useDeleteProductMock.mockReturnValue(deleteMutation)
    useSuspendProductMock.mockReturnValue(suspendMutation)
    useResumeProductMock.mockReturnValue(resumeMutation)
    const product = buildProduct({ isActive: true, vendorId: 'test-vendor-123' })
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: product.vendorId })

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
    expect(screen.getByText(UI_PRODUCT_ACTION_SUSPEND)).toBeInTheDocument()

    // Verify suspend works via modal
    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_SUSPEND))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /Suspend product/i }))
    await waitFor(() => expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(product.id))
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
