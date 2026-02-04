/**
 * API Request and Response Types
 */

import type {
  Entitlement,
  License,
  LicenseActivation,
  LicenseStatus,
  Product,
  ProductTier,
  Tenant,
  User,
} from './license'

// Validation error structure
export interface ValidationError {
  path: string | number | Array<string | number>
  message: string
  type?: string
  context?: Record<string, string | number | boolean>
}

// Error Details - structured error information from API
export interface ErrorDetails {
  field?: string
  resourceType?: string
  validationErrors?: ValidationError[]
  code?: string
  status?: number
  statusText?: string
  [key: string]: string | number | boolean | ValidationError[] | Record<string, string | number | boolean> | undefined
}

// API Error Object
export interface ApiError {
  code: string
  message: string
  details?: ErrorDetails
}

// Base API Response - T defaults to empty object for type safety
export interface ApiResponse<T = Record<string, never>> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    timestamp?: string
    requestId?: string
    version?: string
  }
}

// Pagination
export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Public API Request Bodies
export interface ActivateLicenseRequest {
  license_key: string
  domain: string
  site_name?: string
  os?: string
  region?: string
  client_version?: string
  device_hash?: string
}

export interface ValidateLicenseRequest {
  license_key: string
  domain: string
}

export interface DeactivateLicenseRequest {
  license_key: string
  domain: string
}

export interface ReportUsageRequest {
  license_key: string
  domain: string
  month: string
  conversations_count?: number
  voice_count?: number
  text_count?: number
  consents_captured?: number
  compliance_violations?: number
}

export interface CheckUpdateRequest {
  license_key: string
  domain: string
  slug: string
  current_version: string
}

export interface LoginRequest {
  username: string
  password: string
}

// Public API Responses
export interface ActivateLicenseResponse {
  license: License
  activation: LicenseActivation
}

export interface ValidateLicenseResponse {
  license: License
  activation?: LicenseActivation
}

export interface DeactivateLicenseResponse {
  success: boolean
  message?: string
}

export interface ReportUsageResponse {
  success: boolean
  message?: string
}

export interface LicenseDataResponse {
  license: License
}

// Feature value can be string, number, boolean, or null
export type FeatureValue = string | number | boolean | null

export interface LicenseFeaturesResponse {
  features: Record<string, FeatureValue>
  tier: ProductTier
}

export interface CheckUpdateResponse {
  update?: {
    version: string
    download_url: string
    changelog: string
    file_sha256: string | null
    size_bytes: number | null
    min_wp: string | null
    tested_wp: string | null
  }
  latest_version?: string
  update_available: boolean
}

export interface LoginResponseData {
  token: string
  token_type?: string
  tokenType?: string
  expires_in?: number
  expiresIn?: number
  must_change_password?: boolean
  mustChangePassword?: boolean
  user: User
}

export interface LoginResponse {
  token: string
  token_type?: string
  tokenType?: string
  expires_in?: number
  expiresIn?: number
  must_change_password?: boolean
  mustChangePassword?: boolean
  user: User
}

export interface ChangePasswordRequest {
  current_password?: string
  new_password?: string
  email?: string
}

export interface ChangePasswordResponse {
  success: boolean
  token: string
  user: User
}

export interface GetCurrentUserResponse {
  user: User
}

// Admin API Request Bodies
export interface CreateLicenseRequest {
  customer_email: string
  product_slug: string
  tier_code: string
  domain?: string
  activation_limit?: number
  expires_days?: number
  metadata?: Record<string, string | number | boolean | null>
}

export interface UpdateLicenseRequest {
  customer_email?: string
  tier_code?: string
  domain?: string
  activation_limit?: number
  expires_days?: number
  metadata?: Record<string, string | number | boolean | null>
}

export interface ListLicensesRequest extends PaginationOptions {
  status?: LicenseStatus
  product_slug?: string
  customer_email?: string
}

export interface CreateProductRequest {
  name: string
  slug: string
  description?: string
  vendor_id?: string
  is_active?: boolean
  default_license_term_days?: number | null
  default_max_activations?: number | null
  metadata?: Record<string, string | number | boolean | null>
}

export interface UpdateProductRequest {
  name?: string
  slug?: string
  description?: string
  vendor_id?: string
  is_active?: boolean
  default_license_term_days?: number | null
  default_max_activations?: number | null
  metadata?: Record<string, string | number | boolean | null>
}

export interface CreateProductTierRequest {
  tier_name: string
  tier_code: string
  description?: string
  is_active?: boolean
  max_activations?: number | null
  does_not_expire?: boolean
  license_term_days?: number | null
  metadata?: Record<string, string | number | boolean | null>
}

