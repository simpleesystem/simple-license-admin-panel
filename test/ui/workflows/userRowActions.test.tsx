import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { UI_USER_ACTION_DELETE, UI_USER_ACTION_EDIT } from '../../../src/ui/constants'
import { UserRowActions } from '../../../src/ui/workflows/UserRowActions'
import { buildUser } from '../../factories/userFactory'

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

const WAIT_FOR_MICROTASK_DELAY_MS = 0 as const

const waitForMicrotasks = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, WAIT_FOR_MICROTASK_DELAY_MS)
  })

describe('UserRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls onEdit when edit action selected', async () => {
    const deleteMutation = mockMutation()
    useDeleteUserMock.mockReturnValue(deleteMutation)
    const onEdit = vi.fn()
    const user = buildUser()

    render(<UserRowActions client={{} as never} user={user as never} onEdit={onEdit} />)

    fireEvent.click(screen.getByText(UI_USER_ACTION_EDIT))
    await waitForMicrotasks()

    expect(onEdit).toHaveBeenCalledWith(user)
  })

  test('executes delete mutation when delete selected', async () => {
    const deleteMutation = mockMutation()
    useDeleteUserMock.mockReturnValue(deleteMutation)
    const user = buildUser()

    render(<UserRowActions client={{} as never} user={user as never} onEdit={vi.fn()} />)

    fireEvent.click(screen.getByText(UI_USER_ACTION_DELETE))
    await waitForMicrotasks()

    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(user.id)
  })

  test('invokes onCompleted callback after delete', async () => {
    const deleteMutation = mockMutation()
    useDeleteUserMock.mockReturnValue(deleteMutation)
    const user = buildUser()
    const onCompleted = vi.fn()

    render(<UserRowActions client={{} as never} user={user as never} onEdit={vi.fn()} onCompleted={onCompleted} />)

    fireEvent.click(screen.getByText(UI_USER_ACTION_DELETE))
    await waitForMicrotasks()

    expect(onCompleted).toHaveBeenCalled()
  })
})


