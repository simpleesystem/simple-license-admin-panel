import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ProductEntitlementFormFlow } from '../../../src/ui/workflows/ProductEntitlementFormFlow'

const useCreateEntitlementMock = vi.hoisted(() => vi.fn())
const useUpdateEntitlementMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateEntitlement: useCreateEntitlementMock,
    useUpdateEntitlement: useUpdateEntitlementMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('ProductEntitlementFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits create flow', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <ProductEntitlementFormFlow
        client={{} as never}
        mode="create"
        productId="prod-1"
        show
        onClose={onClose}
        submitLabel="Create entitlement"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Create entitlement' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  test('submits update flow', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)

    const { getByRole } = render(
      <ProductEntitlementFormFlow
        client={{} as never}
        mode="update"
        entitlementId="ent-1"
        show
        onClose={() => {}}
        submitLabel="Save entitlement"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Save entitlement' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'ent-1',
        data: expect.any(Object),
      }),
    )
  })
})