export interface UpdateProductTierRequest {
  tier_name?: string
  tier_code?: string
  description?: string
  is_active?: boolean
  max_activations?: number | null
  does_not_expire?: boolean
  license_term_days?: number | null
  metadata?: Record<string, string | number | boolean | null>
}

export interface CreateEntitlementRequest {
  key: string
  description?: string
  number_value?: number
  boolean_value?: boolean
  string_value?: string
  tier_ids: string[]
  metadata?: Record<string, string | number | boolean | null>
}

export interface UpdateEntitlementRequest {
  key?: string
  description?: string
  number_value?: number
  boolean_value?: boolean
  string_value?: string
  tier_ids?: string[]
  metadata?: Record<string, string | number | boolean | null>
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role?: string
  vendor_id?: string | null
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  role?: string
  vendor_id?: string | null
}

export interface CreateTenantRequest {
  name: string
  status?: string
  suspensionReason?: string
}

export interface UpdateTenantRequest {
  name?: string
}

export interface UpdateQuotaLimitsRequest {
  max_products?: number | null
  max_products_soft?: number | null
  max_activations_per_product?: number | null
  max_activations_per_product_soft?: number | null
  max_activations_total?: number | null
  max_activations_total_soft?: number | null
  quota_warning_threshold?: number | null
}

export interface FreezeLicenseRequest {
  freeze_entitlements?: boolean
  freeze_tier?: boolean
}

// Admin API Responses
export type ListLicensesResponse = PaginatedResponse<License>

export interface GetLicenseResponse {
  license: License
  activations?: LicenseActivation[]
}

export interface CreateLicenseResponse {
  license: License
}

export interface UpdateLicenseResponse {
  license: License
}

export interface GetLicenseActivationsResponse {
  activations: LicenseActivation[]
}

export type ListProductsResponse = PaginatedResponse<Product>

export interface GetProductResponse {
  product: Product
  tiers?: ProductTier[]
  entitlements?: Entitlement[]
}

export interface CreateProductResponse {
  product: Product
}

export interface UpdateProductResponse {
  product: Product
}

export type ListProductTiersResponse = PaginatedResponse<ProductTier>

export interface GetProductTierResponse {
  tier: ProductTier
}

export interface CreateProductTierResponse {
  tier: ProductTier
}

export interface UpdateProductTierResponse {
  tier: ProductTier
}

export type ListEntitlementsResponse = PaginatedResponse<Entitlement>

export interface GetEntitlementResponse {
  entitlement: Entitlement
}

export interface CreateEntitlementResponse {
  entitlement: Entitlement
}

export interface UpdateEntitlementResponse {
  entitlement: Entitlement
}

export interface ListUsersRequest extends PaginationOptions {
  role?: string
  vendor_id?: string
  search?: string
}

export type ListUsersResponse = PaginatedResponse<User>

export interface GetUserResponse {
  user: User
}

export interface CreateUserResponse {
  user: User
}

export interface UpdateUserResponse {
  user: User
}

export interface GetCurrentUserResponse {
  user: User
}

export type ListTenantsResponse = PaginatedResponse<Tenant>

export interface GetTenantResponse {
  tenant: Tenant
}

export interface CreateTenantResponse {
  tenant: Tenant
}

export interface UpdateTenantResponse {
  tenant: Tenant
}

export interface GetQuotaUsageResponse {
  usage: {
    products_count: number
    activations_count: number
    max_products?: number | null
    max_activations_per_product?: number | null
    max_activations_total?: number | null
  }
}

export interface GetQuotaConfigResponse {
  config: {
    max_products?: number | null
    max_products_soft?: number | null
    max_activations_per_product?: number | null
    max_activations_per_product_soft?: number | null
    max_activations_total?: number | null
    max_activations_total_soft?: number | null
    quota_warning_threshold?: number | null
  }
}

export interface SystemStatsResponse {
  stats: {
    active_licenses: number
    expired_licenses: number
    total_customers: number
    total_activations: number
  }
}

export interface ServerStatusResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  checks?: {
    database?: string
  }
}

export interface HealthMetricsResponse {
  metrics: {
    uptime: number
    memory: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
    cpu: {
      user: number
      system: number
    }
  }
}

export interface UsageSummaryResponse {
  summaries: Array<{
    id: number
    tenantId: number | null
    licenseId: number | null
    periodStart: string
    periodEnd: string
    totalActivations: number
    totalValidations: number
    totalUsageReports: number
    uniqueDomains: number
    uniqueIPs: number
    peakConcurrency: number
    createdAt: string
    updatedAt: string
  }>
}

