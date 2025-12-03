import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { LicenseManagementExample } from '../../../src/ui/workflows/LicenseManagementExample'
import type { UiSelectOption } from '../../../src/ui/types'

const useCreateLicenseMock = vi.hoisted(() => vi.fn())
const useUpdateLicenseMock = vi.hoisted(() => vi.fn())
const useRevokeLicenseMock = vi.hoisted(() => vi.fn())
const useSuspendLicenseMock = vi.hoisted(() => vi.fn())
const useResumeLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateLicense: useCreateLicenseMock,
    useUpdateLicense: useUpdateLicenseMock,
    useRevokeLicense: useRevokeLicenseMock,
    useSuspendLicense: useSuspendLicenseMock,
    useResumeLicense: useResumeLicenseMock,
  }
})

vi.mock('../../../src/ui/data/ActionMenu', () => ({
  ActionMenu: ({ items }: { items: Array<{ id: string; label: string; onSelect: () => void }> }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={item.onSelect}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const tierOptions: readonly UiSelectOption[] = [{ value: 'tier', label: 'Tier' }]
const productOptions: readonly UiSelectOption[] = [{ value: 'product', label: 'Product' }]

describe('LicenseManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('executes update mutation when modal form submits', async () => {
    useCreateLicenseMock.mockReturnValue(mockMutation())
    const updateMutation = mockMutation()
    useUpdateLicenseMock.mockReturnValue(updateMutation)
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())

    render(
      <LicenseManagementExample
        client={{} as never}
        licenseId="license-123"
        licenseStatus="ACTIVE"
        tierOptions={tierOptions}
        productOptions={productOptions}
      />,
    )

    fireEvent.click(screen.getByText('Edit license'))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'license-123',
        data: expect.any(Object),
      })
    })
  })

  test('wires row actions to revoke mutation', () => {
    useCreateLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    const deleteMutation = mockMutation()
    useRevokeLicenseMock.mockReturnValue(deleteMutation)
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())

    render(
      <LicenseManagementExample
        client={{} as never}
        licenseId="license-456"
        licenseStatus="ACTIVE"
        tierOptions={tierOptions}
        productOptions={productOptions}
      />,
    )

    fireEvent.click(screen.getByText('Delete License'))

    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith('license-456')
  })
})


