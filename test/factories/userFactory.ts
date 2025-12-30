import { faker } from '@faker-js/faker'
import type { User } from '@/simpleLicense'

const FACTORY_DEFAULT_ADMIN_ROLE = 'ADMIN' as const

export const buildUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  username: faker.internet.username(),
  email: faker.internet.email(),
  role: FACTORY_DEFAULT_ADMIN_ROLE,
  vendorId: faker.string.uuid(),
  passwordResetRequired: false,
  lastLoginAt: faker.date.recent().toISOString(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
})
