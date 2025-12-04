import { faker } from '@faker-js/faker'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import {
  UI_LICENSE_ACTION_DELETE,
  UI_LICENSE_BUTTON_EDIT,
  UI_LICENSE_FORM_SUBMIT_UPDATE,
} from '../../../src/ui/constants'
import { LicenseManagementExample } from '../../../src/ui/workflows/LicenseManagementExample'
import type { UiSelectOption } from '../../../src/ui/types'
import { buildLicense } from '../../factories/licenseFactory'

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

const tierOptions: readonly UiSelectOption[] = [
  { value: faker.string.alphanumeric(6), label: faker.commerce.productName() },
]
const productOptions: readonly UiSelectOption[] = [
  { value: faker.string.alphanumeric(6), label: faker.commerce.productAdjective() },
]

describe('LicenseManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('executes update mutation when modal form submits', async () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useCreateLicenseMock.mockReturnValue(mockMutation())
    const updateMutation = mockMutation()
    useUpdateLicenseMock.mockReturnValue(updateMutation)
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())

    render(
      <LicenseManagementExample
        client={{} as never}
        licenseId={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        tierOptions={tierOptions}
        productOptions={productOptions}
        currentUser={{ role: 'SUPERUSER', vendorId: license.vendorId }}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_EDIT))
    fireEvent.click(screen.getByRole('button', { name: UI_LICENSE_FORM_SUBMIT_UPDATE }))

    await waitFor(() => {
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: license.id,
        data: expect.any(Object),
      })
    })
  })

  test('wires row actions to revoke mutation', () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useCreateLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    const deleteMutation = mockMutation()
    useRevokeLicenseMock.mockReturnValue(deleteMutation)
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())

    render(
      <LicenseManagementExample
        client={{} as never}
        licenseId={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        tierOptions={tierOptions}
        productOptions={productOptions}
        currentUser={{ role: 'SUPERUSER', vendorId: license.vendorId }}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_DELETE))

    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(license.id)
  })

  test('hides management controls when vendor scoped user does not own license', () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useCreateLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())

    const view = render(
      <LicenseManagementExample
        client={{} as never}
        licenseId={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        tierOptions={tierOptions}
        productOptions={productOptions}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: faker.string.uuid() }}
      />,
    )

    expect(view.container.childElementCount).toBe(0)
  })
})


