import { describe, expect, test, vi } from 'vitest'

import { createActionMenuItems } from '../../../src/ui/actions/createActionMenuItems'

type LicenseActionPayloads = {
  delete: { licenseId: string }
  activate: { licenseId: string }
}

describe('createActionMenuItems', () => {
  test('produces menu items that invoke typed payload handlers', () => {
    const deleteHandler = vi.fn()
    const activateHandler = vi.fn()
    const licenseId = 'license-1'

    const items = createActionMenuItems<LicenseActionPayloads>([
      {
        id: 'delete',
        label: 'Delete',
        buildPayload: () => ({ licenseId }),
        onSelect: deleteHandler,
      },
      {
        id: 'activate',
        label: 'Activate',
        buildPayload: () => ({ licenseId }),
        onSelect: activateHandler,
        disabled: true,
      },
    ] as const)

    items[0].onSelect()
    expect(deleteHandler).toHaveBeenCalledWith({ licenseId })

    items[1].onSelect()
    expect(activateHandler).toHaveBeenCalledWith({ licenseId })
    expect(items[1].disabled).toBe(true)
  })
})
