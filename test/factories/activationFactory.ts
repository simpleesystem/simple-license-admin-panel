import { faker } from '@faker-js/faker'
import type { LicenseActivation } from '@/simpleLicense'

const ACTIVATION_STATUSES: LicenseActivation['status'][] = ['ACTIVE', 'SUSPENDED', 'REVOKED']

export const buildActivation = (overrides?: Partial<LicenseActivation>): LicenseActivation => ({
  id: faker.string.uuid(),
  licenseKey: faker.string.alphanumeric({ length: 24 }),
  domain: faker.internet.domainName(),
  siteName: faker.company.name(),
  status: faker.helpers.arrayElement(ACTIVATION_STATUSES),
  activatedAt: faker.date.past().toISOString(),
  lastSeenAt: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.5 }),
  lastCheckedAt: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.3 }),
  ipAddress: faker.internet.ipv4(),
  region: faker.location.countryCode(),
  clientVersion: faker.system.semver(),
  vendorId: faker.string.uuid(),
  ...overrides,
})

