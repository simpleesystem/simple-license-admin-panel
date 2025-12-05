import { faker } from '@faker-js/faker'

import { buildActivation } from '../factories/activationFactory'
import { buildEntitlement } from '../factories/entitlementFactory'
import { buildLicense } from '../factories/licenseFactory'
import { buildProduct } from '../factories/productFactory'
import { buildProductTier } from '../factories/productTierFactory'

export type VendorScopedIds = {
  vendorId: string
}

export const buildProductChain = (overrides?: Partial<VendorScopedIds>) => {
  const vendorId = overrides?.vendorId ?? faker.string.uuid()
  const product = buildProduct({ vendorId })
  const tier = buildProductTier({ vendorId, productId: product.id })
  const entitlement = buildEntitlement({ vendorId, productId: product.id })
  const license = buildLicense({ vendorId })
  const activation = buildActivation({ vendorId, licenseId: license.id, licenseKey: license.licenseKey })

  return { vendorId, product, tier, entitlement, license, activation }
}

export const buildCrossVendorChains = (count: number) => {
  return Array.from({ length: count }).map(() => buildProductChain())
}