export interface UsageTrendsResponse {
  periodStart: string
  periodEnd: string
  groupBy: string
  trends: Array<{
    period: string
    totalActivations: number
    totalValidations: number
    totalUsageReports: number
    uniqueDomains: number
    uniqueIPs: number
    peakConcurrency: number
  }>
}

export interface UpdateAlertThresholdsRequest {
  high_activations?: number
  high_validations?: number
  high_concurrency?: number
  medium_activations?: number
  medium_validations?: number
  medium_concurrency?: number
}

// Action response types (suspend, resume, delete, etc.)
export interface ActionSuccessResponse {
  success: boolean
  message?: string
}

// OpenAPI Specification response
export interface OpenAPISpecResponse {
  openapi: string
  info: {
    title: string
    description?: string
    version: string
    contact?: {
      name?: string
      email?: string
    }
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  components?: {
    schemas?: Record<string, Record<string, string | number | boolean | null | Array<string | number | boolean | null>>>
  }
  tags?: Array<{
    name: string
    description?: string
  }>
  paths?: Record<
    string,
    Record<string, Record<string, string | number | boolean | null | Array<string | number | boolean | null>>>
  >
}

// License Usage Details response
export interface LicenseUsageDetailsResponse {
  licenseKey: string
  licenseId: number
  summaries: Array<{
    id: number
    periodStart: string
    periodEnd: string
    totalActivations: number
    totalValidations: number
    totalUsageReports: number
    uniqueDomains: number
    uniqueIPs: number
    peakConcurrency: number
    createdAt: string
    updatedAt: string
  }>
}

// Activation Distribution response
export interface ActivationDistributionResponse {
  distribution: Array<{
    licenseKey: string
    activations: number
    validations: number
  }>
}

export interface AuditLogEntry {
  id: string
  adminId: string | null
  adminUsername: string | null
  vendorId: string | null
  action: string
  resourceType: string
  resourceId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  accessMethod: string
  unixUser: string | null
  createdAt: string
}

export interface GetAuditLogsResponse {
  logs: AuditLogEntry[]
  total: number
}

export interface AuditLogFilters {
  adminId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  limit?: number
  offset?: number
}

export interface AuditVerificationResponse {
  valid: boolean
  totalEntries: number
  verifiedEntries: number
  brokenLinks: Array<{ id: string; expectedHash: string; actualHash: string | null }>
}

export interface AuditVerificationParams {
  fromId?: string
  toId?: string
}

// Top Licenses response
export interface TopLicensesResponse {
  licenses: Array<{
    licenseKey: string
    customerEmail: string
    totalActivations: number
    totalValidations: number
    peakConcurrency: number
    lastActivatedAt: string
  }>
}

// Alert Thresholds response - matches actual API structure
export interface AlertThresholdsResponse {
  high: {
    activations: number
    validations: number
    concurrency: number
  }
  medium: {
    activations: number
    validations: number
    concurrency: number
  }
}

// Tenant Backup response
export interface CreateTenantBackupResponse {
  backup: {
    id: string
    backupName: string
    backupType: string
    tenantId?: string | null
    createdAt: string
    metadata?: Record<string, string | number | boolean | null>
  }
}

// Metrics response - metrics can be dynamic but should be typed values
export type MetricValue = string | number | boolean | null | Array<string | number | boolean>
export type MetricObject = Record<string, MetricValue>

// Base metrics structure without index signature to avoid conflicts
export interface MetricsResponseBase {
  timestamp: string
  application: MetricObject & {
    version?: string
    environment?: string
  }
  system: {
    uptime: number
    memory: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
    cpu: {
      user: number
      system: number
    }
  }
  database?: MetricObject
  cache?: MetricObject
  security?: MetricObject
  tenants?: MetricObject
}

// Full metrics response with index signature for dynamic properties
export type MetricsResponse = MetricsResponseBase & {
  [key: string]: MetricValue | MetricObject | undefined
}

// Freeze License response
export interface FreezeLicenseResponse {
  success: boolean
  message?: string
  data?: {
    freezeEntitlements?: boolean
    freezeTier?: boolean
  }
}

// Plugin release (admin releases for product)
export interface PluginRelease {
  id: string
  slug: string
  version: string
  fileName: string
  sizeBytes: number
  changelogMd?: string | null
  requiredTier?: string | null
  minWpVersion?: string | null
  testedWpVersion?: string | null
  isPrerelease: boolean
  createdAt: string
  updatedAt: string
}

export type ListReleasesResponse = PluginRelease[]

/** Response from createRelease; API returns { success, data: PluginRelease } */
export type CreateReleaseResponse = PluginRelease
