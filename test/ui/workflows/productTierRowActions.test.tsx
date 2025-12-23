import { faker } from '@faker-js/faker'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

const useDeleteProductTierMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useDeleteProductTier: useDeleteProductTierMock,
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
    const deleteMutation = mockMutation()
    useDeleteProductTierMock.mockReturnValue(deleteMutation)
    const onEdit = vi.fn()
    const tier = buildProductTier()
    const superuser = buildUser({ role: UI_USER_ROLE_SUPERUSER })

    render(
      <ProductTierRowActions
        client={{} as never}
        tier={tier as never}
        onEdit={onEdit}
        currentUser={superuser}
        vendorId={tier.vendorId}
      />
    )

    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_ACTION_EDIT))
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(tier))

    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_ACTION_DELETE))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /Delete tier/i }))

    await waitFor(() => expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(tier.id))
  })

  test('vendor manager can edit own tier but not delete', async () => {
    const deleteMutation = mockMutation()
    useDeleteProductTierMock.mockReturnValue(deleteMutation)
    const vendorId = faker.string.uuid()
    const tier = buildProductTier({ vendorId })
    const vendorManager = buildUser({ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId })

    render(
      <ProductTierRowActions
        client={{} as never}
        tier={tier as never}
        onEdit={vi.fn()}
        currentUser={vendorManager}
        vendorId={tier.vendorId}
      />
    )

    expect(screen.queryByText(UI_PRODUCT_TIER_ACTION_DELETE)).toBeNull()
    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_ACTION_EDIT))
    await waitFor(() => expect(deleteMutation.mutateAsync).not.toHaveBeenCalled())
  })

  test('vendor manager cannot act on other vendor tiers', async () => {
    const deleteMutation = mockMutation()
    useDeleteProductTierMock.mockReturnValue(deleteMutation)
    const tier = buildProductTier()
    const vendorManager = buildUser({ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId: `${tier.vendorId}-other` })

    const { container } = render(
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
