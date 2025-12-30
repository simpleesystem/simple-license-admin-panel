const VALID_LICENSE_STATUSES = ['ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED'] as const

export function normalizeLicenseStatus(status: string | undefined): string {
  if (!status) {
    return 'ACTIVE'
  }
  if (VALID_LICENSE_STATUSES.includes(status as (typeof VALID_LICENSE_STATUSES)[number])) {
    return status
  }
  return 'ACTIVE'
}
