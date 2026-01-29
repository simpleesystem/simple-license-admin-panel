import { describe, expect, it } from 'vitest'

import {
  selectExpiringLicenses,
  selectFilteredLicenses,
  selectLicensesByStatus,
  selectLicensesForProduct,
  selectProductsByActivity,
  selectProductTiersByProduct,
} from '../../src/utils/selectors'
import { buildLicense, buildProduct, buildProductTier } from '../factories/licenseFactory'

const STATUS_ACTIVE = 'ACTIVE' as const
const STATUS_REVOKED = 'REVOKED' as const
const TIER_PROFESSIONAL = 'PROFESSIONAL' as const
const TIER_FREE = 'FREE' as const
const PRODUCT_ID_ALPHA = 'product-123' as const
const PRODUCT_ID_BETA = 'product-456' as const
const PRODUCT_ID_GAMMA = 'product-789' as const
const PRODUCT_ID_OTHER = 'other-product' as const
const EXPIRY_NOW = new Date('2024-01-01T00:00:00Z')
const EXPIRY_WITHIN = new Date('2024-01-05T00:00:00Z')
const EXPIRY_OUTSIDE = new Date('2024-03-01T00:00:00Z')
const EXPIRY_EXPIRED = new Date('2023-12-01T00:00:00Z')
const INVALID_EXPIRY_VALUE = 'invalid-date' as const

describe('selectors', () => {
  it('filters licenses by status', () => {
    const activeLicense = buildLicense({ status: STATUS_ACTIVE })
    const revokedLicense = buildLicense({ status: STATUS_REVOKED })

    const result = selectLicensesByStatus([activeLicense, revokedLicense], [STATUS_ACTIVE])

    expect(result).toEqual([activeLicense])
  })

  it('returns all licenses when no statuses are provided', () => {
    const licenses = [buildLicense(), buildLicense()]
    const result = selectLicensesByStatus(licenses, [])
    expect(result).toEqual(licenses)
  })

  it('filters licenses with composite criteria', () => {
    const matching = buildLicense({ status: STATUS_ACTIVE, productId: PRODUCT_ID_ALPHA, tierCode: TIER_PROFESSIONAL })
    const wrongProduct = buildLicense({ status: STATUS_ACTIVE, productId: PRODUCT_ID_OTHER })
    const wrongTier = buildLicense({ status: STATUS_ACTIVE, productId: PRODUCT_ID_ALPHA, tierCode: TIER_FREE })

    const result = selectFilteredLicenses([matching, wrongProduct, wrongTier], {
      statuses: [STATUS_ACTIVE],
      productId: PRODUCT_ID_ALPHA,
      tierCodes: [TIER_PROFESSIONAL],
    })

    expect(result).toEqual([matching])
  })

  it('excludes licenses whose status is not in the filter', () => {
    const activeLicense = buildLicense({ status: STATUS_ACTIVE })
    const revokedLicense = buildLicense({ status: STATUS_REVOKED })

    const result = selectFilteredLicenses([activeLicense, revokedLicense], { statuses: [STATUS_ACTIVE] })

    expect(result).toEqual([activeLicense])
  })

  it('returns all licenses when no filters are provided', () => {
    const licenses = [buildLicense(), buildLicense()]
    expect(selectFilteredLicenses(licenses)).toEqual(licenses)
  })

  it('selects expiring licenses within a threshold', () => {
    const withinWindow = buildLicense({ expiresAt: EXPIRY_WITHIN })
    const outsideWindow = buildLicense({ expiresAt: EXPIRY_OUTSIDE })
    const invalidExpiry = buildLicense({ expiresAt: INVALID_EXPIRY_VALUE })
    const missingExpiry = buildLicense({ expiresAt: null })
    const expired = buildLicense({ expiresAt: EXPIRY_EXPIRED })

    const result = selectExpiringLicenses([withinWindow, outsideWindow, invalidExpiry, missingExpiry, expired], {
      withinDays: 10,
      now: EXPIRY_NOW,
    })

    expect(result).toEqual([withinWindow])
  })

  it('coerces string expiry dates when selecting expiring licenses', () => {
    const expiryString = '2024-01-05T00:00:00.000Z'
    const withinWindowString = buildLicense({ expiresAt: expiryString })

    const result = selectExpiringLicenses([withinWindowString], { withinDays: 10, now: EXPIRY_NOW })

    expect(result).toEqual([withinWindowString])
  })

  it('filters licenses belonging to a product', () => {
    const matching = buildLicense({ productId: PRODUCT_ID_GAMMA })
    const other = buildLicense()

    expect(selectLicensesForProduct([matching, other], PRODUCT_ID_GAMMA)).toEqual([matching])
    expect(selectLicensesForProduct([matching], '')).toEqual([])
  })

  it('filters products by activity state', () => {
    const activeProduct = buildProduct({ isActive: true })
    const inactiveProduct = buildProduct({ isActive: false })

    expect(selectProductsByActivity([activeProduct, inactiveProduct], true)).toEqual([activeProduct])
    expect(selectProductsByActivity([activeProduct, inactiveProduct], false)).toEqual([inactiveProduct])
  })

  it('filters tiers for a product and respects active flag', () => {
    const activeTier = buildProductTier({ productId: PRODUCT_ID_BETA, isActive: true })
    const inactiveTier = buildProductTier({ productId: PRODUCT_ID_BETA, isActive: false })
    const otherProductTier = buildProductTier()

    expect(selectProductTiersByProduct([activeTier, inactiveTier, otherProductTier], PRODUCT_ID_BETA)).toEqual([
      activeTier,
    ])

    expect(
      selectProductTiersByProduct([activeTier, inactiveTier, otherProductTier], PRODUCT_ID_BETA, { onlyActive: false })
    ).toEqual([activeTier, inactiveTier])
  })

  it('returns an empty array when product id is missing for tier selection', () => {
    const tier = buildProductTier()
    expect(selectProductTiersByProduct([tier], '')).toEqual([])
  })
})
