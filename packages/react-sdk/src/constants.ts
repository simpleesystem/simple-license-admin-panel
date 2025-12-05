/**
 * Constants for React SDK
 * All values MUST come from constants - zero hardcoded values allowed
 */

// HTTP Status Codes
export const HTTP_OK = 200
export const HTTP_CREATED = 201
export const HTTP_NO_CONTENT = 204
export const HTTP_BAD_REQUEST = 400
export const HTTP_UNAUTHORIZED = 401
export const HTTP_FORBIDDEN = 403
export const HTTP_NOT_FOUND = 404
export const HTTP_CONFLICT = 409
export const HTTP_LOCKED = 423
export const HTTP_TOO_MANY_REQUESTS = 429
export const HTTP_INTERNAL_SERVER_ERROR = 500
export const HTTP_NOT_IMPLEMENTED = 501
export const HTTP_BAD_GATEWAY = 502
export const HTTP_SERVICE_UNAVAILABLE = 503

// API Base Paths
export const API_BASE_PATH = '/api/v1'
export const API_ADMIN_BASE_PATH = '/api/v1/admin'

// Public License Endpoints
export const API_ENDPOINT_LICENSES_ACTIVATE = '/api/v1/licenses/activate'
export const API_ENDPOINT_LICENSES_VALIDATE = '/api/v1/licenses/validate'
export const API_ENDPOINT_LICENSES_DEACTIVATE = '/api/v1/licenses/deactivate'
export const API_ENDPOINT_LICENSES_GET = '/api/v1/licenses'
export const API_ENDPOINT_LICENSES_FEATURES = '/api/v1/licenses'
export const API_ENDPOINT_LICENSES_USAGE = '/api/v1/licenses/usage'

// Update Endpoints
export const API_ENDPOINT_UPDATES_CHECK = '/api/v1/updates/check'

// Authentication Endpoints
export const API_ENDPOINT_AUTH_LOGIN = '/api/v1/auth/login'

// Admin License Endpoints
export const API_ENDPOINT_ADMIN_LICENSES_LIST = '/api/v1/admin/licenses'
export const API_ENDPOINT_ADMIN_LICENSES_CREATE = '/api/v1/admin/licenses/create'
export const API_ENDPOINT_ADMIN_LICENSES_GET = '/api/v1/admin/licenses'
export const API_ENDPOINT_ADMIN_LICENSES_UPDATE = '/api/v1/admin/licenses'
export const API_ENDPOINT_ADMIN_LICENSES_SUSPEND = '/api/v1/admin/licenses'
export const API_ENDPOINT_ADMIN_LICENSES_RESUME = '/api/v1/admin/licenses'
export const API_ENDPOINT_ADMIN_LICENSES_FREEZE = '/api/v1/admin/licenses'
export const API_ENDPOINT_ADMIN_LICENSES_REVOKE = '/api/v1/admin/licenses'
export const API_ENDPOINT_ADMIN_LICENSES_ACTIVATIONS = '/api/v1/admin/licenses'

// Admin Product Endpoints
export const API_ENDPOINT_ADMIN_PRODUCTS_LIST = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_PRODUCTS_CREATE = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_PRODUCTS_GET = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_PRODUCTS_UPDATE = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_PRODUCTS_DELETE = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_PRODUCTS_SUSPEND = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_PRODUCTS_RESUME = '/api/v1/admin/products'

// Admin Product Tier Endpoints
export const API_ENDPOINT_ADMIN_PRODUCT_TIERS_LIST = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_PRODUCT_TIERS_CREATE = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_PRODUCT_TIERS_GET = '/api/v1/admin/product-tiers'
export const API_ENDPOINT_ADMIN_PRODUCT_TIERS_UPDATE = '/api/v1/admin/product-tiers'
export const API_ENDPOINT_ADMIN_PRODUCT_TIERS_DELETE = '/api/v1/admin/product-tiers'

// Admin Entitlement Endpoints
export const API_ENDPOINT_ADMIN_ENTITLEMENTS_LIST = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_ENTITLEMENTS_CREATE = '/api/v1/admin/products'
export const API_ENDPOINT_ADMIN_ENTITLEMENTS_GET = '/api/v1/admin/entitlements'
export const API_ENDPOINT_ADMIN_ENTITLEMENTS_UPDATE = '/api/v1/admin/entitlements'
export const API_ENDPOINT_ADMIN_ENTITLEMENTS_DELETE = '/api/v1/admin/entitlements'

