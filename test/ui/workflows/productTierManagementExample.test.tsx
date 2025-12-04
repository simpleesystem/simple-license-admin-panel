import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import {
  UI_PRODUCT_TIER_BUTTON_CREATE,
  UI_PRODUCT_TIER_BUTTON_EDIT,
  UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE,
  UI_PRODUCT_TIER_FORM_SUBMIT_CREATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE,
} from '../../../src/ui/constants'
import { ProductTierManagementExample } from '../../../src/ui/workflows/ProductTierManagementExample'
import { buildProductTier } from '../../factories/productTierFactory'
import { buildUser } from '../../factories/userFactory'
import { buildText } from '../../ui/factories/uiFactories'

const useCreateProductTierMock = vi.hoisted(() => vi.fn())
const useUpdateProductTierMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateProductTier: useCreateProductTierMock,
    useUpdateProductTier: useUpdateProductTierMock,
  }
})

vi.mock('../../../src/ui/workflows/ProductTierRowActions', () => ({
  ProductTierRowActions: ({
    tier,
    onEdit,
    onCompleted,
  }: {
    tier: { id: string }
    onEdit: (tier: { id: string }) => void
    onCompleted?: () => void
  }) => (
    <div>
      <button type="button" onClick={() => onEdit(tier)}>
        row-edit-{tier.id}
      </button>
      <button type="button" onClick={() => onCompleted?.()}>
        row-complete-{tier.id}
      </button>
    </div>
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const SINGLE_INVOCATION_COUNT = 1 as const

describe('ProductTierManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('admin can create tier and refreshes data', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const tier = buildProductTier()

    const { getByText, getByRole } = render(
      <ProductTierManagementExample
        client={{} as never}
        productId={buildText()}
        tiers={[tier]}
        currentUser={adminUser}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(getByText(UI_PRODUCT_TIER_BUTTON_CREATE))
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onRefresh).toHaveBeenCalledTimes(SINGLE_INVOCATION_COUNT)
  })

  test('admin can edit tier and refreshes data', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const tier = buildProductTier()

    const { getByText, getByRole } = render(
      <ProductTierManagementExample
        client={{} as never}
        productId={buildText()}
        tiers={[tier]}
        currentUser={adminUser}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(getByText(UI_PRODUCT_TIER_BUTTON_EDIT))
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: tier.id,
        data: expect.any(Object),
      }),
    )
    expect(onRefresh).toHaveBeenCalledTimes(SINGLE_INVOCATION_COUNT)
  })

  test('vendor manager cannot create but can edit own tier', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const tier = buildProductTier()
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: tier.vendorId ?? buildText() })

    const { queryByText, getByText, getByRole } = render(
      <ProductTierManagementExample
        client={{} as never}
        productId={buildText()}
        tiers={[tier]}
        currentUser={vendorManager}
        onRefresh={onRefresh}
      />,
    )

    expect(queryByText(UI_PRODUCT_TIER_BUTTON_CREATE)).toBeNull()

    fireEvent.click(getByText(UI_PRODUCT_TIER_BUTTON_EDIT))
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: tier.id,
        data: expect.any(Object),
      }),
    )
    expect(onRefresh).toHaveBeenCalledTimes(SINGLE_INVOCATION_COUNT)
  })

  test('vendor manager cannot edit tiers from other vendors', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const tier = buildProductTier()
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: `${tier.vendorId}-other` })

    const { queryByText } = render(
      <ProductTierManagementExample
        client={{} as never}
        productId={buildText()}
        tiers={[tier]}
        currentUser={vendorManager}
      />,
    )

    expect(queryByText(UI_PRODUCT_TIER_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_PRODUCT_TIER_BUTTON_EDIT)).toBeNull()
  })

  test('vendor-scoped user sees only own tiers in view-only mode', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const ownTier = buildProductTier()
    const otherTier = buildProductTier({ vendorId: `${ownTier.vendorId}-other` })
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId: ownTier.vendorId ?? buildText() })

    const { getByText, queryByText } = render(
      <ProductTierManagementExample
        client={{} as never}
        productId={buildText()}
        tiers={[ownTier, otherTier]}
        currentUser={vendorUser}
      />,
    )

    expect(getByText(ownTier.tierName)).toBeInTheDocument()
    expect(queryByText(otherTier.tierName)).toBeNull()
    expect(queryByText(UI_PRODUCT_TIER_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_PRODUCT_TIER_BUTTON_EDIT)).toBeNull()
  })

  test('vendor-scoped user with no tiers sees empty state', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId: buildText() })
    const otherTier = buildProductTier({ vendorId: `${vendorUser.vendorId}-other` })

    const { getByText } = render(
      <ProductTierManagementExample
        client={{} as never}
        productId={buildText()}
        tiers={[otherTier]}
        currentUser={vendorUser}
      />,
    )

    expect(getByText(UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
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
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const tier = buildProductTier()

    const { getByText, getByRole } = render(
      <ProductTierManagementExample
        client={{} as never}
        productId={buildText()}
        tiers={[tier]}
        currentUser={adminUser}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(getByText(UI_PRODUCT_TIER_BUTTON_CREATE))
    fireEvent.click(getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const mutateCall = createMutation.mutateAsync.mock.results[0]?.value as Promise<unknown>
    await expect(mutateCall).rejects.toThrow(mutationError)
    expect(onRefresh).not.toHaveBeenCalled()
  })
})


