import { faker } from '@faker-js/faker'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { UI_ENTITLEMENT_ACTION_DELETE, UI_ENTITLEMENT_ACTION_EDIT } from '../../../src/ui/constants'
import { ProductEntitlementRowActions } from '../../../src/ui/workflows/ProductEntitlementRowActions'
import { buildEntitlement } from '../../factories/entitlementFactory'
import { buildUser } from '../../factories/userFactory'

const useDeleteEntitlementMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useDeleteEntitlement: useDeleteEntitlementMock,
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

describe('ProductEntitlementRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('superuser can edit and delete entitlement', async () => {
    const deleteMutation = mockMutation()
    useDeleteEntitlementMock.mockReturnValue(deleteMutation)
    const onEdit = vi.fn()
    const entitlement = buildEntitlement()
    const superuser = buildUser({ role: 'SUPERUSER' })

    render(
      <ProductEntitlementRowActions
        client={{} as never}
        entitlement={{
          id: entitlement.id,
          key: entitlement.key,
          valueType: entitlement.valueType,
          defaultValue: entitlement.defaultValue,
          usageLimit: entitlement.usageLimit,
          vendorId: entitlement.vendorId,
        }}
        onEdit={onEdit}
        currentUser={superuser}
      />
    )

    fireEvent.click(screen.getByText(UI_ENTITLEMENT_ACTION_EDIT))
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: entitlement.id })))

    fireEvent.click(screen.getByText(UI_ENTITLEMENT_ACTION_DELETE))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /Delete entitlement/i }))

    await waitFor(() => expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(entitlement.id))
  })

  test('vendor manager can edit own entitlement but not delete', async () => {
    const deleteMutation = mockMutation()
    useDeleteEntitlementMock.mockReturnValue(deleteMutation)
    const vendorId = faker.string.uuid()
    const entitlement = buildEntitlement({ vendorId })
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId })

    render(
      <ProductEntitlementRowActions
        client={{} as never}
        entitlement={{
          id: entitlement.id,
          key: entitlement.key,
          valueType: entitlement.valueType,
          defaultValue: entitlement.defaultValue,
          usageLimit: entitlement.usageLimit,
          vendorId: entitlement.vendorId,
        }}
        onEdit={vi.fn()}
        currentUser={vendorManager}
      />
    )

    expect(screen.queryByText(UI_ENTITLEMENT_ACTION_DELETE)).toBeNull()
    fireEvent.click(screen.getByText(UI_ENTITLEMENT_ACTION_EDIT))
    await waitFor(() => expect(deleteMutation.mutateAsync).not.toHaveBeenCalled())
  })

  test('vendor manager cannot act on other vendor entitlements', async () => {
    const deleteMutation = mockMutation()
    useDeleteEntitlementMock.mockReturnValue(deleteMutation)
    const entitlement = buildEntitlement()
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: `${entitlement.vendorId}-other` })

    const { container } = render(
      <ProductEntitlementRowActions
        client={{} as never}
        entitlement={{
          id: entitlement.id,
          key: entitlement.key,
          valueType: entitlement.valueType,
          defaultValue: entitlement.defaultValue,
          usageLimit: entitlement.usageLimit,
          vendorId: entitlement.vendorId,
        }}
        onEdit={vi.fn()}
        currentUser={vendorManager}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  test('vendor-scoped viewer renders no actions', () => {
    const deleteMutation = mockMutation()
    useDeleteEntitlementMock.mockReturnValue(deleteMutation)
    const entitlement = buildEntitlement()
    const viewer = buildUser({ role: 'VIEWER', vendorId: entitlement.vendorId ?? undefined })

    const { container } = render(
      <ProductEntitlementRowActions
        client={{} as never}
        entitlement={{
          id: entitlement.id,
          key: entitlement.key,
          valueType: entitlement.valueType,
          defaultValue: entitlement.defaultValue,
          usageLimit: entitlement.usageLimit,
          vendorId: entitlement.vendorId,
        }}
        onEdit={vi.fn()}
        currentUser={viewer}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
