import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_USER_ACTION_DELETE,
  UI_USER_ACTION_EDIT,
  UI_USER_ACTION_RESET_PASSWORD,
  UI_USER_CONFIRM_DELETE_CONFIRM,
  UI_USER_CONFIRM_RESET_PASSWORD_CONFIRM,
  UI_USER_RESET_PASSWORD_FIELD_LABEL,
  UI_USER_RESET_PASSWORD_MIN_LENGTH,
} from '../../../src/ui/constants'
import { UserRowActions } from '../../../src/ui/workflows/UserRowActions'
import { buildUser } from '../../factories/userFactory'

const useDeleteUserMock = vi.hoisted(() => vi.fn())
const useResetUserPasswordMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useDeleteUser: useDeleteUserMock,
    useResetUserPassword: useResetUserPasswordMock,
  }
})

// ModalDialog is not mocked, so it renders its children/content.
// However, it uses React Portal usually. If so, testing-library handles it if configured correctly.
// If ModalDialog implementation is simple, it might just render.

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const WAIT_FOR_MICROTASK_DELAY_MS = 0 as const

const waitForMicrotasks = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, WAIT_FOR_MICROTASK_DELAY_MS)
  })

const RESET_PASSWORD_EXTRA_CHARS = 4 as const
const VALID_RESET_PASSWORD = 'a'.repeat(UI_USER_RESET_PASSWORD_MIN_LENGTH + RESET_PASSWORD_EXTRA_CHARS)
const SHORT_RESET_PASSWORD = 'a'.repeat(UI_USER_RESET_PASSWORD_MIN_LENGTH - 1)

describe('UserRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useResetUserPasswordMock.mockReturnValue(mockMutation())
  })

  test('calls onEdit when edit action selected', async () => {
    const deleteMutation = mockMutation()
    useDeleteUserMock.mockReturnValue(deleteMutation)
    const onEdit = vi.fn()
    const user = buildUser()

    render(<UserRowActions client={{} as never} user={user as never} onEdit={onEdit} />)

    // Edit button text/label is UI_USER_ACTION_EDIT
    fireEvent.click(screen.getByText(UI_USER_ACTION_EDIT))
    await waitForMicrotasks()

    expect(onEdit).toHaveBeenCalledWith(user)
  })

  test('executes delete mutation when delete selected and confirmed', async () => {
    const deleteMutation = mockMutation()
    useDeleteUserMock.mockReturnValue(deleteMutation)
    const user = buildUser()

    render(<UserRowActions client={{} as never} user={user as never} onEdit={vi.fn()} />)

    fireEvent.click(screen.getByText(UI_USER_ACTION_DELETE))
    // Expect confirmation modal
    fireEvent.click(screen.getByRole('button', { name: UI_USER_CONFIRM_DELETE_CONFIRM }))

    await waitForMicrotasks()

    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(user.id)
  })

  test('invokes onCompleted callback after delete and confirm', async () => {
    const deleteMutation = mockMutation()
    useDeleteUserMock.mockReturnValue(deleteMutation)
    const user = buildUser()
    const onCompleted = vi.fn()

    render(<UserRowActions client={{} as never} user={user as never} onEdit={vi.fn()} onCompleted={onCompleted} />)

    fireEvent.click(screen.getByText(UI_USER_ACTION_DELETE))
    fireEvent.click(screen.getByRole('button', { name: UI_USER_CONFIRM_DELETE_CONFIRM }))

    await waitForMicrotasks()

    expect(onCompleted).toHaveBeenCalled()
  })

  test('resets a user password with the entered value when confirmed', async () => {
    useDeleteUserMock.mockReturnValue(mockMutation())
    const resetMutation = mockMutation()
    useResetUserPasswordMock.mockReturnValue(resetMutation)
    const user = buildUser()
    const onCompleted = vi.fn()

    render(<UserRowActions client={{} as never} user={user as never} onEdit={vi.fn()} onCompleted={onCompleted} />)

    fireEvent.click(screen.getByRole('button', { name: UI_USER_ACTION_RESET_PASSWORD }))
    fireEvent.change(screen.getByLabelText(UI_USER_RESET_PASSWORD_FIELD_LABEL), {
      target: { value: VALID_RESET_PASSWORD },
    })
    fireEvent.click(screen.getByRole('button', { name: UI_USER_CONFIRM_RESET_PASSWORD_CONFIRM }))

    await waitForMicrotasks()

    expect(resetMutation.mutateAsync).toHaveBeenCalledWith({
      id: user.id,
      data: { new_password: VALID_RESET_PASSWORD },
    })
    expect(onCompleted).toHaveBeenCalled()
  })

  test('keeps reset disabled and skips mutation when password is too short', async () => {
    useDeleteUserMock.mockReturnValue(mockMutation())
    const resetMutation = mockMutation()
    useResetUserPasswordMock.mockReturnValue(resetMutation)
    const user = buildUser()

    render(<UserRowActions client={{} as never} user={user as never} onEdit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: UI_USER_ACTION_RESET_PASSWORD }))
    fireEvent.change(screen.getByLabelText(UI_USER_RESET_PASSWORD_FIELD_LABEL), {
      target: { value: SHORT_RESET_PASSWORD },
    })

    const confirmButton = screen.getByRole('button', { name: UI_USER_CONFIRM_RESET_PASSWORD_CONFIRM })
    expect(confirmButton).toBeDisabled()

    fireEvent.click(confirmButton)
    await waitForMicrotasks()

    expect(resetMutation.mutateAsync).not.toHaveBeenCalled()
  })
})
