import { describe, expect, it } from 'vitest'

import { normalizeLicenseStatus } from '@/routes/licenses/LicensesRoute'
import { UI_LICENSE_STATUS_ACTIVE, UI_LICENSE_STATUS_SUSPENDED } from '@/ui/constants'

describe('normalizeLicenseStatus', () => {
  it('falls back to active when status is missing', () => {
    expect(normalizeLicenseStatus(undefined)).toBe(UI_LICENSE_STATUS_ACTIVE)
  })

  it('returns the provided status when valid', () => {
    expect(normalizeLicenseStatus(UI_LICENSE_STATUS_SUSPENDED)).toBe(UI_LICENSE_STATUS_SUSPENDED)
  })

  it('guards against unknown statuses by returning active', () => {
    const UNKNOWN_STATUS = 'UNKNOWN' as const
    expect(normalizeLicenseStatus(UNKNOWN_STATUS)).toBe(UI_LICENSE_STATUS_ACTIVE)
  })
})

