import { faker } from '@faker-js/faker'
import type { Entitlement } from '@simple-license/react-sdk'

const ENTITLEMENT_VALUE_TYPES: Entitlement['value_type'][] = ['string', 'number', 'boolean']

export const buildEntitlement = (overrides?: Partial<Entitlement>): Entitlement => {
  const valueType = faker.helpers.arrayElement(ENTITLEMENT_VALUE_TYPES)
  const defaultValue =
    valueType === 'number' ? faker.number.int({ min: 1, max: 100 }) : valueType === 'boolean' ? faker.datatype.boolean() : faker.word.sample()

  return {
    id: faker.string.uuid(),
    key: faker.helpers.slugify(faker.word.words(2)).toUpperCase(),
    value_type: valueType,
    default_value: defaultValue,
    usage_limit: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 100 }), { probability: 0.4 }),
    vendorId: faker.string.uuid(),
    metadata: {},
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  }
}

