export const APP_BRAND_NAME = 'Simple License Admin' as const
export const APP_BRAND_TAGLINE = 'Operate licenses with confidence' as const
export const APP_DEFAULT_LANGUAGE = 'en' as const
export const APP_SECONDARY_LANGUAGE = 'en-US' as const
export const APP_SUPPORTED_LANGUAGES = [APP_DEFAULT_LANGUAGE, APP_SECONDARY_LANGUAGE] as const
export const APP_I18N_DEFAULT_NAMESPACE = 'common' as const
export const APP_I18N_FALLBACK_NAMESPACE = APP_I18N_DEFAULT_NAMESPACE
export const APP_I18N_RESOURCE_BUNDLE_ID = 'app.i18n.resources' as const

export const I18N_KEY_APP_BRAND = 'app.brand' as const
export const I18N_KEY_APP_TAGLINE = 'app.tagline' as const
export const I18N_KEY_APP_LOADING = 'app.loading' as const
export const I18N_KEY_APP_ERROR_TITLE = 'app.error.title' as const
export const I18N_KEY_APP_ERROR_MESSAGE = 'app.error.message' as const
export const I18N_KEY_APP_ERROR_RESET = 'app.error.reset' as const
export const I18N_KEY_DASHBOARD_HEADING = 'dashboard.heading' as const
export const I18N_KEY_DASHBOARD_SUBTITLE = 'dashboard.subtitle' as const
export const I18N_KEY_AUTH_HEADING = 'auth.heading' as const
export const I18N_KEY_AUTH_SUBTITLE = 'auth.subtitle' as const
export const I18N_KEY_AUTH_SUBMIT = 'auth.submit' as const
export const I18N_KEY_AUTH_FORGOT_LINK = 'auth.forgot' as const
export const I18N_KEY_AUTH_GENERIC_ERROR = 'auth.error.generic' as const
export const I18N_KEY_NOT_FOUND_TITLE = 'notFound.title' as const
export const I18N_KEY_NOT_FOUND_BODY = 'notFound.body' as const
export const I18N_KEY_FORM_USERNAME_LABEL = 'forms.username.label' as const
export const I18N_KEY_FORM_PASSWORD_LABEL = 'forms.password.label' as const
export const I18N_KEY_FORM_TENANT_PLACEHOLDER = 'forms.tenant.placeholder' as const
export const I18N_KEY_FORM_USERNAME_REQUIRED = 'forms.username.required' as const
export const I18N_KEY_FORM_PASSWORD_REQUIRED = 'forms.password.required' as const
export const I18N_KEY_SESSION_WARNING_TITLE = 'session.warning.title' as const
export const I18N_KEY_SESSION_WARNING_BODY = 'session.warning.body' as const
export const I18N_KEY_SESSION_EXPIRED_TITLE = 'session.expired.title' as const
export const I18N_KEY_SESSION_EXPIRED_BODY = 'session.expired.body' as const
export const I18N_KEY_HEALTH_HEADING = 'health.heading' as const
export const I18N_KEY_HEALTH_SUBTITLE = 'health.subtitle' as const

export const ROUTE_ID_ROOT = 'route.root' as const
export const ROUTE_ID_DASHBOARD = 'route.dashboard' as const
export const ROUTE_ID_AUTH = 'route.auth' as const
export const ROUTE_ID_CHANGE_PASSWORD = 'route.auth.changePassword' as const
export const ROUTE_ID_NOT_FOUND = 'route.notFound' as const
export const ROUTE_ID_LICENSES = 'route.licenses' as const
export const ROUTE_ID_PRODUCTS = 'route.products' as const
export const ROUTE_ID_TENANTS = 'route.tenants' as const
export const ROUTE_ID_USERS = 'route.users' as const
export const ROUTE_ID_ANALYTICS = 'route.analytics' as const
export const ROUTE_ID_HEALTH = 'route.health' as const
export const ROUTE_ID_AUDIT = 'route.audit' as const

export const ROUTE_PATH_ROOT = '/' as const
export const ROUTE_PATH_DASHBOARD = '/dashboard' as const
export const ROUTE_PATH_AUTH = '/auth' as const
export const ROUTE_PATH_CHANGE_PASSWORD = '/auth/change-password' as const
export const ROUTE_PATH_LICENSES = '/licenses' as const
export const ROUTE_PATH_PRODUCTS = '/products' as const
export const ROUTE_PATH_TENANTS = '/tenants' as const
export const ROUTE_PATH_USERS = '/users' as const
export const ROUTE_PATH_ANALYTICS = '/analytics' as const
export const ROUTE_PATH_HEALTH = '/health' as const
export const ROUTE_PATH_AUDIT = '/audit' as const
export const ROUTE_PATH_WILDCARD = '*' as const