// Admin User Endpoints
export const API_ENDPOINT_ADMIN_USERS_LIST = '/api/v1/admin/users'
export const API_ENDPOINT_ADMIN_USERS_CREATE = '/api/v1/admin/users'
export const API_ENDPOINT_ADMIN_USERS_GET = '/api/v1/admin/users'
export const API_ENDPOINT_ADMIN_USERS_UPDATE = '/api/v1/admin/users'
export const API_ENDPOINT_ADMIN_USERS_DELETE = '/api/v1/admin/users'
export const API_ENDPOINT_ADMIN_USERS_ME = '/api/v1/admin/users/me'
export const API_ENDPOINT_ADMIN_USERS_ME_PASSWORD = '/api/v1/admin/users/me/password'

// Admin Analytics Endpoints
export const API_ENDPOINT_ADMIN_ANALYTICS_USAGE = '/api/v1/admin/analytics/usage'
export const API_ENDPOINT_ADMIN_ANALYTICS_LICENSE = '/api/v1/admin/analytics/license'
export const API_ENDPOINT_ADMIN_ANALYTICS_TRENDS = '/api/v1/admin/analytics/trends'
export const API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION = '/api/v1/admin/analytics/distribution'
export const API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES = '/api/v1/admin/analytics/top-licenses'
export const API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS = '/api/v1/admin/analytics/thresholds'

// Admin Tenant Endpoints
export const API_ENDPOINT_ADMIN_TENANTS_LIST = '/api/v1/admin/tenants'
export const API_ENDPOINT_ADMIN_TENANTS_CREATE = '/api/v1/admin/tenants'
export const API_ENDPOINT_ADMIN_TENANTS_UPDATE = '/api/v1/admin/tenants'
export const API_ENDPOINT_ADMIN_TENANTS_SUSPEND = '/api/v1/admin/tenants'
export const API_ENDPOINT_ADMIN_TENANTS_RESUME = '/api/v1/admin/tenants'
export const API_ENDPOINT_ADMIN_TENANTS_QUOTA_USAGE_PATH = '/quota/usage'
export const API_ENDPOINT_ADMIN_TENANTS_QUOTA_CONFIG_PATH = '/quota/config'
export const API_ENDPOINT_ADMIN_TENANTS_QUOTA_LIMITS_PATH = '/quota/limits'
export const API_ENDPOINT_ADMIN_TENANTS_BACKUP_PATH = '/backup'

// Admin System Endpoints
export const API_ENDPOINT_ADMIN_STATS = '/api/v1/admin/stats'
export const API_ENDPOINT_ADMIN_STATUS = '/api/v1/admin/status'
export const API_ENDPOINT_ADMIN_HEALTH = '/api/v1/admin/health'
export const API_ENDPOINT_ADMIN_METRICS = '/api/v1/admin/metrics'
export const API_ENDPOINT_ADMIN_AUDIT_LOGS = '/api/v1/admin/audit/logs'
export const API_ENDPOINT_ADMIN_AUDIT_VERIFY = '/api/v1/admin/audit/verify'

// License Status Values
export const LICENSE_STATUS_ACTIVE = 'ACTIVE'
export const LICENSE_STATUS_INACTIVE = 'INACTIVE'
export const LICENSE_STATUS_EXPIRED = 'EXPIRED'
export const LICENSE_STATUS_REVOKED = 'REVOKED'
export const LICENSE_STATUS_SUSPENDED = 'SUSPENDED'

// Activation Status Values
export const ACTIVATION_STATUS_ACTIVE = 'ACTIVE'
export const ACTIVATION_STATUS_INACTIVE = 'INACTIVE'
export const ACTIVATION_STATUS_SUSPENDED = 'SUSPENDED'

// Tenant Status Values
export const TENANT_STATUS_ACTIVE = 'ACTIVE'
export const TENANT_STATUS_SUSPENDED = 'SUSPENDED'

