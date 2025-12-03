import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { UserRowActions } from '../../../src/ui/workflows/UserRowActions'

const useDeleteUserMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useDeleteUser: useDeleteUserMock,
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

const sampleUser = {
  id: 'user-1',
  username: 'user.one',
  email: 'one@example.com',
}

const waitForMicrotasks = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })

describe('UserRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls onEdit when edit action selected', async () => {
    const deleteMutation = mockMutation()
    useDeleteUserMock.mockReturnValue(deleteMutation)
    const onEdit = vi.fn()

    render(<UserRowActions client={{} as never} user={sampleUser as never} onEdit={onEdit} />)

    fireEvent.click(screen.getByText('Edit User'))
    await waitForMicrotasks()

    expect(onEdit).toHaveBeenCalledWith(sampleUser)
  })

  test('executes delete mutation when delete selected', async () => {
    const deleteMutation = mockMutation()
    useDeleteUserMock.mockReturnValue(deleteMutation)

    render(<UserRowActions client={{} as never} user={sampleUser as never} onEdit={vi.fn()} />)

    fireEvent.click(screen.getByText('Delete User'))
    await waitForMicrotasks()

    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(sampleUser.id)
  })
})


