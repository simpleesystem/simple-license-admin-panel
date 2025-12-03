import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ProductEntitlementRowActions } from '../../../src/ui/workflows/ProductEntitlementRowActions'

const useDeleteEntitlementMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useDeleteEntitlement: useDeleteEntitlementMock,
  }
})

vi.mock('../../../src/ui/data/ActionMenu', () => ({
  ActionMenu: ({ items }: { items: Array<{ id: string; label: string; onSelect: () => void }> }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={item.onSelect}>
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

const entitlement = {
  id: 'ent-1',
  key: 'FEATURE_A',
}

describe('ProductEntitlementRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('invokes edit callback', async () => {
    const deleteMutation = mockMutation()
    useDeleteEntitlementMock.mockReturnValue(deleteMutation)
    const onEdit = vi.fn()

    render(<ProductEntitlementRowActions client={{} as never} entitlement={entitlement as never} onEdit={onEdit} />)

    fireEvent.click(screen.getByText('Edit Entitlement'))
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(entitlement))
  })

  test('executes delete mutation', async () => {
    const deleteMutation = mockMutation()
    useDeleteEntitlementMock.mockReturnValue(deleteMutation)

    render(<ProductEntitlementRowActions client={{} as never} entitlement={entitlement as never} onEdit={vi.fn()} />)

    fireEvent.click(screen.getByText('Delete Entitlement'))
    await waitFor(() => expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(entitlement.id))
  })
})


