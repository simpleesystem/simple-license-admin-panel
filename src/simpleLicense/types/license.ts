/**
 * Domain Type Definitions
 */

// Enum types
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED' | 'INACTIVE'
export type ActivationStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type TenantStatus = 'ACTIVE' | 'SUSPENDED'
export type LicenseTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'AGENCY' | 'ENTERPRISE'
export type AdminRole =
  | 'SUPERUSER'
  | 'ADMIN'
  | 'VENDOR_MANAGER'
  | 'VENDOR_ADMIN'
  | 'VIEWER'
  | 'API_READ_ONLY'
  | 'API_VENDOR_WRITE'
  | 'API_CONSUMER_ACTIVATE'

// License
export interface License {
  id: string
  licenseKey: string
  customerId?: string
  customerEmail: string
  tierCode: string
  status: LicenseStatus
  suspendedAt?: Date | string | null
  suspensionReason?: string | null
  domain?: string
  activationLimit?: number
  activationCount?: number
  demoMode?: boolean
  expiresAt?: Date | string | null
  createdAt: Date | string
  activatedAt?: Date | string | null
  lastRenewedAt?: Date | string | null
  lastCheckedAt?: Date | string | null
  attributesComputedAt?: Date | string | null
  metadata?: Record<string, string | number | boolean | null>
  effectiveEntitlements?: Record<string, string | number | boolean | null>
  entitlementsFrozen?: boolean
  tierFrozen?: boolean
  entitlementsFrozenAt?: Date | string | null
  tierFrozenAt?: Date | string | null
  productId?: string
  productSlug?: string
}

// License Activation
export interface LicenseActivation {
  id?: string
  licenseId?: string
  licenseKey: string
  domain: string
  vendorId?: string | null
  siteName?: string
  ipAddress?: string
  status: ActivationStatus
  activatedAt: Date | string
  lastSeenAt?: Date | string | null
  lastCheckedAt?: Date | string | null
  deactivatedAt?: Date | string | null
  os?: string | null
  region?: string | null
  clientVersion?: string | null
  deviceHash?: string | null
  anomalyScore?: number | null
}

// Product
export interface Product {
  id: string
  slug: string
  name: string
  description?: string
  vendorId: string
  isActive: boolean
  suspendedAt?: Date | string | null
  suspensionReason?: string | null
  defaultLicenseTermDays?: number | null
  defaultMaxActivations?: number | null
  createdAt: Date | string
  updatedAt: Date | string
}

// Product Tier
export interface ProductTier {
  id: string
  productId: string
  tierCode: string
  tierName: string
  description?: string
  isActive: boolean
  maxActivations?: number | null
  doesNotExpire: boolean
  licenseTermDays?: number | null
  createdAt: Date | string
  updatedAt: Date | string
}

// Entitlement
export interface Entitlement {
  id: string
  productId: string
  key: string
  description?: string
  numberValue?: number | null
  booleanValue?: boolean | null
  stringValue?: string | null
  tierCodes?: never // deprecated
  productTiers?: { id: string; tierCode: string }[]
  version: string
  createdAt: Date | string
  updatedAt: Date | string
}

// User
export interface User {
  id: string
  username: string
  email: string
  role?: AdminRole
  vendorId?: string | null
  passwordResetRequired?: boolean
  lastLoginAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

// Tenant
export interface Tenant {
  id: string
  name: string
  status: TenantStatus
  vendorId?: string | null
  suspendedAt?: Date | string | null
  suspensionReason?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  maxProducts?: number | null
  maxProductsSoft?: number | null
  maxActivationsPerProduct?: number | null
  maxActivationsPerProductSoft?: number | null
  maxActivationsTotal?: number | null
  maxActivationsTotalSoft?: number | null
  quotaWarningThreshold?: number | null
}
