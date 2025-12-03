import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import {
  ProductTierManagementExample,
  type ProductTierListItem,
} from '../../../src/ui/workflows/ProductTierManagementExample'

const useCreateProductTierMock = vi.hoisted(() => vi.fn())
const useUpdateProductTierMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateProductTier: useCreateProductTierMock,
    useUpdateProductTier: useUpdateProductTierMock,
  }
})

vi.mock('../../../src/ui/workflows/ProductTierRowActions', () => ({
  ProductTierRowActions: ({ tier }: { tier: { id: string } }) => <div data-testid={`tier-actions-${tier.id}`} />,
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const sampleTiers: readonly ProductTierListItem[] = [
  {
    id: 'tier-1',
    tierName: 'Starter',
    tierCode: 'STARTER',
  },
]

describe('ProductTierManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('creates tier from CTA', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(
      <ProductTierManagementExample client={{} as never} productId="prod-1" tiers={sampleTiers} />,
    )

    fireEvent.click(getByText('Create Tier'))
    fireEvent.click(getByRole('button', { name: 'Create tier' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
  })

  test('saves edits for selected tier', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateProductTierMock.mockReturnValue(createMutation)
    useUpdateProductTierMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(
      <ProductTierManagementExample client={{} as never} productId="prod-1" tiers={sampleTiers} />,
    )

    fireEvent.click(getByText('Edit'))
    fireEvent.click(getByRole('button', { name: 'Save tier' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'tier-1',
        data: expect.any(Object),
      }),
    )
  })
})


