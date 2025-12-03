import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { LicenseRowActions } from '../../../src/ui/workflows/LicenseRowActions'

const useRevokeLicenseMock = vi.hoisted(() => vi.fn())
const useSuspendLicenseMock = vi.hoisted(() => vi.fn())
const useResumeLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
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

describe('LicenseRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders action buttons and executes revoke mutation', async () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useRevokeLicenseMock.mockReturnValue(deleteMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)

    render(
      <LicenseRowActions
        client={{} as never}
        licenseId="license-1"
        licenseStatus="ACTIVE"
        buttonLabel="Row actions"
      />,
    )

    fireEvent.click(screen.getByText('Delete License'))

    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith('license-1')
  })

  test('disables resume action when license is not suspended', () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useRevokeLicenseMock.mockReturnValue(deleteMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)

    render(
      <LicenseRowActions client={{} as never} licenseId="license-2" licenseStatus="ACTIVE" />,
    )

    fireEvent.click(screen.getByText('Suspend License'))

    expect(suspendMutation.mutateAsync).toHaveBeenCalledWith('license-2')
  })
})


