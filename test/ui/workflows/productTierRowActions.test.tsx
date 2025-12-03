import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { ProductTierRowActions } from '../../../src/ui/workflows/ProductTierRowActions'

const useDeleteProductTierMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useDeleteProductTier: useDeleteProductTierMock,
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

describe('ProductTierRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const tier = {
    id: 'tier-1',
    tierName: 'Pro',
    tierCode: 'PRO',
  }

  test('invokes edit callback', async () => {
    const deleteMutation = mockMutation()
    useDeleteProductTierMock.mockReturnValue(deleteMutation)
    const onEdit = vi.fn()

    render(<ProductTierRowActions client={{} as never} tier={tier as never} onEdit={onEdit} />)

    fireEvent.click(screen.getByText('Edit Tier'))
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(tier))
  })

  test('invokes delete mutation', async () => {
    const deleteMutation = mockMutation()
    useDeleteProductTierMock.mockReturnValue(deleteMutation)

    render(<ProductTierRowActions client={{} as never} tier={tier as never} onEdit={vi.fn()} />)

    fireEvent.click(screen.getByText('Delete Tier'))
    await waitFor(() => expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(tier.id))
  })
})


