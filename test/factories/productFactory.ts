import { faker } from '@faker-js/faker'
import type { Product } from '@/simpleLicense'

const PRODUCT_STATUS_ACTIVE = true as const

export const buildProduct = (overrides?: Partial<Product>): Product => ({
  id: faker.string.uuid(),
  slug: faker.string.alphanumeric({ length: 8 }).toLowerCase(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  vendorId: faker.string.uuid(),
  isActive: PRODUCT_STATUS_ACTIVE,
  suspendedAt: null,
  suspensionReason: null,
  defaultLicenseTermDays: faker.number.int({ min: 1, max: 365 }),
  defaultMaxActivations: faker.number.int({ min: 1, max: 10 }),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
})
