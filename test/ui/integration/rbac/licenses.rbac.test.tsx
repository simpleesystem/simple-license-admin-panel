import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_ACTION_EDIT,
  UI_LICENSE_BUTTON_DELETE,
  UI_LICENSE_BUTTON_RESUME,
  UI_LICENSE_BUTTON_SUSPEND,
  UI_LICENSE_CONFIRM_DELETE_CONFIRM,
  UI_LICENSE_CONFIRM_RESUME_CONFIRM,
} from '../../../../src/ui/constants'
import { LicenseRowActions } from '../../../../src/ui/workflows/LicenseRowActions'
import { buildLicense } from '../../../factories/licenseFactory'
import { renderWithProviders } from '../../utils'

const useRevokeLicenseMock = vi.hoisted(() => vi.fn())
const useSuspendLicenseMock = vi.hoisted(() => vi.fn())
const useResumeLicenseMock = vi.hoisted(() => vi.fn())
const useUpdateLicenseMock = vi.hoisted(() => vi.fn())
const useCreateLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useRevokeLicense: useRevokeLicenseMock,
    useSuspendLicense: useSuspendLicenseMock,
    useResumeLicense: useResumeLicenseMock,
    useUpdateLicense: useUpdateLicenseMock,
    useCreateLicense: useCreateLicenseMock,
  }
})


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

    const onEdit = vi.fn()
    renderWithProviders(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.licenseKey ?? license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() }}
        onEdit={onEdit}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_EDIT))
    expect(onEdit).toHaveBeenCalledWith(license.licenseKey ?? license.id)

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_DELETE))
    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_CONFIRM_DELETE_CONFIRM)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_CONFIRM_DELETE_CONFIRM))

    await waitFor(() => {
      expect(useRevokeLicenseMock().mutateAsync).toHaveBeenCalledWith(license.licenseKey ?? license.id)
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

    const onEdit = vi.fn()
    renderWithProviders(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.licenseKey ?? license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId }}
        onEdit={onEdit}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_EDIT))
    expect(onEdit).toHaveBeenCalledWith(license.licenseKey ?? license.id)
    expect(screen.queryByText(UI_LICENSE_BUTTON_DELETE)).toBeNull()

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_SUSPEND))
    await waitFor(() => {
      expect(useSuspendLicenseMock().mutateAsync).toHaveBeenCalledWith(license.licenseKey ?? license.id)
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
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.licenseKey ?? license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: faker.string.uuid() }}
      />,
    )

    expect(screen.queryByText(UI_LICENSE_ACTION_EDIT)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_BUTTON_DELETE)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_BUTTON_SUSPEND)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_BUTTON_RESUME)).toBeNull()
  })

  test('VIEWER sees nothing actionable', () => {
    const license = buildLicense({ status: 'ACTIVE' })
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useCreateLicenseMock.mockReturnValue(mockMutation())

    renderWithProviders(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.licenseKey ?? license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        currentUser={{ role: 'VIEWER', vendorId: license.vendorId }}
      />,
    )

    expect(screen.queryByText(UI_LICENSE_ACTION_EDIT)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_BUTTON_DELETE)).toBeNull()
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
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.licenseKey ?? license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        currentUser={{ role: 'SUPERUSER', vendorId: license.vendorId }}
        onEdit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_RESUME))
    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_CONFIRM_RESUME_CONFIRM)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_CONFIRM_RESUME_CONFIRM))
    await waitFor(() => {
      expect(resume.mutateAsync).toHaveBeenCalledWith(license.licenseKey ?? license.id)
    })
  })
})

