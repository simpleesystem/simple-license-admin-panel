import { faker } from '@faker-js/faker'
import type { ProductTier } from '@simple-license/react-sdk'

export const buildProductTier = (overrides?: Partial<ProductTier>): ProductTier => ({
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

