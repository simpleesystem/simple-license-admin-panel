import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_PRODUCT_ACTION_EDIT,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_EMPTY_STATE_MESSAGE,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
  UI_PRODUCT_FORM_TITLE_UPDATE,
} from '../../../src/ui/constants'
import { ProductManagementExample } from '../../../src/ui/workflows/ProductManagementExample'
import { buildProduct } from '../../factories/productFactory'
import { buildUser } from '../../factories/userFactory'
import { buildText } from '../../ui/factories/uiFactories'
import { renderWithProviders } from '../utils'

const useCreateProductMock = vi.hoisted(() => vi.fn())
const useUpdateProductMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useCreateProduct: useCreateProductMock,
    useUpdateProduct: useUpdateProductMock,
  }
})

vi.mock('../../../src/ui/workflows/ProductRowActions', async () => {
  const { UI_PRODUCT_ACTION_EDIT } = await import('../../../src/ui/constants')
  return {
    ProductRowActions: ({
      productId,
      vendorId,
      currentUser,
      onCompleted,
      onEdit,
    }: {
      productId: string
      vendorId?: string | null
      currentUser?: { vendorId?: string | null; role?: string } | null
      onCompleted?: () => void
      onEdit?: () => void
    }) => {
      // Only show edit button if user owns the product or is system admin
      const isSystemAdmin = currentUser?.role === 'SUPERUSER' || currentUser?.role === 'ADMIN'
      const ownsProduct = isSystemAdmin || (vendorId && currentUser?.vendorId === vendorId)
      if (!ownsProduct) {
        return null
      }
      return (
        <div>
          <button type="button" onClick={() => onEdit?.()}>
            {UI_PRODUCT_ACTION_EDIT}
          </button>
          <button type="button" onClick={() => onCompleted?.()}>
            row-complete-{productId}
          </button>
        </div>
      )
    },
  }
})

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

    const { getByText, getByRole } = renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={products}
        currentUser={adminUser}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_PRODUCT_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(getByText(UI_PRODUCT_BUTTON_CREATE))
    await waitFor(() => {
      expect(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE })).toBeInTheDocument()
    })
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

    const mockClient = {
      listProductTiers: vi.fn().mockResolvedValue([]),
      listProductEntitlements: vi.fn().mockResolvedValue([]),
      getProduct: vi.fn().mockResolvedValue({ product }),
    } as never

    const { getByText, getByRole } = renderWithProviders(
      <ProductManagementExample
        client={mockClient}
        products={[product]}
        currentUser={adminUser}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_PRODUCT_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(getByText(UI_PRODUCT_ACTION_EDIT))
    // Wait for modal to appear - first wait for modal element, then title
    await waitFor(
      () => {
        const modal = screen.queryByRole('dialog')
        expect(modal).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
    // Then wait for title
    await waitFor(
      () => {
        expect(screen.getByText(UI_PRODUCT_FORM_TITLE_UPDATE)).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
    // Then wait for submit button
    await waitFor(
      () => {
        expect(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
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

    const mockClient = {
      listProductTiers: vi.fn().mockResolvedValue([]),
      listProductEntitlements: vi.fn().mockResolvedValue([]),
      getProduct: vi.fn().mockResolvedValue({ product }),
    } as never

    const { queryByText, getByText, getByRole } = renderWithProviders(
      <ProductManagementExample
        client={mockClient}
        products={[product]}
        currentUser={vendorManager}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()

    await waitFor(() => {
      expect(getByText(UI_PRODUCT_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(getByText(UI_PRODUCT_ACTION_EDIT))
    // Wait for modal to appear - first wait for modal element, then title
    await waitFor(
      () => {
        const modal = screen.queryByRole('dialog')
        expect(modal).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
    // Then wait for title
    await waitFor(
      () => {
        expect(screen.getByText(UI_PRODUCT_FORM_TITLE_UPDATE)).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
    // Then wait for submit button
    await waitFor(
      () => {
        expect(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
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

    const { queryByText } = renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={[product]}
        currentUser={vendorManager}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_PRODUCT_ACTION_EDIT)).toBeNull()
  })

  test('vendor-scoped user sees only own products in view-only mode', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const ownProduct = buildProduct()
    const otherProduct = buildProduct({ vendorId: `${ownProduct.vendorId}-other` })
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId: ownProduct.vendorId ?? buildText() })

    const mockClient = {
      listProductTiers: vi.fn().mockResolvedValue([]),
      listProductEntitlements: vi.fn().mockResolvedValue([]),
      getProduct: vi.fn().mockResolvedValue({ product: ownProduct }),
    } as never

    const { getByText, queryByText } = renderWithProviders(
      <ProductManagementExample
        client={mockClient}
        products={[ownProduct, otherProduct]}
        currentUser={vendorUser}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(
      () => {
        expect(getByText(ownProduct.name)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(queryByText(otherProduct.name)).toBeNull()
    expect(queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_PRODUCT_ACTION_EDIT)).toBeNull()
  })

  test('vendor-scoped user with no products sees empty state', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(updateMutation)
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId: buildText() })
    const otherProduct = buildProduct({ vendorId: `${vendorUser.vendorId}-other` })

    const mockClient = {
      listProductTiers: vi.fn().mockResolvedValue([]),
      listProductEntitlements: vi.fn().mockResolvedValue([]),
      getProduct: vi.fn().mockResolvedValue({ product: otherProduct }),
    } as never

    const { getByText } = renderWithProviders(
      <ProductManagementExample
        client={mockClient}
        products={[otherProduct]}
        currentUser={vendorUser}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_PRODUCT_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
    })
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

    const mockClient = {
      listProductTiers: vi.fn().mockResolvedValue([]),
      listProductEntitlements: vi.fn().mockResolvedValue([]),
      getProduct: vi.fn().mockResolvedValue({ product }),
    } as never

    const { getByText, getByRole } = renderWithProviders(
      <ProductManagementExample
        client={mockClient}
        products={[product]}
        currentUser={adminUser}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_PRODUCT_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(getByText(UI_PRODUCT_BUTTON_CREATE))
    await waitFor(() => {
      expect(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE })).toBeInTheDocument()
    })
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const mutateCall = createMutation.mutateAsync.mock.results[0]?.value as Promise<unknown>
    await expect(mutateCall).rejects.toThrow(mutationError)
    expect(onRefresh).not.toHaveBeenCalled()
  })
})
