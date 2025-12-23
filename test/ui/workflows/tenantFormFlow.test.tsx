import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { UI_TENANT_FORM_SUBMIT_CREATE, UI_TENANT_FORM_SUBMIT_UPDATE } from '../../../src/ui/constants'
import { TenantFormFlow } from '../../../src/ui/workflows/TenantFormFlow'
import { buildTenant } from '../../factories/tenantFactory'
import { buildText } from '../../ui/factories/uiFactories'

const useCreateTenantMock = vi.hoisted(() => vi.fn())
const useUpdateTenantMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
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

  test('submits create flow and triggers callbacks', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <TenantFormFlow
        client={{} as never}
        mode="create"
        show
        onClose={onClose}
        submitLabel={UI_TENANT_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_TENANT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
    expect(onCompleted).toHaveBeenCalled()
  })

  test('submits update flow with tenant id and triggers onCompleted', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const tenant = buildTenant()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <TenantFormFlow
        client={{} as never}
        mode="update"
        show
        onClose={() => {}}
        submitLabel={UI_TENANT_FORM_SUBMIT_UPDATE}
        tenantId={tenant.id}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_TENANT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: tenant.id,
        data: expect.any(Object),
      }),
    )
    expect(onCompleted).toHaveBeenCalled()
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
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <TenantFormFlow
        client={{} as never}
        mode="create"
        show
        onClose={onClose}
        submitLabel={UI_TENANT_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_TENANT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const mutateCall = createMutation.mutateAsync.mock.results[0]?.value as Promise<unknown>
    await expect(mutateCall).rejects.toThrow(mutationError)
    expect(onCompleted).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})


