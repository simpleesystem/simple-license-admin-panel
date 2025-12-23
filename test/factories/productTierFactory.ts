import { faker } from '@faker-js/faker'
import type { ProductTier } from '@/simpleLicense'

export type TestProductTier = ProductTier & { vendorId?: string | null }

export const buildProductTier = (overrides?: Partial<TestProductTier>): TestProductTier => ({
  id: faker.string.uuid(),
  tierName: faker.commerce.productAdjective(),
  tierCode: faker.string.alphanumeric({ length: 6 }).toUpperCase(),
  description: faker.commerce.productDescription(),
  vendorId: faker.string.uuid(),
  metadata: {},
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
})
