/**
 * License Factory
 * Uses Faker for test data generation - zero hardcoded values
 */

import { faker } from '@faker-js/faker'
import type { License, LicenseStatus } from '@/types/license'
import {
  TEST_BOOLEAN_FALSE,
  TEST_DATE_CREATED,
  TEST_DATE_EXPIRES,
  TEST_LICENSE_STATUS_ACTIVE,
  TEST_NUMBER_ZERO,
  TEST_TIER_CODE_PROFESSIONAL,
} from '../constants'

export interface LicenseFactoryOptions {
  id?: string
  licenseKey?: string
  customerEmail?: string
  customerId?: string
  tierCode?: string
  status?: LicenseStatus
  domain?: string
  activationLimit?: number
  activationCount?: number
  demoMode?: boolean
  expiresAt?: Date | string | null
  createdAt?: Date | string
  suspendedAt?: Date | string | null
  suspensionReason?: string | null
  metadata?: Record<string, string | number | boolean | null>
  effectiveEntitlements?: Record<string, string | number | boolean | null>
  entitlementsFrozen?: boolean
  tierFrozen?: boolean
  productId?: string
  productSlug?: string
}

export function createLicense(options: LicenseFactoryOptions = {}): License {
  const expiresAt = options.expiresAt ?? TEST_DATE_EXPIRES
  const createdAt = options.createdAt ?? TEST_DATE_CREATED

  return {
    id: options.id ?? faker.string.uuid(),
    licenseKey: options.licenseKey ?? faker.string.alphanumeric(29).toUpperCase(),
    customerEmail: options.customerEmail ?? faker.internet.email(),
    customerId: options.customerId ?? faker.string.uuid(),
    tierCode: options.tierCode ?? TEST_TIER_CODE_PROFESSIONAL,
    status: options.status ?? TEST_LICENSE_STATUS_ACTIVE,
    domain: options.domain ?? faker.internet.domainName(),
    activationLimit: options.activationLimit ?? faker.number.int({ min: 1, max: 10 }),
    activationCount: options.activationCount ?? TEST_NUMBER_ZERO,
    demoMode: options.demoMode ?? TEST_BOOLEAN_FALSE,
    expiresAt: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
    suspendedAt: options.suspendedAt ?? null,
    suspensionReason: options.suspensionReason ?? null,
    activatedAt: null,
    lastRenewedAt: null,
    lastCheckedAt: null,
    attributesComputedAt: null,
    metadata: options.metadata,
    effectiveEntitlements: options.effectiveEntitlements,
    entitlementsFrozen: options.entitlementsFrozen ?? TEST_BOOLEAN_FALSE,
    tierFrozen: options.tierFrozen ?? TEST_BOOLEAN_FALSE,
    entitlementsFrozenAt: null,
    tierFrozenAt: null,
    productId: options.productId,
    productSlug: options.productSlug,
  }
}

export function createLicenseList(count: number, options: LicenseFactoryOptions = {}): License[] {
  return Array.from({ length: count }, () => createLicense(options))
}
