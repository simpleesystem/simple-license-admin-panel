import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Client } from '@simple-license/react-sdk'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_FREEZE_FORM_SUBMIT_LABEL,
  UI_LICENSE_FREEZE_LABEL_ENTITLEMENTS,
  UI_LICENSE_FREEZE_LABEL_TIER,
} from '../../../src/ui/constants'
import { LicenseFreezeFormFlow } from '../../../src/ui/workflows/LicenseFreezeFormFlow'

const useFreezeLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useFreezeLicense: useFreezeLicenseMock,
  }
})

const createMutation = () => ({
  mutateAsync: vi.fn(async () => ({ success: true })),
  isPending: false,
})

const createClient = () => ({}) as Client

describe('LicenseFreezeFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits defaults and invokes success handler', async () => {
    const mutation = createMutation()
    useFreezeLicenseMock.mockReturnValue(mutation)
    const onSuccess = vi.fn()

    render(
      <LicenseFreezeFormFlow client={createClient()} licenseId="license-123" show onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    fireEvent.click(screen.getByRole('button', { name: UI_LICENSE_FREEZE_FORM_SUBMIT_LABEL }))

    await waitFor(() => {
      expect(mutation.mutateAsync).toHaveBeenCalledWith({
        id: 'license-123',
        data: { freeze_entitlements: true, freeze_tier: true },
      })
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  test('allows toggling freeze options before submission', async () => {
    const mutation = createMutation()
    useFreezeLicenseMock.mockReturnValue(mutation)

    render(<LicenseFreezeFormFlow client={createClient()} licenseId="license-456" show onClose={vi.fn()} />)

    fireEvent.click(screen.getByLabelText(UI_LICENSE_FREEZE_LABEL_ENTITLEMENTS))
    fireEvent.click(screen.getByLabelText(UI_LICENSE_FREEZE_LABEL_TIER))
    fireEvent.click(screen.getByRole('button', { name: UI_LICENSE_FREEZE_FORM_SUBMIT_LABEL }))

    await waitFor(() => {
      expect(mutation.mutateAsync).toHaveBeenCalledWith({
        id: 'license-456',
        data: { freeze_entitlements: false, freeze_tier: false },
      })
    })
  })
})

