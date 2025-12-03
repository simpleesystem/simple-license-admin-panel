import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { UserFormFlow } from '../../../src/ui/workflows/UserFormFlow'

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

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('UserFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits create flow and closes modal', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="create"
        show
        onClose={onClose}
        submitLabel="Create user"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Create user' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  test('submits update flow with provided user id', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="update"
        show
        onClose={() => {}}
        submitLabel="Save user"
        userId="user-1"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Save user' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'user-1',
        data: expect.any(Object),
      }),
    )
  })
})