// Error Codes
export const ERROR_CODE_INVALID_FORMAT = 'INVALID_FORMAT'
export const ERROR_CODE_INVALID_LICENSE_FORMAT = 'INVALID_LICENSE_FORMAT'
export const ERROR_CODE_LICENSE_NOT_FOUND = 'LICENSE_NOT_FOUND'
export const ERROR_CODE_LICENSE_INACTIVE = 'LICENSE_INACTIVE'
export const ERROR_CODE_LICENSE_EXPIRED = 'LICENSE_EXPIRED'
export const ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED = 'ACTIVATION_LIMIT_EXCEEDED'
export const ERROR_CODE_NOT_ACTIVATED_ON_DOMAIN = 'NOT_ACTIVATED_ON_DOMAIN'
export const ERROR_CODE_DEMO_MODE_MISMATCH = 'DEMO_MODE_MISMATCH'
export const ERROR_CODE_VALIDATION_ERROR = 'VALIDATION_ERROR'
export const ERROR_CODE_BODY_VALIDATION_ERROR = 'BODY_VALIDATION_ERROR'
export const ERROR_CODE_INVALID_CREDENTIALS = 'INVALID_CREDENTIALS'
export const ERROR_CODE_MUST_CHANGE_PASSWORD = 'MUST_CHANGE_PASSWORD'
export const ERROR_CODE_MISSING_TOKEN = 'MISSING_TOKEN'
export const ERROR_CODE_INVALID_TOKEN = 'INVALID_TOKEN'
export const ERROR_CODE_UNAUTHORIZED = 'UNAUTHORIZED'
export const ERROR_CODE_ENTITLEMENTS_FROZEN = 'ENTITLEMENTS_FROZEN'
export const ERROR_CODE_TIER_FROZEN = 'TIER_FROZEN'
export const ERROR_CODE_LICENSE_SUSPENDED = 'LICENSE_SUSPENDED'
export const ERROR_CODE_PRODUCT_SUSPENDED = 'PRODUCT_SUSPENDED'
export const ERROR_CODE_ACCOUNT_LOCKED = 'ACCOUNT_LOCKED'
export const ERROR_CODE_TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS'
export const ERROR_CODE_AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
export const ERROR_CODE_VENDOR_SCOPING_VIOLATION = 'VENDOR_SCOPING_VIOLATION'
export const ERROR_CODE_MISSING_VENDOR_ID = 'MISSING_VENDOR_ID'
export const ERROR_CODE_NETWORK_ERROR = 'NETWORK_ERROR'

// HTTP Headers
export const HEADER_AUTHORIZATION = 'Authorization'
export const HEADER_CONTENT_TYPE = 'Content-Type'
export const HEADER_ACCEPT = 'Accept'
export const HEADER_BEARER_PREFIX = 'Bearer '

// Content Types
export const CONTENT_TYPE_JSON = 'application/json'

// Default Configuration Values
export const DEFAULT_TIMEOUT_SECONDS = 30
export const DEFAULT_CONNECT_TIMEOUT_SECONDS = 10
export const DEFAULT_RETRY_ATTEMPTS = 3
export const DEFAULT_RETRY_DELAY_MS = 1000

// Validation Limits
export const VALIDATION_DOMAIN_MAX_LENGTH = 255
export const VALIDATION_EMAIL_MAX_LENGTH = 255
export const VALIDATION_SITE_NAME_MAX_LENGTH = 255
export const VALIDATION_VERSION_MAX_LENGTH = 50
export const VALIDATION_SLUG_MAX_LENGTH = 100
export const VALIDATION_ACTIVATION_LIMIT_MAX = 1000
export const VALIDATION_EXPIRES_DAYS_MAX = 36500

// License Key Pattern (Ed25519 format: payload.signature)
export const LICENSE_KEY_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
export const LICENSE_KEY_LENGTH = 1000

// Response Keys
export const RESPONSE_KEY_SUCCESS = 'success'
export const RESPONSE_KEY_DATA = 'data'
export const RESPONSE_KEY_ERROR = 'error'
export const RESPONSE_KEY_CODE = 'code'
export const RESPONSE_KEY_MESSAGE = 'message'
export const RESPONSE_KEY_TOKEN = 'token'
export const RESPONSE_KEY_TOKEN_TYPE = 'token_type'
export const RESPONSE_KEY_EXPIRES_IN = 'expires_in'
export const RESPONSE_KEY_UPDATE = 'update'

// JWT Payload Keys
export const JWT_PAYLOAD_KEY_VENDOR_ID = 'vendorId'
export const JWT_PAYLOAD_KEY_ROLE = 'role'

// Vendor Scoped Roles
export const VENDOR_SCOPED_ROLE_VIEWER = 'VIEWER'
export const VENDOR_SCOPED_ROLE_VENDOR_ADMIN = 'VENDOR_ADMIN'
export const VENDOR_SCOPED_ROLE_VENDOR_MANAGER = 'VENDOR_MANAGER'
