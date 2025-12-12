/**
 * Test Constants
 * All test values MUST come from constants - zero hardcoded values allowed
 */

// Test Base URLs
export const TEST_BASE_URL = 'https://api.example.com'
export const TEST_BASE_URL_WITH_SLASH = 'https://api.example.com/'

// Test License Values
export const TEST_LICENSE_KEY = 'TEST-LICENSE-KEY-12345'
export const TEST_LICENSE_KEY_ACTIVE = 'TEST-LICENSE-KEY-ACTIVE'
export const TEST_LICENSE_KEY_EXPIRED = 'TEST-LICENSE-KEY-EXPIRED'
export const TEST_LICENSE_KEY_NOT_FOUND = 'TEST-LICENSE-KEY-NOT-FOUND'
export const TEST_DOMAIN = 'example.com'
export const TEST_DOMAIN_ALT = 'example2.com'
export const TEST_CUSTOMER_EMAIL = 'customer@example.com'
export const TEST_CUSTOMER_ID = 'customer-123'

// Test License Status
export const TEST_LICENSE_STATUS_ACTIVE = 'ACTIVE' as const
export const TEST_LICENSE_STATUS_EXPIRED = 'EXPIRED' as const
export const TEST_LICENSE_STATUS_REVOKED = 'REVOKED' as const
export const TEST_LICENSE_STATUS_SUSPENDED = 'SUSPENDED' as const
export const TEST_LICENSE_STATUS_INACTIVE = 'INACTIVE' as const

// Test License Tiers
export const TEST_TIER_CODE_FREE = 'FREE'
export const TEST_TIER_CODE_STARTER = 'STARTER'
export const TEST_TIER_CODE_PROFESSIONAL = 'PROFESSIONAL'
export const TEST_TIER_CODE_BUSINESS = 'BUSINESS'

// Test Activation Values
export const TEST_ACTIVATION_LIMIT = 5
export const TEST_ACTIVATION_COUNT = 2
export const TEST_SITE_NAME = 'Test Site'
export const TEST_IP_ADDRESS = '192.168.1.1'
export const TEST_OS = 'Linux'
export const TEST_REGION = 'us-east-1'
export const TEST_CLIENT_VERSION = '1.0.0'
export const TEST_DEVICE_HASH = 'device-hash-12345'

// Test User Values
export const TEST_USERNAME = 'testuser'
export const TEST_USERNAME_ADMIN = 'admin'
export const TEST_PASSWORD = 'test-password-123'
export const TEST_EMAIL = 'test@example.com'
export const TEST_EMAIL_ADMIN = 'admin@example.com'
export const TEST_USER_ID = 'user-123'
export const TEST_ADMIN_ROLE = 'ADMIN' as const
export const TEST_SUPERUSER_ROLE = 'SUPERUSER' as const

// Test Token Values
export const TEST_AUTH_TOKEN = 'test-auth-token-12345'
export const TEST_AUTH_TOKEN_EXPIRES_IN = 3600
export const TEST_AUTH_TOKEN_EXPIRED = 'expired-token'

// Test Product Values
export const TEST_PRODUCT_ID = 'product-123'
export const TEST_PRODUCT_SLUG = 'test-product'
export const TEST_PRODUCT_NAME = 'Test Product'
export const TEST_PRODUCT_DESCRIPTION = 'Test Product Description'
export const TEST_ENTITLEMENT_KEY = 'ENTITLEMENT-KEY'

// Test Tenant Values
export const TEST_TENANT_ID = 'tenant-123'
export const TEST_TENANT_NAME = 'Test Tenant'

// Test Error Codes
export const TEST_ERROR_CODE_UNKNOWN = 'UNKNOWN_ERROR'
export const TEST_ERROR_CODE_VALIDATION = 'VALIDATION_ERROR'
export const TEST_ERROR_CODE_NETWORK = 'NETWORK_ERROR'

// Test HTTP Status Codes
export const TEST_HTTP_STATUS_OK = 200
export const TEST_HTTP_STATUS_CREATED = 201
export const TEST_HTTP_STATUS_BAD_REQUEST = 400
export const TEST_HTTP_STATUS_UNAUTHORIZED = 401
export const TEST_HTTP_STATUS_FORBIDDEN = 403
export const TEST_HTTP_STATUS_NOT_FOUND = 404
export const TEST_HTTP_STATUS_INTERNAL_SERVER_ERROR = 500

// Test Error Messages
export const TEST_ERROR_MESSAGE_GENERIC = 'An error occurred'
export const TEST_ERROR_MESSAGE_NOT_FOUND = 'Resource not found'
export const TEST_ERROR_MESSAGE_UNAUTHORIZED = 'Unauthorized'
export const TEST_ERROR_MESSAGE_VALIDATION = 'Validation failed'

// Test Date Values
export const TEST_DATE_CREATED = new Date('2024-01-01T00:00:00Z')
export const TEST_DATE_UPDATED = new Date('2024-01-02T00:00:00Z')
export const TEST_DATE_EXPIRES = new Date('2025-01-01T00:00:00Z')
export const TEST_DATE_EXPIRED = new Date('2023-01-01T00:00:00Z')

// Test Response Keys
export const TEST_RESPONSE_SUCCESS = 'success'
export const TEST_RESPONSE_DATA = 'data'
export const TEST_RESPONSE_ERROR = 'error'

// Test Boolean Values
export const TEST_BOOLEAN_TRUE = true
export const TEST_BOOLEAN_FALSE = false

// Test Numeric Values
export const TEST_NUMBER_ZERO = 0
export const TEST_NUMBER_ONE = 1
export const TEST_NUMBER_TEN = 10
export const TEST_NUMBER_HUNDRED = 100

// Test String Values
export const TEST_STRING_EMPTY = ''
export const TEST_STRING_SPACE = ' '
export const TEST_STRING_VALUE = 'Test Value'
export const TEST_STATUS_HEALTHY = 'healthy'
export const TEST_STATUS_UNHEALTHY = 'unhealthy'
export const TEST_EVENT_OPEN = 'open'
export const TEST_EVENT_CLOSE = 'close'
export const TEST_EVENT_ERROR = 'error'

// Test Timeout Values (milliseconds)
export const TEST_TIMEOUT_SHORT = 1000
export const TEST_TIMEOUT_MEDIUM = 5000
export const TEST_TIMEOUT_LONG = 10000
