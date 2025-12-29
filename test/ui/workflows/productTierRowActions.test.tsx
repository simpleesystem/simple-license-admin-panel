import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_PRODUCT_TIER_ACTION_DELETE,
  UI_PRODUCT_TIER_ACTION_EDIT,
  UI_USER_ROLE_SUPERUSER,
  UI_USER_ROLE_VENDOR_MANAGER,
} from '../../../src/ui/constants'
import { ProductTierRowActions } from '../../../src/ui/workflows/ProductTierRowActions'
import { buildProductTier } from '../../factories/productTierFactory'
import { buildUser } from '../../factories/userFactory'
import { renderWithProviders } from '../utils'

const useUpdateProductTierMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useUpdateProductTier: useUpdateProductTierMock,
  }
})

vi.mock('../../../src/ui/data/ActionMenu', () => ({
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

describe('ProductTierRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('superuser can edit and delete tier', async () => {
    const updateMutation = mockMutation()
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const onEdit = vi.fn()
    const tier = buildProductTier()
    const superuser = buildUser({ role: UI_USER_ROLE_SUPERUSER })

    renderWithProviders(
      <ProductTierRowActions
        client={{} as never}
        tier={tier as never}
        onEdit={onEdit}
        currentUser={superuser}
        vendorId={tier.vendorId}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_TIER_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_ACTION_EDIT))
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(tier))

    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_ACTION_DELETE))

    const dialog = await screen.findByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', { name: /Delete tier/i })
    fireEvent.click(confirmButton)

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: tier.id,
        data: { is_active: false },
      })
    )
  })

  test('vendor manager can edit own tier but not delete', async () => {
    const updateMutation = mockMutation()
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const vendorId = faker.string.uuid()
    const tier = buildProductTier({ vendorId })
    const vendorManager = buildUser({ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId })

    renderWithProviders(
      <ProductTierRowActions
        client={{} as never}
        tier={tier as never}
        onEdit={vi.fn()}
        currentUser={vendorManager}
        vendorId={tier.vendorId}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(UI_PRODUCT_TIER_ACTION_DELETE)).toBeNull()
      expect(screen.getByText(UI_PRODUCT_TIER_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_ACTION_EDIT))
    await waitFor(() => expect(updateMutation.mutateAsync).not.toHaveBeenCalled())
  })

  test('vendor manager cannot act on other vendor tiers', async () => {
    const updateMutation = mockMutation()
    useUpdateProductTierMock.mockReturnValue(updateMutation)
    const tier = buildProductTier()
    const vendorManager = buildUser({ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId: `${tier.vendorId}-other` })

    const { container } = renderWithProviders(
      <ProductTierRowActions
        client={{} as never}
        tier={tier as never}
        onEdit={vi.fn()}
        currentUser={vendorManager}
        vendorId={tier.vendorId}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
