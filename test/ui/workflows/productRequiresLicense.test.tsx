import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_PRODUCT_FIELD_REQUIRES_LICENSE,
  UI_PRODUCT_FORM_HELPER_REQUIRES_LICENSE,
  UI_PRODUCT_FORM_LABEL_REQUIRES_LICENSE,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
  UI_PRODUCT_REQUIRES_LICENSE_DEFAULT,
} from '../../../src/ui/constants'
import { ProductFormFlow } from '../../../src/ui/workflows/ProductFormFlow'
import { buildProduct } from '../../factories/productFactory'

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

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('Product requires-license toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders the labeled toggle with accessible helper text on create', () => {
    useCreateProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())

    const { getByRole, getByText } = render(
      <ProductFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={vi.fn()}
        submitLabel={UI_PRODUCT_FORM_SUBMIT_CREATE}
      />
    )

    const toggle = getByRole('checkbox', { name: UI_PRODUCT_FORM_LABEL_REQUIRES_LICENSE })
    const helper = getByText(UI_PRODUCT_FORM_HELPER_REQUIRES_LICENSE)

    expect(toggle).toBeInTheDocument()
    expect(helper).toBeInTheDocument()
    expect(toggle.getAttribute('aria-describedby')).toBe(helper.id)
  })

  test('defaults the toggle to licensed and submits requires_license true on create', async () => {
    const createMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(mockMutation())

    const { getByRole } = render(
      <ProductFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={vi.fn()}
        submitLabel={UI_PRODUCT_FORM_SUBMIT_CREATE}
      />
    )

    const toggle = getByRole('checkbox', { name: UI_PRODUCT_FORM_LABEL_REQUIRES_LICENSE })
    expect((toggle as HTMLInputElement).checked).toBe(UI_PRODUCT_REQUIRES_LICENSE_DEFAULT)

    await act(async () => {
      fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))
    })

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const payload = createMutation.mutateAsync.mock.calls[0]?.[0] as Record<string, unknown>
    expect(payload[UI_PRODUCT_FIELD_REQUIRES_LICENSE]).toBe(UI_PRODUCT_REQUIRES_LICENSE_DEFAULT)
  })

  test('submits requires_license false when the toggle is unchecked on create', async () => {
    const createMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createMutation)
    useUpdateProductMock.mockReturnValue(mockMutation())

    const { getByRole } = render(
      <ProductFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={vi.fn()}
        submitLabel={UI_PRODUCT_FORM_SUBMIT_CREATE}
      />
    )

    fireEvent.click(getByRole('checkbox', { name: UI_PRODUCT_FORM_LABEL_REQUIRES_LICENSE }))

    await act(async () => {
      fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))
    })

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const payload = createMutation.mutateAsync.mock.calls[0]?.[0] as Record<string, unknown>
    expect(payload[UI_PRODUCT_FIELD_REQUIRES_LICENSE]).toBe(false)
  })

  test('reflects an existing free product value on edit and can re-enable licensing', async () => {
    const updateMutation = mockMutation()
    useCreateProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(updateMutation)
    const product = buildProduct({ requiresLicense: false })

    const { getByRole } = render(
      <ProductFormFlow
        client={{} as never}
        mode="update"
        productId={product.id}
        show={true}
        onClose={vi.fn()}
        submitLabel={UI_PRODUCT_FORM_SUBMIT_UPDATE}
        defaultValues={{ [UI_PRODUCT_FIELD_REQUIRES_LICENSE]: product.requiresLicense }}
      />
    )

    const toggle = getByRole('checkbox', { name: UI_PRODUCT_FORM_LABEL_REQUIRES_LICENSE })
    expect((toggle as HTMLInputElement).checked).toBe(false)

    fireEvent.click(toggle)

    await act(async () => {
      fireEvent.click(getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE }))
    })

    await waitFor(() => expect(updateMutation.mutateAsync).toHaveBeenCalled())
    const call = updateMutation.mutateAsync.mock.calls[0]?.[0] as { id: string; data: Record<string, unknown> }
    expect(call.id).toBe(product.id)
    expect(call.data[UI_PRODUCT_FIELD_REQUIRES_LICENSE]).toBe(true)
  })
})
