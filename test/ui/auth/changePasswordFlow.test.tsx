import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { ChangePasswordFlow } from '../../../src/ui/auth/ChangePasswordFlow'
import { ApiContext } from '../../../src/api/apiContext'

const useChangePasswordMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useChangePassword: useChangePasswordMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const renderWithApi = (ui: React.ReactElement) => {
  return render(<ApiContext.Provider value={{} as never}>{ui}</ApiContext.Provider>)
}

describe('ChangePasswordFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits change password request', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)
    const onSuccess = vi.fn()

    renderWithApi(<ChangePasswordFlow onSuccess={onSuccess} />)

    fireEvent.change(document.querySelector('input[name="current_password"]') as HTMLInputElement, {
      target: { value: 'old-pass' },
    })
    fireEvent.change(document.querySelector('input[name="new_password"]') as HTMLInputElement, {
      target: { value: 'new-pass' },
    })
    fireEvent.change(document.querySelector('input[name="confirm_new_password"]') as HTMLInputElement, {
      target: { value: 'new-pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => expect(mutation.mutateAsync).toHaveBeenCalledWith({ current_password: 'old-pass', new_password: 'new-pass' }))
    expect(onSuccess).toHaveBeenCalled()
  })

  test('prevents submission when confirmation mismatches', async () => {
    const mutation = mockMutation()
    useChangePasswordMock.mockReturnValue(mutation)

    renderWithApi(<ChangePasswordFlow />)

    fireEvent.change(document.querySelector('input[name="new_password"]') as HTMLInputElement, {
      target: { value: 'new-pass' },
    })
    fireEvent.change(document.querySelector('input[name="confirm_new_password"]') as HTMLInputElement, {
      target: { value: 'different' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => expect(screen.getByText('Passwords must match')).toBeInTheDocument())
    expect(mutation.mutateAsync).not.toHaveBeenCalled()
  })
})


