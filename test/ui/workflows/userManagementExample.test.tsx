import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { UserManagementExample, type UserListItem } from '../../../src/ui/workflows/UserManagementExample'

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
  UserRowActions: ({ user }: { user: { id: string } }) => <div data-testid={`user-actions-${user.id}`} />,
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const sampleUsers: readonly UserListItem[] = [
  {
    id: 'user-1',
    username: 'user.one',
    email: 'one@example.com',
    role: 'admin',
    vendorId: null,
  },
]

describe('UserManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('creates user via CTA flow', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(
      <UserManagementExample client={{} as never} users={sampleUsers} />,
    )

    fireEvent.click(getByText('Create User'))
    fireEvent.click(getByRole('button', { name: 'Create user' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
  })

  test('edits selected user row', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(
      <UserManagementExample client={{} as never} users={sampleUsers} />,
    )

    fireEvent.click(getByText('Edit'))
    fireEvent.click(getByRole('button', { name: 'Save user' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'user-1',
        data: expect.any(Object),
      }),
    )
  })
})


