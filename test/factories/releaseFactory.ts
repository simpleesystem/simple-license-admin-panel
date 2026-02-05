import { faker } from '@faker-js/faker'
import type { PluginRelease } from '@/simpleLicense'

const PLUGIN_RELEASE_IS_PRERELEASE_DEFAULT = false as const

const PLUGIN_RELEASE_IS_PROMOTED_DEFAULT = false as const

export const buildRelease = (overrides?: Partial<PluginRelease>): PluginRelease => ({
  id: faker.string.uuid(),
  slug: faker.string.alphanumeric(8).toLowerCase(),
  version: faker.string.numeric(3).replace(/(\d)(\d)(\d)/, '$1.$2.$3'),
  fileName: `${faker.string.alpha(8)}.zip`,
  sizeBytes: faker.number.int({ min: 1024, max: 10_485_760 }),
  changelogMd: null,
  requiredTier: null,
  minWpVersion: null,
  testedWpVersion: null,
  isPrerelease: PLUGIN_RELEASE_IS_PRERELEASE_DEFAULT,
  isPromoted: PLUGIN_RELEASE_IS_PROMOTED_DEFAULT,
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
})