export const QUERY_CLIENT_STALE_TIME_MS = 60_000 as const
export const QUERY_CLIENT_GC_TIME_MS = 300_000 as const

export const ENV_VAR_API_BASE_URL = 'VITE_API_BASE_URL' as const
export const ENV_VAR_SENTRY_DSN = 'VITE_SENTRY_DSN' as const
export const ENV_VAR_FEATURE_DEV_TOOLS = 'VITE_FEATURE_DEV_TOOLS' as const
export const ENV_VAR_FEATURE_QUERY_CACHE_PERSISTENCE = 'VITE_FEATURE_QUERY_CACHE_PERSISTENCE' as const
export const ENV_VAR_FEATURE_EXPERIMENTAL_FILTERS = 'VITE_FEATURE_EXPERIMENTAL_FILTERS' as const
export const ENV_VAR_HTTP_TIMEOUT_MS = 'VITE_HTTP_TIMEOUT_MS' as const
export const ENV_VAR_HTTP_RETRY_ATTEMPTS = 'VITE_HTTP_RETRY_ATTEMPTS' as const
export const ENV_VAR_HTTP_RETRY_DELAY_MS = 'VITE_HTTP_RETRY_DELAY_MS' as const
export const ENV_VAR_WS_PATH = 'VITE_WS_PATH' as const
export const ENV_VAR_AUTH_FORGOT_PASSWORD_URL = 'VITE_AUTH_FORGOT_PASSWORD_URL' as const

export const STORAGE_KEY_AUTH_TOKEN = 'simple-license-admin-auth-token' as const
export const STORAGE_KEY_AUTH_REFRESH_TOKEN = 'simple-license-admin-auth-refresh-token' as const
export const STORAGE_KEY_AUTH_EXPIRY = 'simple-license-admin-auth-expiry' as const
export const STORAGE_KEY_AUTH_USER = 'simple-license-admin-auth-user' as const

export const AUTH_FIELD_USERNAME = 'username' as const
export const AUTH_FIELD_PASSWORD = 'password' as const

export const APP_STATE_ACTION_SET_TENANT = 'appState/setTenant' as const
export const APP_STATE_ACTION_SET_THEME = 'appState/setTheme' as const
export const APP_STATE_ACTION_SET_SIDEBAR = 'appState/setSidebar' as const

export const APP_THEME_LIGHT = 'light' as const
export const APP_THEME_DARK = 'dark' as const
export const APP_AVAILABLE_THEMES = [APP_THEME_LIGHT, APP_THEME_DARK] as const
export const APP_THEME_DEFAULT = APP_THEME_LIGHT

export const APP_HTTP_TIMEOUT_MS = 30_000 as const
export const APP_HTTP_RETRY_ATTEMPTS = 3 as const
export const APP_HTTP_RETRY_DELAY_MS = 1_000 as const
export const APP_WS_HEALTH_PATH = '/ws/health' as const

export const NOTIFICATION_EVENT_TOAST = 'notification:toast' as const
export const NOTIFICATION_TOAST_DURATION_MS = 4_000 as const
export const NOTIFICATION_DEFAULT_POSITION = 'top-right' as const
export const NOTIFICATION_VARIANT_INFO = 'info' as const
export const NOTIFICATION_VARIANT_SUCCESS = 'success' as const
export const NOTIFICATION_VARIANT_WARNING = 'warning' as const
export const NOTIFICATION_VARIANT_ERROR = 'error' as const

export const FORM_VALIDATION_MODE = 'onSubmit' as const
export const FORM_REVALIDATION_MODE = 'onChange' as const
export const FORM_DEFAULT_DELAY_MS = 150 as const

export const DATE_FORMAT_SHORT = 'PPP' as const
export const DATE_FORMAT_TIME = 'p' as const
export const SESSION_IDLE_WARNING_MS = 720_000 as const
export const SESSION_IDLE_TIMEOUT_MS = 900_000 as const
export const TRACKING_EVENT_SESSION_WARNING = 'session.warning' as const
export const TRACKING_EVENT_SESSION_TIMEOUT = 'session.timeout' as const

export const TEST_ID_APP_SHELL = 'app-shell' as const
export const TEST_ID_TOAST_CONTAINER = 'toast-container' as const
export const TEST_ID_ERROR_FALLBACK = 'error-fallback' as const
export const TEST_ID_NOTIFICATION_PORTAL = 'notification-portal' as const

export const ROUTER_CONTEXT_KEY_QUERY_CLIENT = 'queryClient' as const

