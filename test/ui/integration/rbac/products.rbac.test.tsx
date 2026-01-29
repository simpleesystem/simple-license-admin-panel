import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_PRODUCT_ACTION_DELETE,
  UI_PRODUCT_ACTION_EDIT,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_BUTTON_RESUME,
  UI_PRODUCT_CONFIRM_DELETE_CONFIRM,
  UI_PRODUCT_CONFIRM_RESUME_CONFIRM,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
} from '../../../../src/ui/constants'
import { ProductManagementExample } from '../../../../src/ui/workflows/ProductManagementExample'
import { buildProduct } from '../../../factories/productFactory'
import { buildUser } from '../../../factories/userFactory'
import { renderWithProviders } from '../../utils'

const useDeleteProductMock = vi.hoisted(() => vi.fn())
const useSuspendProductMock = vi.hoisted(() => vi.fn())
const useResumeProductMock = vi.hoisted(() => vi.fn())
const useUpdateProductMock = vi.hoisted(() => vi.fn())
const useCreateProductMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
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
        <button type="button" key={item.id} onClick={item.onSelect} disabled={item.disabled}>
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
    const mockClient = {
      getProduct: vi.fn().mockResolvedValue(product),
      listProductTiers: vi.fn().mockResolvedValue([]),
      listEntitlements: vi.fn().mockResolvedValue([]),
    }
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useCreateProductMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <ProductManagementExample
        client={mockClient as never}
        products={[product]}
        currentUser={buildUser({ role: 'SUPERUSER' })}
        onRefresh={vi.fn()}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_CREATE))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE })).toBeInTheDocument()
    })
    // Close create modal
    const createDialog = await screen.findByRole('dialog')
    fireEvent.click(within(createDialog).getByLabelText('Close'))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_EDIT))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE })).toBeInTheDocument()
    })
    // Close edit modal
    const editDialog = await screen.findByRole('dialog')
    fireEvent.click(within(editDialog).getByLabelText('Close'))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_ACTION_DELETE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_DELETE))
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_CONFIRM_DELETE_CONFIRM)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_CONFIRM_DELETE_CONFIRM))

    await waitFor(() => {
      expect(useDeleteProductMock().mutateAsync).toHaveBeenCalledWith(product.id)
    })
  })

  test('VENDOR_MANAGER can edit own vendor product, cannot delete', async () => {
    const vendorId = faker.string.uuid()
    const product = buildProduct({ status: 'ACTIVE', vendorId })
    const mockClient = {
      getProduct: vi.fn().mockResolvedValue(product),
      listProductTiers: vi.fn().mockResolvedValue([]),
      listEntitlements: vi.fn().mockResolvedValue([]),
    }
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useCreateProductMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <ProductManagementExample
        client={mockClient as never}
        products={[product]}
        currentUser={buildUser({ role: 'VENDOR_MANAGER', vendorId })}
        onRefresh={vi.fn()}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_EDIT))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE })).toBeInTheDocument()
    })
    // Close edit modal
    const editDialog = await screen.findByRole('dialog')
    fireEvent.click(within(editDialog).getByLabelText('Close'))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.queryByText(UI_PRODUCT_ACTION_DELETE)).toBeNull()
  })

  test('VENDOR_MANAGER cannot act on other vendor product', () => {
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
        currentUser={buildUser({ role: 'VENDOR_MANAGER', vendorId: faker.string.uuid() })}
        onRefresh={vi.fn()}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(view.queryByText(UI_PRODUCT_ACTION_EDIT)).toBeNull()
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
        currentUser={buildUser({ role: 'VIEWER', vendorId: product.vendorId })}
        onRefresh={vi.fn()}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(view.queryByText(UI_PRODUCT_ACTION_EDIT)).toBeNull()
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
        currentUser={buildUser({ role: 'SUPERUSER' })}
        onRefresh={vi.fn()}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_BUTTON_RESUME)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_RESUME))
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_CONFIRM_RESUME_CONFIRM)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_CONFIRM_RESUME_CONFIRM))
    await waitFor(() => {
      expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(product.id)
    })
  })
})
