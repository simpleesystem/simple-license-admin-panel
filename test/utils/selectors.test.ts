import { describe, expect, it } from 'vitest'

import {
  selectExpiringLicenses,
  selectFilteredLicenses,
  selectLicensesByStatus,
  selectLicensesForProduct,
  selectProductTiersByProduct,
  selectProductsByActivity,
} from '../../src/utils/selectors'
import {
  buildLicense,
  buildProduct,
  buildProductTier,
} from '../factories/licenseFactory'

describe('selectors', () => {
  it('filters licenses by status', () => {
    const activeLicense = buildLicense({ status: 'ACTIVE' })
    const revokedLicense = buildLicense({ status: 'REVOKED' })

    const result = selectLicensesByStatus([activeLicense, revokedLicense], ['ACTIVE'])

    expect(result).toEqual([activeLicense])
  })

  it('returns all licenses when no statuses are provided', () => {
    const licenses = [buildLicense(), buildLicense()]
    const result = selectLicensesByStatus(licenses, [])
    expect(result).toEqual(licenses)
  })

  it('filters licenses with composite criteria', () => {
    const productId = 'product-123'
    const matching = buildLicense({ status: 'ACTIVE', productId, tierCode: 'PROFESSIONAL' })
    const wrongProduct = buildLicense({ status: 'ACTIVE', productId: 'other-product' })
    const wrongTier = buildLicense({ status: 'ACTIVE', productId, tierCode: 'FREE' })

    const result = selectFilteredLicenses(
      [matching, wrongProduct, wrongTier],
      { statuses: ['ACTIVE'], productId, tierCodes: ['PROFESSIONAL'] },
    )

    expect(result).toEqual([matching])
  })

  it('returns all licenses when no filters are provided', () => {
    const licenses = [buildLicense(), buildLicense()]
    expect(selectFilteredLicenses(licenses)).toEqual(licenses)
  })

  it('selects expiring licenses within a threshold', () => {
    const now = new Date('2024-01-01T00:00:00Z')
    const withinWindow = buildLicense({ expiresAt: new Date('2024-01-05T00:00:00Z') })
    const outsideWindow = buildLicense({ expiresAt: new Date('2024-03-01T00:00:00Z') })
    const invalidExpiry = buildLicense({ expiresAt: 'invalid-date' })
    const missingExpiry = buildLicense({ expiresAt: null })
    const expired = buildLicense({ expiresAt: new Date('2023-12-01T00:00:00Z') })

    const result = selectExpiringLicenses([withinWindow, outsideWindow, invalidExpiry, missingExpiry, expired], {
      withinDays: 10,
      now,
    })

    expect(result).toEqual([withinWindow])
  })

  it('filters licenses belonging to a product', () => {
    const productId = 'product-789'
    const matching = buildLicense({ productId })
    const other = buildLicense()

    expect(selectLicensesForProduct([matching, other], productId)).toEqual([matching])
    expect(selectLicensesForProduct([matching], '')).toEqual([])
  })

  it('filters products by activity state', () => {
    const activeProduct = buildProduct({ isActive: true })
    const inactiveProduct = buildProduct({ isActive: false })

    expect(selectProductsByActivity([activeProduct, inactiveProduct], true)).toEqual([activeProduct])
    expect(selectProductsByActivity([activeProduct, inactiveProduct], false)).toEqual([inactiveProduct])
  })

  it('filters tiers for a product and respects active flag', () => {
    const productId = 'product-456'
    const activeTier = buildProductTier({ productId, isActive: true })
    const inactiveTier = buildProductTier({ productId, isActive: false })
    const otherProductTier = buildProductTier()

    expect(
      selectProductTiersByProduct([activeTier, inactiveTier, otherProductTier], productId),
    ).toEqual([activeTier])

    expect(
      selectProductTiersByProduct(
        [activeTier, inactiveTier, otherProductTier],
        productId,
        { onlyActive: false },
      ),
    ).toEqual([activeTier, inactiveTier])
  })

  it('returns an empty array when product id is missing for tier selection', () => {
    const tier = buildProductTier()
    expect(selectProductTiersByProduct([tier], '')).toEqual([])
  })

  it('returns all licenses when no filters are provided', () => {
    const licenses = [buildLicense(), buildLicense()]
    expect(selectFilteredLicenses(licenses, {})).toEqual(licenses)
  })
})


