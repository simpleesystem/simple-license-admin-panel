import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  ProductEntitlementManagementExample,
  type ProductEntitlementListItem,
} from '../../../src/ui/workflows/ProductEntitlementManagementExample'

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

vi.mock('../../../src/ui/workflows/ProductEntitlementRowActions', () => ({
  ProductEntitlementRowActions: ({ entitlement }: { entitlement: { id: string } }) => (
    <div data-testid={`entitlement-actions-${entitlement.id}`} />
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const sampleEntitlements: readonly ProductEntitlementListItem[] = [
  {
    id: 'ent-1',
    key: 'FEATURE_A',
    valueType: 'string',
    defaultValue: 'enabled',
  },
]

describe('ProductEntitlementManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('creates entitlement through modal', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(
      <ProductEntitlementManagementExample client={{} as never} productId="prod-1" entitlements={sampleEntitlements} />,
    )

    fireEvent.click(getByText('Create Entitlement'))
    fireEvent.click(getByRole('button', { name: 'Create entitlement' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
  })

  test('edits entitlement', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(
      <ProductEntitlementManagementExample client={{} as never} productId="prod-1" entitlements={sampleEntitlements} />,
    )

    fireEvent.click(getByText('Edit'))
    fireEvent.click(getByRole('button', { name: 'Save entitlement' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'ent-1',
        data: expect.any(Object),
      }),
    )
  })
})


