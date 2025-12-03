import { faker } from '@faker-js/faker'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { LicenseFormFlow } from '../../../src/ui/workflows/LicenseFormFlow'
import type { UiSelectOption } from '../../../src/ui/types'

const useCreateLicenseMock = vi.hoisted(() => vi.fn())
const useUpdateLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateLicense: useCreateLicenseMock,
    useUpdateLicense: useUpdateLicenseMock,
  }
})

const productOptions: readonly UiSelectOption[] = [
  { value: 'product-a', label: 'Product A' },
]

const tierOptions: readonly UiSelectOption[] = [
  { value: 'tier-a', label: 'Tier A' },
]

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({
    license: { id: faker.string.uuid() },
  })),
  isPending: false,
})

describe('LicenseFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits create flow via create mutation and closes modal', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateLicenseMock.mockReturnValue(createMutation)
    useUpdateLicenseMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()

    const { getByRole } = render(
      <LicenseFormFlow
        client={{} as never}
        mode="create"
        show
        onClose={onClose}
        submitLabel="Create"
        tierOptions={tierOptions}
        productOptions={productOptions}
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createMutation.mutateAsync).toHaveBeenCalled()
    })
    expect(onClose).toHaveBeenCalled()
  })

  test('submits update flow using provided license id', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateLicenseMock.mockReturnValue(createMutation)
    useUpdateLicenseMock.mockReturnValue(updateMutation)

    const { getByRole } = render(
      <LicenseFormFlow
        client={{} as never}
        mode="update"
        show
        licenseId="license-1"
        onClose={vi.fn()}
        submitLabel="Save"
        tierOptions={tierOptions}
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'license-1',
        data: expect.any(Object),
      })
    })
  })
})


