import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_ACTION_DELETE,
  UI_LICENSE_ACTION_RESUME,
  UI_LICENSE_ACTION_SUSPEND,
  UI_LICENSE_BUTTON_EDIT,
} from '../../../../src/ui/constants'
import { LicenseManagementExample } from '../../../../src/ui/workflows/LicenseManagementExample'
import { buildLicense } from '../../../factories/licenseFactory'
import { renderWithProviders } from '../../utils'

const useRevokeLicenseMock = vi.hoisted(() => vi.fn())
const useSuspendLicenseMock = vi.hoisted(() => vi.fn())
const useResumeLicenseMock = vi.hoisted(() => vi.fn())
const useUpdateLicenseMock = vi.hoisted(() => vi.fn())
const useCreateLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useRevokeLicense: useRevokeLicenseMock,
    useSuspendLicense: useSuspendLicenseMock,
    useResumeLicense: useResumeLicenseMock,
    useUpdateLicense: useUpdateLicenseMock,
    useCreateLicense: useCreateLicenseMock,
  }
})

vi.mock('../../../../src/ui/data/ActionMenu', () => ({
  ActionMenu: ({
    items,
  }: {
    items: Array<{ id: string; label: string; disabled?: boolean; onSelect: () => void }>
  }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={item.onSelect} disabled={item.disabled}>
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

describe('License RBAC & vendor scoping', () => {
  test('SUPERUSER can edit and delete any vendor license', async () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useCreateLicenseMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <LicenseManagementExample
        client={{} as never}
        licenseId={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        tierOptions={[]}
        productOptions={[]}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() }}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_EDIT))
    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_DELETE))

    await waitFor(() => {
      expect(useRevokeLicenseMock().mutateAsync).toHaveBeenCalledWith(license.id)
    })
  })

  test('VENDOR_MANAGER can update own vendor license but cannot delete', async () => {
    const vendorId = faker.string.uuid()
    const license = buildLicense({ status: 'ACTIVE', vendorId })
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useCreateLicenseMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <LicenseManagementExample
        client={{} as never}
        licenseId={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        tierOptions={[]}
        productOptions={[]}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId }}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_EDIT))
    expect(screen.queryByText(UI_LICENSE_ACTION_DELETE)).toBeNull()

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_SUSPEND))
    await waitFor(() => {
      expect(useSuspendLicenseMock().mutateAsync).toHaveBeenCalledWith(license.id)
    })
  })

  test('VENDOR_MANAGER cannot act on other vendor license', () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useCreateLicenseMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <LicenseManagementExample
        client={{} as never}
        licenseId={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        tierOptions={[]}
        productOptions={[]}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: faker.string.uuid() }}
      />,
    )

    expect(screen.queryByText(UI_LICENSE_BUTTON_EDIT)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_ACTION_DELETE)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_ACTION_SUSPEND)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_ACTION_RESUME)).toBeNull()
  })

  test('VIEWER sees nothing actionable', () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useCreateLicenseMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <LicenseManagementExample
        client={{} as never}
        licenseId={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        tierOptions={[]}
        productOptions={[]}
        currentUser={{ role: 'VIEWER', vendorId: license.vendorId }}
      />,
    )

    expect(screen.queryByText(UI_LICENSE_BUTTON_EDIT)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_ACTION_DELETE)).toBeNull()
  })

  test('Resume action available only when suspended', async () => {
    const license = buildLicense({ status: 'SUSPENDED' })
    const revoke = mockMutation()
    const suspend = mockMutation()
    const resume = mockMutation()
    useRevokeLicenseMock.mockReturnValue(revoke)
    useSuspendLicenseMock.mockReturnValue(suspend)
    useResumeLicenseMock.mockReturnValue(resume)
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useCreateLicenseMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <LicenseManagementExample
        client={{} as never}
        licenseId={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        tierOptions={[]}
        productOptions={[]}
        currentUser={{ role: 'SUPERUSER', vendorId: license.vendorId }}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_RESUME))
    await waitFor(() => {
      expect(resume.mutateAsync).toHaveBeenCalledWith(license.id)
    })
  })
})

