import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { TenantQuotaFormFlow } from '../../../src/ui/workflows/TenantQuotaFormFlow'

const useUpdateQuotaLimitsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useUpdateQuotaLimits: useUpdateQuotaLimitsMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('TenantQuotaFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits quota updates for provided tenant', async () => {
    const mutation = mockMutation()
    useUpdateQuotaLimitsMock.mockReturnValue(mutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <TenantQuotaFormFlow
        client={{} as never}
        tenantId="tenant-123"
        show={true}
        onClose={onClose}
        submitLabel="Save quotas"
      />
    )

    fireEvent.click(getByRole('button', { name: 'Save quotas' }))

    await waitFor(() =>
      expect(mutation.mutateAsync).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        data: expect.any(Object),
      })
    )
    expect(onClose).toHaveBeenCalled()
  })
})
