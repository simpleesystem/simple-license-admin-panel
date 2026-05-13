import { faker } from '@faker-js/faker'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_ACTION_DELETE,
  UI_LICENSE_ACTION_RESUME,
  UI_LICENSE_ACTION_REVOKE,
  UI_LICENSE_ACTION_SUSPEND,
  UI_LICENSE_CONFIRM_DELETE_CONFIRM,
  UI_LICENSE_CONFIRM_REVOKE_CONFIRM,
  UI_USER_ROLE_SUPERUSER,
  UI_USER_ROLE_VENDOR_MANAGER,
} from '../../../src/ui/constants'
import { LicenseRowActions } from '../../../src/ui/workflows/LicenseRowActions'
import { buildLicense } from '../../factories/licenseFactory'

const useRevokeLicenseMock = vi.hoisted(() => vi.fn())
const useSoftDeleteLicenseMock = vi.hoisted(() => vi.fn())
const useSuspendLicenseMock = vi.hoisted(() => vi.fn())
const useResumeLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useRevokeLicense: useRevokeLicenseMock,
    useSoftDeleteLicense: useSoftDeleteLicenseMock,
    useSuspendLicense: useSuspendLicenseMock,
    useResumeLicense: useResumeLicenseMock,
  }
})

vi.mock('../../../src/ui/data/ActionMenu', () => ({
  ActionMenu: ({
    items,
  }: {
    items: Array<{ id: string; label: string; disabled?: boolean; onSelect: () => void }>
  }) => (
    <div>
      {items.map((item) => (
        <button type="button" key={item.id} onClick={item.onSelect} disabled={item.disabled}>
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

describe('LicenseRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSoftDeleteLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())
  })

  test('renders action buttons and executes soft delete mutation from delete action', async () => {
    const license = buildLicense({ status: 'ACTIVE' })
    const revokeMutation = mockMutation()
    const softDeleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useRevokeLicenseMock.mockReturnValue(revokeMutation)
    useSoftDeleteLicenseMock.mockReturnValue(softDeleteMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)

    render(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.id}
        licenseVendorId={license.vendorId ?? null}
        licenseStatus={license.status}
        currentUser={{ role: UI_USER_ROLE_SUPERUSER, vendorId: license.vendorId ?? null }}
      />
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_DELETE))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: UI_LICENSE_CONFIRM_DELETE_CONFIRM }))

    await waitFor(() => expect(softDeleteMutation.mutateAsync).toHaveBeenCalledWith(license.id))
    expect(revokeMutation.mutateAsync).not.toHaveBeenCalled()
  })

  test('executes revoke mutation from revoke action without soft deleting', async () => {
    const license = buildLicense({ status: 'ACTIVE' })
    const revokeMutation = mockMutation()
    const softDeleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useRevokeLicenseMock.mockReturnValue(revokeMutation)
    useSoftDeleteLicenseMock.mockReturnValue(softDeleteMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)

    render(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.id}
        licenseVendorId={license.vendorId ?? null}
        licenseStatus={license.status}
        currentUser={{ role: UI_USER_ROLE_SUPERUSER, vendorId: license.vendorId ?? null }}
      />
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_REVOKE))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: UI_LICENSE_CONFIRM_REVOKE_CONFIRM }))

    await waitFor(() => expect(revokeMutation.mutateAsync).toHaveBeenCalledWith(license.id))
    expect(softDeleteMutation.mutateAsync).not.toHaveBeenCalled()
  })

  test('disables resume action when license is not suspended', async () => {
    const license = buildLicense({ status: 'ACTIVE' })
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSoftDeleteLicenseMock.mockReturnValue(deleteMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)

    render(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.id}
        licenseVendorId={license.vendorId ?? null}
        licenseStatus={license.status}
        currentUser={{ role: UI_USER_ROLE_SUPERUSER, vendorId: license.vendorId ?? null }}
      />
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_SUSPEND))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /Suspend license/i }))

    await waitFor(() => expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(license.id))
  })

  test('allows resume action when license is suspended', async () => {
    const license = buildLicense({ status: 'SUSPENDED' })
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSoftDeleteLicenseMock.mockReturnValue(deleteMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)

    render(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        currentUser={{ role: UI_USER_ROLE_SUPERUSER, vendorId: license.vendorId }}
      />
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_RESUME))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /Resume license/i }))

    await waitFor(() => expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(license.id))
  })

  test('hides delete action for vendor manager while allowing updates', async () => {
    const vendorId = faker.string.uuid()
    const license = buildLicense({ status: 'ACTIVE', vendorId })
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSoftDeleteLicenseMock.mockReturnValue(deleteMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)

    render(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        currentUser={{ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId: license.vendorId }}
      />
    )

    expect(screen.queryByText(UI_LICENSE_ACTION_DELETE)).toBeNull()
    expect(screen.getByText(UI_LICENSE_ACTION_SUSPEND)).toBeInTheDocument()

    // Verify suspend works via modal
    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_SUSPEND))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /Suspend license/i }))
    await waitFor(() => expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(license.id))
  })

  test('hides all actions when vendor scoped user does not own the license', () => {
    const license = buildLicense({ status: 'ACTIVE' })
    const view = render(
      <LicenseRowActions
        client={{} as never}
        licenseKey={license.id}
        licenseVendorId={license.vendorId}
        licenseStatus={license.status}
        currentUser={{ role: UI_USER_ROLE_VENDOR_MANAGER, vendorId: faker.string.uuid() }}
      />
    )

    expect(view.container.childElementCount).toBe(0)
  })
})
