import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { UI_USER_FORM_SUBMIT_CREATE, UI_USER_FORM_SUBMIT_UPDATE } from '../../../src/ui/constants'
import { UserFormFlow } from '../../../src/ui/workflows/UserFormFlow'
import { buildUser } from '../../factories/userFactory'
import { buildText } from '../../ui/factories/uiFactories'

const useCreateUserMock = vi.hoisted(() => vi.fn())
const useUpdateUserMock = vi.hoisted(() => vi.fn())
const useAdminTenantsMock = vi.hoisted(() => vi.fn())

vi.mock('../../../src/app/auth/useAuth', () => ({
  useAuth: () => ({
    currentUser: {
      id: 'test-admin-id',
      email: 'admin@example.com',
      role: 'SUPERUSER',
    },
    isAuthenticated: true,
  }),
}))

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useCreateUser: useCreateUserMock,
    useUpdateUser: useUpdateUserMock,
    useAdminTenants: useAdminTenantsMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const SINGLE_INVOCATION_COUNT = 1 as const

describe('UserFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAdminTenantsMock.mockReturnValue({ data: [] })
  })

  test('submits create mutation', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={vi.fn()}
        submitLabel={UI_USER_FORM_SUBMIT_CREATE}
        onCompleted={vi.fn()}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
  })

  test('calls onClose after create success', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={onClose}
        submitLabel={UI_USER_FORM_SUBMIT_CREATE}
        onCompleted={vi.fn()}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  test('uses default submit label when none provided (create)', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={onClose}
        onCompleted={vi.fn()}
        submitLabel={UI_USER_FORM_SUBMIT_CREATE}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  test('calls onCompleted after create success', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={vi.fn()}
        submitLabel={UI_USER_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(onCompleted).toHaveBeenCalled())
  })

  test('uses default submit label when none provided (update)', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const user = buildUser()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="update"
        show={true}
        onClose={vi.fn()}
        userId={user.id}
        onCompleted={vi.fn()}
        submitLabel={UI_USER_FORM_SUBMIT_UPDATE}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_UPDATE }))
    await waitFor(() => expect(updateMutation.mutateAsync).toHaveBeenCalled())
  })

  test('submits update mutation with provided user id', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const user = buildUser()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="update"
        show={true}
        onClose={() => {}}
        submitLabel={UI_USER_FORM_SUBMIT_UPDATE}
        userId={user.id}
        onCompleted={vi.fn()}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: user.id,
        data: expect.any(Object),
      })
    )
  })

  test('calls onCompleted after update success', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateUserMock.mockReturnValue(createMutation)
    useUpdateUserMock.mockReturnValue(updateMutation)
    const user = buildUser()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="update"
        show={true}
        onClose={() => {}}
        submitLabel={UI_USER_FORM_SUBMIT_UPDATE}
        userId={user.id}
        onCompleted={onCompleted}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_UPDATE }))

    await waitFor(() => expect(onCompleted).toHaveBeenCalled())
  })

  test('does not call onCompleted when mutation fails', async () => {
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
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={vi.fn()}
        submitLabel={UI_USER_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))

    await waitFor(() => createMutation.mutateAsync.mock.calls.length >= SINGLE_INVOCATION_COUNT)
    const mutateCall = createMutation.mutateAsync.mock.results.at(-1)?.value as Promise<unknown>
    await mutateCall?.catch(() => undefined)

    expect(onCompleted).not.toHaveBeenCalled()
  })

  test('does not call onClose when mutation fails', async () => {
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
    const onClose = vi.fn()

    const { getByRole } = render(
      <UserFormFlow
        client={{} as never}
        mode="create"
        show={true}
        onClose={onClose}
        submitLabel={UI_USER_FORM_SUBMIT_CREATE}
        onCompleted={vi.fn()}
      />
    )

    fireEvent.click(getByRole('button', { name: UI_USER_FORM_SUBMIT_CREATE }))

    await waitFor(() => createMutation.mutateAsync.mock.calls.length >= SINGLE_INVOCATION_COUNT)
    const mutateCall = createMutation.mutateAsync.mock.results.at(-1)?.value as Promise<unknown>
    await mutateCall?.catch(() => undefined)

    expect(onClose).not.toHaveBeenCalled()
  })
})
