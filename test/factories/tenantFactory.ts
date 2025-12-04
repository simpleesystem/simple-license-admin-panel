import { faker } from '@faker-js/faker'
import type { Tenant } from '@simple-license/react-sdk'

const TENANT_STATUS_ACTIVE = 'ACTIVE' as const
const TENANT_STATUS_SUSPENDED = 'SUSPENDED' as const

const DEFAULT_TENANT_STATUS = TENANT_STATUS_ACTIVE

export const buildTenant = (overrides?: Partial<Tenant>): Tenant => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  status: faker.helpers.arrayElement([DEFAULT_TENANT_STATUS, TENANT_STATUS_SUSPENDED]),
  vendorId: faker.string.uuid(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
})