export const AUTH_ERROR_MESSAGE_KEY = 'auth.error.invalidCredentials' as const
export const AUTH_STATUS_IDLE = 'auth/status/idle' as const
export const AUTH_STATUS_LOADING = 'auth/status/loading' as const
export const AUTH_TOKEN_EXPIRY_SKEW_MS = 30_000 as const

export type SupportedLanguage = (typeof APP_SUPPORTED_LANGUAGES)[number]

export const ERROR_MESSAGE_API_CONTEXT_UNAVAILABLE = 'API context is unavailable' as const
export const ERROR_MESSAGE_AUTH_CONTEXT_UNAVAILABLE = 'Auth context is unavailable' as const
export const ERROR_MESSAGE_APP_STATE_CONTEXT_UNAVAILABLE = 'App state context is unavailable' as const
export const ERROR_MESSAGE_NOTIFICATION_CONTEXT_UNAVAILABLE = 'Notification bus context is unavailable' as const
export const ERROR_MESSAGE_AUTHORIZATION_CONTEXT_UNAVAILABLE = 'Authorization context is unavailable' as const
export const ERROR_MESSAGE_LOGGER_CONTEXT_UNAVAILABLE = 'Logger context is unavailable' as const
export const ERROR_MESSAGE_TRACKING_CONTEXT_UNAVAILABLE = 'Tracking context is unavailable' as const
export const ERROR_MESSAGE_ABILITY_CONTEXT_UNAVAILABLE = 'Ability context is unavailable' as const

export const APP_ERROR_TYPE_NETWORK = 'network' as const
export const APP_ERROR_TYPE_AUTH = 'auth' as const
export const APP_ERROR_TYPE_VALIDATION = 'validation' as const
export const APP_ERROR_TYPE_RATE_LIMIT = 'rate_limit' as const
export const APP_ERROR_TYPE_NOT_FOUND = 'not_found' as const
export const APP_ERROR_TYPE_SERVER = 'server' as const
export const APP_ERROR_TYPE_CLIENT = 'client' as const
export const APP_ERROR_TYPE_UNEXPECTED = 'unexpected' as const

export const APP_ERROR_CODE_UNEXPECTED = 'UNEXPECTED_ERROR' as const
export const APP_ERROR_MESSAGE_UNEXPECTED = 'Unexpected error encountered' as const
export const APP_ERROR_MESSAGE_NON_ERROR_THROWABLE = 'Non-error throwable received' as const
export const APP_ERROR_MESSAGE_CLIENT_CONFIGURATION = 'Client configuration error' as const
export const APP_ERROR_MESSAGE_MISSING_RESPONSE = 'No response received from server' as const
export const APP_ERROR_MESSAGE_REQUEST_FAILED = 'Request failed' as const

export const I18N_KEY_DEV_TOOLBAR_HEADING = 'dev.toolbar.heading' as const
export const I18N_KEY_DEV_TOOLBAR_RESET = 'dev.toolbar.reset' as const
export const I18N_KEY_DEV_PERSONA_SUPERUSER = 'dev.persona.superuser' as const
export const I18N_KEY_DEV_PERSONA_SUPPORT = 'dev.persona.support' as const
export const I18N_KEY_DEV_PERSONA_VIEWER = 'dev.persona.viewer' as const

export const TEST_ID_DEV_TOOLBAR = 'dev-toolbar' as const

export const ABILITY_ACTION_VIEW = 'view' as const
export const ABILITY_ACTION_MANAGE = 'manage' as const

export const ABILITY_SUBJECT_DASHBOARD = 'dashboard' as const
export const ABILITY_SUBJECT_LICENSE = 'license' as const
export const ABILITY_SUBJECT_PRODUCT = 'product' as const
export const ABILITY_SUBJECT_TENANT = 'tenant' as const
export const ABILITY_SUBJECT_USER = 'user' as const
export const ABILITY_SUBJECT_ANALYTICS = 'analytics' as const

export const LIST_DEFAULT_PAGE = 1 as const
export const LIST_DEFAULT_PAGE_SIZE = 25 as const
export const LIST_MAX_PAGE_SIZE = 100 as const
export const LIST_FILTER_PARAM_PREFIX = 'filter:' as const
export const LIST_QUERY_PARAM_PAGE = 'page' as const
export const LIST_QUERY_PARAM_PAGE_SIZE = 'pageSize' as const
export const LIST_QUERY_PARAM_SORT = 'sort' as const
export const LIST_QUERY_PARAM_DIRECTION = 'direction' as const
export const LIST_QUERY_PARAM_SEARCH = 'search' as const
export const LIST_SORT_DIRECTION_ASC = 'asc' as const
export const LIST_SORT_DIRECTION_DESC = 'desc' as const

export const LICENSE_EXPIRY_WARNING_DAYS = 30 as const
