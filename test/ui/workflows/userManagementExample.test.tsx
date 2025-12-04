import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import {
  UI_USER_ACTION_DELETE,
  UI_USER_ACTION_EDIT,
  UI_USER_BUTTON_CREATE,
  UI_USER_BUTTON_EDIT,
  UI_USER_FORM_SUBMIT_CREATE,
  UI_USER_FORM_SUBMIT_UPDATE,
} from '../../../src/ui/constants'
import { UserManagementExample } from '../../../src/ui/workflows/UserManagementExample'
import { buildUser } from '../../factories/userFactory'
import { buildText } from '../../ui/factories/uiFactories'

const useCreateUserMock = vi.hoisted(() => vi.fn())
const useUpdateUserMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateUser: useCreateUserMock,
    useUpdateUser: useUpdateUserMock,
  }
})

vi.mock('../../../src/ui/workflows/UserRowActions', () => ({
  UserRowActions: ({
    user,
    onEdit,
    onCompleted,
  }: {
    user: { id: string }
    onEdit: (selected: { id: string }) => void
    onCompleted?: () => void
  }) => (
    <div>
      <button type="button" onClick={() => onEdit(user)}>
        {UI_USER_ACTION_EDIT}
      </button>
      <button type="button" onClick={() => onCompleted?.()}>
        {UI_USER_ACTION_DELETE}
      </button>
    </div>
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const SINGLE_INVOCATION_COUNT = 1 as const

describe('UserManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls create mutation from CTA', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const users = [buildUser()]

    const { getByText, getByRole } = render(
      <UserManagementExample client={{} as never} users={users} onRefresh={vi.fn()} />,
    )

    fireEvent.click(getByText(UI_USER_BUTTON_CREATE))
    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
  })

  test('refreshes after successful create', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const users = [buildUser()]

    const { getByText, getByRole } = render(
      <UserManagementExample client={{} as never} users={users} onRefresh={onRefresh} />,
    )

    fireEvent.click(getByText(UI_USER_BUTTON_CREATE))
    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(SINGLE_INVOCATION_COUNT))
  })

  test('calls update mutation for selected row', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const user = buildUser()

    const { getByText, getByRole } = render(
      <UserManagementExample client={{} as never} users={[user]} onRefresh={vi.fn()} />,
    )

    fireEvent.click(getByText(UI_USER_BUTTON_EDIT))
    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: user.id,
        data: expect.any(Object),
      }),
    )
  })

  test('refreshes after successful update', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const user = buildUser()

    const { getByText, getByRole } = render(
      <UserManagementExample client={{} as never} users={[user]} onRefresh={onRefresh} />,
    )

    fireEvent.click(getByText(UI_USER_BUTTON_EDIT))
    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_UPDATE }))

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(SINGLE_INVOCATION_COUNT))
  })

  test('refreshes after delete action', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const user = buildUser()

    const { getByText } = render(
      <UserManagementExample client={{} as never} users={[user]} onRefresh={onRefresh} />,
    )

    fireEvent.click(getByText(UI_USER_ACTION_DELETE))

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(SINGLE_INVOCATION_COUNT))
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
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const user = buildUser()

    const { getByText, getByRole } = render(
      <UserManagementExample client={{} as never} users={[user]} onRefresh={onRefresh} />,
    )

    fireEvent.click(getByText(UI_USER_BUTTON_CREATE))
    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))

    await waitFor(() => createMutation.mutateAsync.mock.calls.length >= SINGLE_INVOCATION_COUNT)
    const mutateCall = createMutation.mutateAsync.mock.results.at(-1)?.value as Promise<unknown>
    await mutateCall?.catch(() => undefined)

    expect(onRefresh).not.toHaveBeenCalled()
  })
})


