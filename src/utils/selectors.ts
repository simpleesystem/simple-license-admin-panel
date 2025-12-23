import type { License, LicenseStatus, Product, ProductTier } from '@/simpleLicense'

import { LICENSE_EXPIRY_WARNING_DAYS } from '../app/constants'

type LicenseFilterOptions = {
  statuses?: LicenseStatus[]
  productId?: string
  tierCodes?: string[]
}

type ExpiringLicenseOptions = {
  withinDays?: number
  now?: Date
}

type ProductTierFilterOptions = {
  onlyActive?: boolean
}

const coerceDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) {
    return null
  }
  if (value instanceof Date) {
    return value
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const selectLicensesByStatus = (licenses: License[], statuses: LicenseStatus[]): License[] => {
  if (!Array.isArray(statuses) || statuses.length === 0) {
    return [...licenses]
  }
  const statusSet = new Set(statuses)
  return licenses.filter((license) => statusSet.has(license.status))
}

export const selectLicensesForProduct = (licenses: License[], productId: string): License[] => {
  if (!productId) {
    return []
  }
  return licenses.filter((license) => license.productId === productId)
}

export const selectFilteredLicenses = (licenses: License[], options: LicenseFilterOptions = {}): License[] => {
  const { statuses, productId, tierCodes } = options
  const tierSet = tierCodes ? new Set(tierCodes) : null
  const statusSet = statuses ? new Set(statuses) : null

  return licenses.filter((license) => {
    if (statusSet && !statusSet.has(license.status)) {
      return false
    }
    if (productId && license.productId !== productId) {
      return false
    }
    if (tierSet && !tierSet.has(license.tierCode)) {
      return false
    }
    return true
  })
}

export const selectExpiringLicenses = (
  licenses: License[],
  options: ExpiringLicenseOptions = {},
): License[] => {
  const { withinDays = LICENSE_EXPIRY_WARNING_DAYS, now = new Date() } = options
  const nowEpoch = now.getTime()
  const thresholdMs = withinDays * 24 * 60 * 60 * 1_000

  return licenses.filter((license) => {
    const expiry = coerceDate(license.expiresAt)
    if (!expiry) {
      return false
    }
    const expiresEpoch = expiry.getTime()
    if (Number.isNaN(expiresEpoch) || expiresEpoch < nowEpoch) {
      return false
    }
    return expiresEpoch - nowEpoch <= thresholdMs
  })
}

export const selectProductsByActivity = (products: Product[], isActive = true): Product[] =>
  products.filter((product) => product.isActive === isActive)

export const selectProductTiersByProduct = (
  tiers: ProductTier[],
  productId: string,
  options: ProductTierFilterOptions = {},
): ProductTier[] => {
  if (!productId) {
    return []
  }
  const { onlyActive = true } = options
  return tiers.filter((tier) => {
    if (tier.productId !== productId) {
      return false
    }
    if (onlyActive) {
      return tier.isActive
    }
    return true
  })
}


