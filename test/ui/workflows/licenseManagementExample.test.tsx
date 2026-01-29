import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_ACTION_EDIT,
  UI_LICENSE_BUTTON_DELETE,
  UI_LICENSE_CONFIRM_DELETE_CONFIRM,
  UI_LICENSE_FORM_SUBMIT_UPDATE,
} from '../../../src/ui/constants'
import type { UiSelectOption } from '../../../src/ui/types'
import { LicenseManagementExample } from '../../../src/ui/workflows/LicenseManagementExample'
import { buildLicense } from '../../factories/licenseFactory'
import { renderWithProviders } from '../utils'

const useCreateLicenseMock = vi.hoisted(() => vi.fn())
const useUpdateLicenseMock = vi.hoisted(() => vi.fn())
const useRevokeLicenseMock = vi.hoisted(() => vi.fn())
const useSuspendLicenseMock = vi.hoisted(() => vi.fn())
const useResumeLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
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
        <button type="button" key={item.id} onClick={item.onSelect}>
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

    const licenseListItem = {
      id: license.id,
      licenseKey: license.licenseKey,
      productSlug: license.productSlug ?? '',
      tierCode: license.tierCode ?? '',
      customerEmail: license.customerEmail ?? '',
      status: license.status,
      vendorId: license.vendorId,
    }

    const mockClient = {
      getLicense: vi.fn().mockResolvedValue({ license }),
    } as never

    renderWithProviders(
      <LicenseManagementExample
        client={mockClient}
        licenses={[licenseListItem]}
        tierOptions={tierOptions}
        productOptions={productOptions}
        currentUser={{ role: 'SUPERUSER', vendorId: license.vendorId }}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_EDIT))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_LICENSE_FORM_SUBMIT_UPDATE })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_LICENSE_FORM_SUBMIT_UPDATE }))

    await waitFor(() => {
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: license.licenseKey ?? license.id,
        data: expect.any(Object),
      })
    })
  })

  test('wires row actions to revoke mutation', async () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useCreateLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    const deleteMutation = mockMutation()
    useRevokeLicenseMock.mockReturnValue(deleteMutation)
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())

    const licenseListItem = {
      id: license.id,
      licenseKey: license.licenseKey,
      productSlug: license.productSlug ?? '',
      tierCode: license.tierCode ?? '',
      customerEmail: license.customerEmail ?? '',
      status: license.status,
      vendorId: license.vendorId,
    }

    renderWithProviders(
      <LicenseManagementExample
        client={{} as never}
        licenses={[licenseListItem]}
        tierOptions={tierOptions}
        productOptions={productOptions}
        currentUser={{ role: 'SUPERUSER', vendorId: license.vendorId }}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_BUTTON_DELETE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_DELETE))
    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_CONFIRM_DELETE_CONFIRM)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_CONFIRM_DELETE_CONFIRM))

    await waitFor(() => {
      expect(deleteMutation.mutateAsync).toHaveBeenCalledWith(license.licenseKey ?? license.id)
    })
  })

  test('hides management controls when vendor scoped user does not own license', () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useCreateLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())

    const licenseListItem = {
      id: license.id,
      licenseKey: license.licenseKey,
      productSlug: license.productSlug ?? '',
      tierCode: license.tierCode ?? '',
      customerEmail: license.customerEmail ?? '',
      status: license.status,
      vendorId: license.vendorId,
    }

    const { queryByText } = renderWithProviders(
      <LicenseManagementExample
        client={{} as never}
        licenses={[licenseListItem]}
        tierOptions={tierOptions}
        productOptions={productOptions}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: faker.string.uuid() }}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    // License should be filtered out, so no edit/delete buttons should be visible
    expect(queryByText(UI_LICENSE_ACTION_EDIT)).toBeNull()
    expect(queryByText(UI_LICENSE_BUTTON_DELETE)).toBeNull()
  })
})
