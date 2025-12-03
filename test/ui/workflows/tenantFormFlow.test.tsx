import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { TenantFormFlow } from '../../../src/ui/workflows/TenantFormFlow'

const useCreateTenantMock = vi.hoisted(() => vi.fn())
const useUpdateTenantMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateTenant: useCreateTenantMock,
    useUpdateTenant: useUpdateTenantMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('TenantFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits create flow and closes modal', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <TenantFormFlow
        client={{} as never}
        mode="create"
        show
        onClose={onClose}
        submitLabel="Create tenant"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Create tenant' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  test('submits update flow with tenant id', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)

    const { getByRole } = render(
      <TenantFormFlow
        client={{} as never}
        mode="update"
        show
        onClose={() => {}}
        submitLabel="Save tenant"
        tenantId="tenant-1"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Save tenant' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'tenant-1',
        data: expect.any(Object),
      }),
    )
  })
})


