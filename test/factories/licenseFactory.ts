import { faker } from '@faker-js/faker'
import type { License, LicenseStatus, Product, ProductTier } from '@simple-license/react-sdk'

const randomStatus = (): LicenseStatus =>
  faker.helpers.arrayElement<LicenseStatus>(['ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED', 'INACTIVE'])

export const buildLicense = (overrides: Partial<License> = {}): License => ({
  id: faker.string.uuid(),
  licenseKey: faker.string.alphanumeric({ casing: 'upper', length: 12 }),
  customerId: faker.string.uuid(),
  customerEmail: faker.internet.email().toLowerCase(),
  tierCode: faker.helpers.arrayElement(['FREE', 'STARTER', 'PROFESSIONAL']),
  status: randomStatus(),
  domain: faker.internet.domainName().toLowerCase(),
  activationLimit: faker.number.int({ min: 1, max: 10 }),
  activationCount: faker.number.int({ min: 0, max: 10 }),
  expiresAt: faker.date.soon({ days: 45 }),
  createdAt: faker.date.past(),
  productId: faker.string.uuid(),
  productSlug: faker.lorem.slug(),
  vendorId: faker.string.uuid(),
  ...overrides,
})

export const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: faker.string.uuid(),
  slug: faker.lorem.slug(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  vendorId: faker.string.uuid(),
  isActive: faker.datatype.boolean(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const buildProductTier = (overrides: Partial<ProductTier> = {}): ProductTier => ({
  id: faker.string.uuid(),
  productId: faker.string.uuid(),
  tierCode: faker.helpers.arrayElement(['FREE', 'STARTER', 'PROFESSIONAL']),
  tierName: faker.commerce.productAdjective(),
  description: faker.commerce.productDescription(),
  isActive: faker.datatype.boolean(),
  maxActivations: faker.number.int({ min: 1, max: 100 }),
  doesNotExpire: faker.datatype.boolean(),
  licenseTermDays: faker.number.int({ min: 7, max: 365 }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})


