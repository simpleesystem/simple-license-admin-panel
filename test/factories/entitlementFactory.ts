import { faker } from '@faker-js/faker'
import type { ProductEntitlementSummary } from '../../src/ui/workflows/ProductEntitlementRowActions'

// Legacy mock wire data is intentionally distinct from current UI rows, which forbid these deprecated fields.
export type TestEntitlement = ProductEntitlementSummary & {
  productId?: string
  vendorId?: string | null
  id: string
  key: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
  valueType: 'string' | 'number' | 'boolean'
  defaultValue: string | number | boolean
  usageLimit?: number | null
}

const ENTITLEMENT_VALUE_TYPES: TestEntitlement['valueType'][] = ['string', 'number', 'boolean']

export const buildEntitlement = (overrides?: Partial<TestEntitlement>): TestEntitlement => {
  const valueType = faker.helpers.arrayElement(ENTITLEMENT_VALUE_TYPES)
  const defaultValue =
    valueType === 'number'
      ? faker.number.int({ min: 1, max: 100 })
      : valueType === 'boolean'
        ? faker.datatype.boolean()
        : faker.word.sample()

  return {
    id: faker.string.uuid(),
    key: faker.helpers.slugify(faker.word.words(2)).toUpperCase(),
    valueType,
    defaultValue,
    usageLimit: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 100 }), { probability: 0.4 }),
    vendorId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.3 }) ?? null,
    metadata: {},
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  }
}
