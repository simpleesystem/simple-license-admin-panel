export const UI_CLASS_ALERT_ACTIONS = 'd-flex gap-2 mt-3'
export const UI_NAMESPACE = 'ui' as const
export const UI_TEST_ID_PREFIX = `${UI_NAMESPACE}-` as const

export const UI_VISIBILITY_MODE_HIDE = 'hide' as const
export const UI_VISIBILITY_MODE_DISABLE = 'disable' as const

export const UI_TEXT_ALIGN_START = 'start' as const
export const UI_TEXT_ALIGN_CENTER = 'center' as const
export const UI_TEXT_ALIGN_END = 'end' as const

export const UI_STACK_DIRECTION_COLUMN = 'column' as const
export const UI_STACK_DIRECTION_ROW = 'row' as const

export const UI_STACK_GAP_NONE = 'none' as const
export const UI_STACK_GAP_SMALL = 'small' as const
export const UI_STACK_GAP_MEDIUM = 'medium' as const
export const UI_STACK_GAP_LARGE = 'large' as const

export const UI_STACK_ALIGN_START = 'start' as const
export const UI_STACK_ALIGN_CENTER = 'center' as const
export const UI_STACK_ALIGN_END = 'end' as const
export const UI_STACK_ALIGN_STRETCH = 'stretch' as const

export const UI_STACK_JUSTIFY_START = 'start' as const
export const UI_STACK_JUSTIFY_CENTER = 'center' as const
export const UI_STACK_JUSTIFY_END = 'end' as const
export const UI_STACK_JUSTIFY_BETWEEN = 'between' as const

export const UI_PAGE_VARIANT_CONSTRAINED = 'constrained' as const
export const UI_PAGE_VARIANT_FULL_WIDTH = 'fullWidth' as const

export const UI_FORM_LAYOUT_VERTICAL = 'vertical' as const
export const UI_FORM_LAYOUT_HORIZONTAL = 'horizontal' as const

export const UI_FORM_ROW_COLUMNS_ONE = 1 as const
export const UI_FORM_ROW_COLUMNS_TWO = 2 as const
export const UI_FORM_ROW_COLUMNS_THREE = 3 as const

export const UI_FORM_CHECK_TYPE_BOX = 'checkbox' as const
export const UI_FORM_CHECK_TYPE_SWITCH = 'switch' as const
export const UI_FORM_CONTROL_TYPE_DATE = 'date' as const
export const UI_FORM_CONTROL_TYPE_TEXT = 'text' as const
export const UI_FORM_CONTROL_TYPE_EMAIL = 'email' as const
export const UI_FORM_CONTROL_TYPE_PASSWORD = 'password' as const
export const UI_FORM_CONTROL_TYPE_NUMBER = 'number' as const
export const UI_FORM_CONTROL_TYPE_SEARCH = 'search' as const
export const UI_VALUE_PLACEHOLDER = '—' as const
export const UI_DATE_FORMAT_LOCALE = 'en-US' as const
export const UI_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}
export const UI_DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}
export const UI_ENTITLEMENT_VALUE_TYPE_NUMBER = 'number' as const
export const UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN = 'boolean' as const
export const UI_ENTITLEMENT_VALUE_TYPE_STRING = 'string' as const
export const UI_ENTITLEMENT_VALUE_LABEL_NUMBER = 'Number' as const
export const UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN = 'Boolean' as const
export const UI_ENTITLEMENT_VALUE_LABEL_STRING = 'String' as const

export const UI_FORM_SELECT_PLACEHOLDER_VALUE = '' as const
export const UI_FORM_SELECT_PLACEHOLDER_DISABLED = true as const
export const UI_FORM_SELECT_PLACEHOLDER_HIDDEN = true as const
export const UI_FORM_TEXTAREA_MIN_ROWS = 3 as const
export const UI_FORM_SECTION_METADATA = 'metadata' as const
export const UI_FIELD_METADATA = 'metadata' as const

export const UI_TABLE_DENSITY_COMPACT = 'compact' as const
export const UI_TABLE_DENSITY_COMFORTABLE = 'comfortable' as const
export const UI_TABLE_DENSITY_SPACIOUS = 'spacious' as const
export const UI_TABLE_PAGE_SIZE_DEFAULT = 10 as const
export const UI_TABLE_SEARCH_PLACEHOLDER = 'Search' as const
export const UI_TABLE_PAGINATION_PREVIOUS = 'Previous' as const
export const UI_TABLE_PAGINATION_NEXT = 'Next' as const
export const UI_TABLE_PAGINATION_LABEL = 'Table pagination' as const

export const UI_SORT_ASC = 'asc' as const
export const UI_SORT_DESC = 'desc' as const

export const UI_BADGE_VARIANT_PRIMARY = 'primary' as const
export const UI_BADGE_VARIANT_SECONDARY = 'secondary' as const
export const UI_BADGE_VARIANT_SUCCESS = 'success' as const
export const UI_BADGE_VARIANT_INFO = 'info' as const
export const UI_BADGE_VARIANT_WARNING = 'warning' as const
export const UI_BADGE_VARIANT_DANGER = 'danger' as const
export const UI_BADGE_VARIANT_LIGHT = 'light' as const

export const UI_ALERT_VARIANT_INFO = 'info' as const
export const UI_ALERT_VARIANT_SUCCESS = 'success' as const
export const UI_ALERT_VARIANT_WARNING = 'warning' as const
export const UI_ALERT_VARIANT_DANGER = 'danger' as const

export const UI_SECTION_STATUS_SUCCESS = 'success' as const
export const UI_SECTION_STATUS_INFO = 'info' as const
export const UI_SECTION_STATUS_WARNING = 'warning' as const
export const UI_SECTION_STATUS_ERROR = 'error' as const
export const UI_SECTION_STATUS_LOADING = 'loading' as const

export const UI_MODAL_SIZE_SM = 'sm' as const
export const UI_MODAL_SIZE_LG = 'lg' as const
export const UI_MODAL_SIZE_XL = 'xl' as const

export const UI_MODAL_BACKDROP_STATIC = 'static' as const
export const UI_MODAL_BACKDROP_ENABLED = true as const
export const UI_MODAL_BACKDROP_DISABLED = false as const

export const UI_SIDE_PANEL_PLACEMENT_START = 'start' as const
export const UI_SIDE_PANEL_PLACEMENT_END = 'end' as const

export const UI_BUTTON_VARIANT_PRIMARY = 'primary' as const
export const UI_BUTTON_VARIANT_SECONDARY = 'secondary' as const
export const UI_BUTTON_VARIANT_OUTLINE = 'outline-primary' as const
export const UI_BUTTON_VARIANT_GHOST = 'link' as const

export const UI_TAG_VARIANT_NEUTRAL = UI_BADGE_VARIANT_SECONDARY
export const UI_TAG_VARIANT_SUCCESS = UI_BADGE_VARIANT_SUCCESS
export const UI_TAG_VARIANT_INFO = UI_BADGE_VARIANT_INFO
export const UI_TAG_VARIANT_WARNING = UI_BADGE_VARIANT_WARNING

export const UI_TEST_ID_APP_SHELL = `${UI_TEST_ID_PREFIX}app-shell`
export const UI_TEST_ID_PAGE = `${UI_TEST_ID_PREFIX}page`
export const UI_TEST_ID_PAGE_HEADER = `${UI_TEST_ID_PREFIX}page-header`
export const UI_TEST_ID_STACK = `${UI_TEST_ID_PREFIX}stack`
export const UI_TEST_ID_SIDEBAR_LAYOUT = `${UI_TEST_ID_PREFIX}sidebar-layout`
export const UI_TEST_ID_HEADING = `${UI_TEST_ID_PREFIX}heading`
export const UI_TEST_ID_BODY_TEXT = `${UI_TEST_ID_PREFIX}body-text`
export const UI_TEST_ID_MUTED_TEXT = `${UI_TEST_ID_PREFIX}muted-text`
export const UI_TEST_ID_BADGE_TEXT = `${UI_TEST_ID_PREFIX}badge-text`
export const UI_TEST_ID_KEY_VALUE_LIST = `${UI_TEST_ID_PREFIX}key-value-list`
export const UI_TEST_ID_KEY_VALUE_ITEM = `${UI_TEST_ID_PREFIX}key-value-item`
export const UI_TEST_ID_EMPTY_STATE = `${UI_TEST_ID_PREFIX}empty-state`
export const UI_TEST_ID_FORM_FIELD = `${UI_TEST_ID_PREFIX}form-field`
export const UI_TEST_ID_FORM_ROW = `${UI_TEST_ID_PREFIX}form-row`
export const UI_TEST_ID_FORM_SECTION = `${UI_TEST_ID_PREFIX}form-section`
export const UI_TEST_ID_DATA_TABLE = `${UI_TEST_ID_PREFIX}data-table`
export const UI_TEST_ID_TABLE_TOOLBAR = `${UI_TEST_ID_PREFIX}table-toolbar`
export const UI_TEST_ID_SUMMARY_LIST = `${UI_TEST_ID_PREFIX}summary-list`
export const UI_TEST_ID_CARD_LIST = `${UI_TEST_ID_PREFIX}card-list`
export const UI_TEST_ID_TAG_LIST = `${UI_TEST_ID_PREFIX}tag-list`
export const UI_TEST_ID_CHIP = `${UI_TEST_ID_PREFIX}chip`
export const UI_TEST_ID_SIDEBAR_NAV = `${UI_TEST_ID_PREFIX}sidebar-nav`
export const UI_TEST_ID_TOP_NAV = `${UI_TEST_ID_PREFIX}top-nav`
export const UI_TEST_ID_BREADCRUMBS = `${UI_TEST_ID_PREFIX}breadcrumbs`
export const UI_TEST_ID_INLINE_ALERT = `${UI_TEST_ID_PREFIX}inline-alert`
export const UI_TEST_ID_SECTION_STATUS = `${UI_TEST_ID_PREFIX}section-status`
export const UI_TEST_ID_MODAL_DIALOG = `${UI_TEST_ID_PREFIX}modal-dialog`
export const UI_TEST_ID_SIDE_PANEL = `${UI_TEST_ID_PREFIX}side-panel`

export const UI_CLASS_APP_SHELL = 'min-vh-100 d-flex flex-column bg-body-tertiary'
export const UI_CLASS_APP_SHELL_BODY = 'flex-grow-1 d-flex w-100'
export const UI_CLASS_APP_SHELL_SIDEBAR = 'bg-body border-end'
export const UI_CLASS_APP_SHELL_CONTENT = 'flex-grow-1 d-flex flex-column'
export const UI_CLASS_APP_SHELL_HEADER = 'border-bottom bg-body'
export const UI_CLASS_APP_SHELL_FOOTER = 'border-top bg-body'

export const UI_CLASS_PAGE_BASE = 'py-4'
export const UI_CLASS_PAGE_CONSTRAINED = 'container'
export const UI_CLASS_PAGE_FULL_WIDTH = 'container-fluid'
export const UI_CLASS_PAGE_FULL_HEIGHT = 'min-vh-100'

export const UI_CLASS_PAGE_HEADER = 'd-flex flex-wrap align-items-center justify-content-between gap-3'
export const UI_CLASS_PAGE_HEADER_CONTENT = 'd-flex flex-column gap-1'
export const UI_CLASS_PAGE_HEADER_ACTIONS = 'd-flex flex-wrap gap-2'
export const UI_CLASS_SECTION_GRID = 'row g-4'
export const UI_CLASS_SECTION_COLUMN_FULL = 'col-12'
export const UI_CLASS_SECTION_COLUMN_HALF = 'col-12 col-xl-6'
export const UI_CLASS_SECTION_COLUMN_THIRD = 'col-12 col-xl-4'
export const UI_CLASS_SECTION_COLUMN_AUTH = 'col-12 col-md-8 col-lg-6 col-xl-5 mx-auto'
export const UI_AUTH_CARD_MIN_HEIGHT = '28rem' as const
export const UI_FORM_FIELD_FEEDBACK_MIN_HEIGHT = '1.5rem' as const

export const UI_CLASS_STACK_BASE = 'd-flex w-100'
export const UI_CLASS_STACK_WRAP = 'flex-wrap'
export const UI_CLASS_STACK_GAP_MAP: Record<string, string> = {
  [UI_STACK_GAP_NONE]: 'gap-0',
  [UI_STACK_GAP_SMALL]: 'gap-2',
  [UI_STACK_GAP_MEDIUM]: 'gap-3',
  [UI_STACK_GAP_LARGE]: 'gap-4',
}
export const UI_CLASS_STACK_DIRECTION_MAP: Record<string, string> = {
  [UI_STACK_DIRECTION_COLUMN]: 'flex-column',
  [UI_STACK_DIRECTION_ROW]: 'flex-row',
}
export const UI_CLASS_STACK_ALIGN_MAP: Record<string, string> = {
  [UI_STACK_ALIGN_START]: 'align-items-start',
  [UI_STACK_ALIGN_CENTER]: 'align-items-center',
  [UI_STACK_ALIGN_END]: 'align-items-end',
  [UI_STACK_ALIGN_STRETCH]: 'align-items-stretch',
}
export const UI_CLASS_STACK_JUSTIFY_MAP: Record<string, string> = {
  [UI_STACK_JUSTIFY_START]: 'justify-content-start',
  [UI_STACK_JUSTIFY_CENTER]: 'justify-content-center',
  [UI_STACK_JUSTIFY_END]: 'justify-content-end',
  [UI_STACK_JUSTIFY_BETWEEN]: 'justify-content-between',
}
export const UI_CLASS_TEXT_ALIGN_MAP: Record<string, string> = {
  [UI_TEXT_ALIGN_START]: 'text-start',
  [UI_TEXT_ALIGN_CENTER]: 'text-center',
  [UI_TEXT_ALIGN_END]: 'text-end',
}
export const UI_CLASS_TEXT_EMPHASIS = 'text-primary'

export const UI_CLASS_SIDEBAR_LAYOUT = 'd-flex w-100'
export const UI_CLASS_SIDEBAR_LAYOUT_SIDEBAR = 'flex-shrink-0 border-end bg-body'
export const UI_CLASS_SIDEBAR_LAYOUT_CONTENT = 'flex-grow-1'
export const UI_CLASS_SIDEBAR_STICKY = 'position-sticky top-0'

export const UI_CLASS_HEADING = 'd-flex flex-column gap-1'
export const UI_CLASS_HEADING_EYEBROW = 'text-uppercase text-muted fw-semibold small'
export const UI_CLASS_HEADING_BADGE = 'ms-2'
export const UI_CLASS_HEADING_TITLE = 'h3'
export const UI_CLASS_MARGIN_RESET = 'mb-0'
export const UI_CLASS_INLINE_GAP = 'd-flex align-items-center gap-2'

export const UI_CLASS_BODY_TEXT = 'text-body'
export const UI_CLASS_BODY_TEXT_LEAD = 'lead'
export const UI_CLASS_MUTED_TEXT = 'text-muted small'
export const UI_CLASS_TEXT_MUTED = 'text-muted'

export const UI_CLASS_BADGE_TEXT = 'd-inline-flex align-items-center gap-1'
export const UI_CLASS_EMPTY_STATE_ACTIONS = 'd-flex justify-content-center gap-2 mt-3'

export const UI_CLASS_KEY_VALUE_LIST = 'list-unstyled mb-0'
export const UI_CLASS_KEY_VALUE_ITEM = 'd-flex justify-content-between align-items-start gap-3 py-2 border-bottom'
export const UI_CLASS_KEY_VALUE_LABEL = 'text-muted text-uppercase small'
export const UI_CLASS_KEY_VALUE_VALUE = 'fw-semibold text-body'

export const UI_CLASS_EMPTY_STATE = 'text-center p-5 border border-dashed rounded-3 bg-body-tertiary'
export const UI_CLASS_EMPTY_STATE_ICON = 'display-4 text-muted'

export const UI_CLASS_FORM_FIELD = 'mb-3'
export const UI_CLASS_FORM_FIELD_LABEL = 'form-label fw-semibold mb-1'
export const UI_CLASS_FORM_FIELD_HINT = 'form-text text-muted mt-0 mb-0'
export const UI_CLASS_FORM_FIELD_ERROR = 'text-danger fw-semibold mt-0 mb-0'
export const UI_CLASS_FORM_FIELD_REQUIRED = 'text-danger ms-1'
export const UI_CLASS_FORM_LABEL_HORIZONTAL = 'col-form-label'

export const UI_CLASS_FORM_ROW = 'row g-3'
export const UI_CLASS_FORM_ROW_COLUMNS_MAP: Record<number, string> = {
  [UI_FORM_ROW_COLUMNS_TWO]: 'row-cols-1 row-cols-md-2',
  [UI_FORM_ROW_COLUMNS_THREE]: 'row-cols-1 row-cols-md-3',
}
export const UI_CLASS_FORM_SECTION = 'mb-5'
export const UI_CLASS_FORM_SECTION_HEADER = 'd-flex flex-wrap justify-content-between align-items-center mb-3'
export const UI_CLASS_FORM_SECTION_TITLE = 'mb-0'
export const UI_CLASS_FORM_SECTION_BODY = 'd-flex flex-column gap-3'
export const UI_CLASS_FORM_ACTIONS = 'd-flex flex-wrap gap-2'
export const UI_TEST_ID_FORM_ACTIONS = `${UI_TEST_ID_PREFIX}form-actions`

export const UI_CLASS_TABLE_WRAPPER = 'table-responsive border rounded shadow-sm bg-body'
export const UI_CLASS_TABLE = 'table align-middle mb-0'
export const UI_CLASS_TABLE_HEADER_CELL = 'text-uppercase text-muted small fw-semibold'
export const UI_CLASS_TABLE_SORT_BUTTON = 'btn btn-link p-0 text-decoration-none text-body-secondary'
export const UI_CLASS_TABLE_SELECTION_CELL = 'text-center'
export const UI_CLASS_TABLE_EMPTY_STATE = 'text-center text-muted py-5'
export const UI_CLASS_TABLE_SPINNER = 'py-5 text-center'
export const UI_CLASS_TABLE_DENSITY_MAP: Record<string, string> = {
  [UI_TABLE_DENSITY_COMFORTABLE]: '',
  [UI_TABLE_DENSITY_COMPACT]: 'table-sm',
  [UI_TABLE_DENSITY_SPACIOUS]: 'table-lg',
}

export const UI_ARIA_LABEL_SELECT_ALL = 'Select all rows'
export const UI_SORT_BUTTON_LABEL_PREFIX = 'Sort'
export const UI_ICON_SORT_DEFAULT = '⇅'
export const UI_ICON_SORT_ASCENDING = '▲'
export const UI_ICON_SORT_DESCENDING = '▼'
export const UI_ARIA_LABEL_TABLE_TOOLBAR = 'Table controls'

export const UI_CLASS_TABLE_TOOLBAR = 'd-flex flex-wrap justify-content-between align-items-center gap-3 mb-3'

export const UI_CLASS_SUMMARY_LIST = 'row row-cols-1 row-cols-md-2 g-3'
export const UI_CLASS_SUMMARY_CARD = 'p-3 border rounded bg-body'
export const UI_CLASS_SUMMARY_VALUE = 'h4 mb-0'
export const UI_ARIA_LABEL_SUMMARY_LIST = 'Summary cards'
export const UI_ANALYTICS_STATS_TITLE = 'System Health Overview' as const
export const UI_ANALYTICS_STATS_DESCRIPTION =
  'Blended live and historical counts across licenses and customers.' as const
export const UI_ANALYTICS_STATS_REFRESH_LABEL = 'Refresh analytics' as const
export const UI_ANALYTICS_STATS_REFRESH_PENDING = 'Refreshing analytics…' as const
export const UI_ANALYTICS_STATS_LOADING_TITLE = 'Loading analytics overview' as const
export const UI_ANALYTICS_STATS_LOADING_BODY = 'Fetching the latest licensing indicators…' as const
export const UI_ANALYTICS_STATS_ERROR_TITLE = 'Unable to load analytics overview' as const
export const UI_ANALYTICS_STATS_ERROR_BODY = 'Please verify service health and refresh the dashboard.' as const
export const UI_ANALYTICS_STATS_EMPTY_TITLE = 'Analytics data unavailable' as const
export const UI_ANALYTICS_STATS_EMPTY_BODY = 'No aggregate metrics were returned.' as const
export const UI_ANALYTICS_STATS_LABEL_ACTIVE = 'Active licenses' as const
export const UI_ANALYTICS_STATS_LABEL_EXPIRED = 'Expired licenses' as const
export const UI_ANALYTICS_STATS_LABEL_CUSTOMERS = 'Customers' as const
export const UI_ANALYTICS_STATS_LABEL_ACTIVATIONS = 'Total activations' as const
export const UI_SUMMARY_ID_ANALYTICS_STATS_ACTIVE = 'analytics-stats-active' as const
export const UI_SUMMARY_ID_ANALYTICS_STATS_EXPIRED = 'analytics-stats-expired' as const
export const UI_SUMMARY_ID_ANALYTICS_STATS_CUSTOMERS = 'analytics-stats-customers' as const
export const UI_SUMMARY_ID_ANALYTICS_STATS_ACTIVATIONS = 'analytics-stats-activations' as const
export const UI_USAGE_TRENDS_TITLE = 'Usage Trends' as const
export const UI_USAGE_TRENDS_REFRESH_LABEL = 'Refresh trends' as const
export const UI_USAGE_TRENDS_REFRESH_PENDING = 'Refreshing trends…' as const
export const UI_USAGE_TRENDS_LOADING_TITLE = 'Loading usage trends' as const
export const UI_USAGE_TRENDS_LOADING_BODY = 'Please wait while we load the latest trend data…' as const
export const UI_USAGE_TRENDS_ERROR_TITLE = 'Unable to load usage trends' as const
export const UI_USAGE_TRENDS_ERROR_BODY = 'Try again later or verify the analytics service health.' as const
export const UI_USAGE_TRENDS_EMPTY_TITLE = 'No usage trends yet' as const
export const UI_USAGE_TRENDS_EMPTY_BODY = 'Usage reports will appear here once data is ingested.' as const
export const UI_USAGE_TRENDS_EMPTY_STATE = 'No trends recorded.' as const
export const UI_ANALYTICS_SUMMARY_TITLE = 'Usage Summaries' as const
export const UI_ANALYTICS_SUMMARY_DESCRIPTION =
  'Review aggregated activations, validations, and concurrency by time period.' as const
export const UI_ANALYTICS_SUMMARY_DEFAULT_LIMIT = 10 as const
export const UI_ANALYTICS_SUMMARY_REFRESH_LABEL = 'Refresh summaries' as const
export const UI_ANALYTICS_SUMMARY_REFRESH_PENDING = 'Refreshing summaries…' as const
export const UI_ANALYTICS_SUMMARY_EMPTY_STATE = 'No usage summaries available yet' as const
export const UI_ANALYTICS_SUMMARY_LOADING_TITLE = 'Loading usage summaries' as const
export const UI_ANALYTICS_SUMMARY_LOADING_BODY = 'Fetching the latest usage metrics…' as const
export const UI_ANALYTICS_SUMMARY_ERROR_TITLE = 'Unable to load usage summaries' as const
export const UI_ANALYTICS_SUMMARY_ERROR_BODY = 'Please try again after refreshing the page.' as const
export const UI_ANALYTICS_LICENSE_DETAILS_TITLE = 'License Usage Details' as const
export const UI_ANALYTICS_LICENSE_DETAILS_DESCRIPTION =
  'Inspect per-license activations, validations, and usage signals for targeted debugging.' as const
export const UI_ANALYTICS_LICENSE_DETAILS_DEFAULT_LIMIT = 30 as const
export const UI_ANALYTICS_LICENSE_DETAILS_EMPTY_STATE = 'No usage history found for this license' as const
export const UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE = 'Loading license usage details' as const
export const UI_ANALYTICS_LICENSE_DETAILS_LOADING_BODY = 'Fetching the selected license history…' as const
export const UI_ANALYTICS_LICENSE_DETAILS_ERROR_TITLE = 'Unable to load license usage details' as const
export const UI_ANALYTICS_LICENSE_DETAILS_ERROR_BODY = 'Verify the license key and try refreshing the panel.' as const
export const UI_ANALYTICS_TOP_LICENSES_TITLE = 'Top Licenses' as const
export const UI_ANALYTICS_TOP_LICENSES_DESCRIPTION =
  'Monitor the licenses generating the highest activation and validation volume.' as const
export const UI_ANALYTICS_TOP_LICENSES_DEFAULT_LIMIT = 10 as const
export const UI_ANALYTICS_TOP_LICENSES_REFRESH_LABEL = 'Refresh top licenses' as const
export const UI_ANALYTICS_TOP_LICENSES_REFRESH_PENDING = 'Refreshing top licenses…' as const
export const UI_ANALYTICS_TOP_LICENSES_EMPTY_STATE = 'No top license metrics available yet' as const
export const UI_ANALYTICS_TOP_LICENSES_LOADING_TITLE = 'Loading top licenses' as const
export const UI_ANALYTICS_TOP_LICENSES_LOADING_BODY = 'Gathering the busiest licenses…' as const
export const UI_ANALYTICS_TOP_LICENSES_ERROR_TITLE = 'Unable to load top licenses' as const
export const UI_ANALYTICS_TOP_LICENSES_ERROR_BODY = 'Please retry after refreshing the dashboard.' as const
export const UI_ANALYTICS_DISTRIBUTION_TITLE = 'Activation Distribution' as const
export const UI_ANALYTICS_DISTRIBUTION_DESCRIPTION =
  'Compare activation and validation counts across the busiest licenses.' as const
export const UI_ANALYTICS_DISTRIBUTION_EMPTY_STATE = 'No activation distribution data available yet' as const
export const UI_ANALYTICS_DISTRIBUTION_LOADING_TITLE = 'Loading activation distribution' as const
export const UI_ANALYTICS_DISTRIBUTION_LOADING_BODY = 'Analyzing the latest activation spread…' as const
export const UI_ANALYTICS_DISTRIBUTION_ERROR_TITLE = 'Unable to load activation distribution' as const
export const UI_ANALYTICS_DISTRIBUTION_ERROR_BODY = 'Please verify your analytics access and refresh the page.' as const
export const UI_ANALYTICS_DISTRIBUTION_REFRESH_LABEL = 'Refresh distribution' as const
export const UI_ANALYTICS_DISTRIBUTION_REFRESH_PENDING = 'Refreshing distribution…' as const
export const UI_ANALYTICS_COLUMN_PERIOD = 'Period' as const
export const UI_ANALYTICS_COLUMN_TENANT_ID = 'Tenant ID' as const
export const UI_ANALYTICS_COLUMN_LICENSE_ID = 'License ID' as const
export const UI_ANALYTICS_COLUMN_LICENSE_KEY = 'License Key' as const
export const UI_ANALYTICS_COLUMN_CUSTOMER_EMAIL = 'Customer Email' as const
export const UI_ANALYTICS_COLUMN_ACTIVATIONS = 'Activations' as const
export const UI_ANALYTICS_COLUMN_VALIDATIONS = 'Validations' as const
export const UI_ANALYTICS_COLUMN_USAGE_REPORTS = 'Usage Reports' as const
export const UI_ANALYTICS_COLUMN_UNIQUE_DOMAINS = 'Unique Domains' as const
export const UI_ANALYTICS_COLUMN_UNIQUE_IPS = 'Unique IPs' as const
export const UI_ANALYTICS_COLUMN_PEAK_CONCURRENCY = 'Peak Concurrency' as const
export const UI_ANALYTICS_COLUMN_LAST_ACTIVATED = 'Last Activated' as const
export const UI_LICENSE_ACTIVATIONS_TITLE = 'License Activations' as const
export const UI_LICENSE_ACTIVATIONS_DESCRIPTION =
  'Review every activation heartbeat, device fingerprint, and suspension status for the selected license.' as const
export const UI_LICENSE_ACTIVATIONS_DEFAULT_LIMIT = 25 as const
export const UI_LICENSE_ACTIVATIONS_EMPTY_STATE = 'No activation records found for this license' as const
export const UI_LICENSE_ACTIVATIONS_LOADING_TITLE = 'Loading license activations' as const
export const UI_LICENSE_ACTIVATIONS_LOADING_BODY = 'Fetching activation history and device metadata…' as const
export const UI_LICENSE_ACTIVATIONS_REFRESH_LABEL = 'Refresh activations' as const
export const UI_LICENSE_ACTIVATIONS_REFRESH_PENDING = 'Refreshing activations…' as const
export const UI_LICENSE_ACTIVATIONS_ERROR_TITLE = 'Unable to load license activations' as const
export const UI_LICENSE_ACTIVATIONS_ERROR_BODY = 'Confirm the license identifier and refresh the panel.' as const
export const UI_LICENSE_ACTIVATIONS_COLUMN_DOMAIN = 'Domain' as const
export const UI_LICENSE_ACTIVATIONS_COLUMN_SITE = 'Site' as const
export const UI_LICENSE_ACTIVATIONS_COLUMN_STATUS = 'Status' as const
export const UI_LICENSE_ACTIVATIONS_COLUMN_ACTIVATED_AT = 'Activated' as const
export const UI_LICENSE_ACTIVATIONS_COLUMN_LAST_SEEN = 'Last Seen' as const
export const UI_LICENSE_ACTIVATIONS_COLUMN_IP = 'IP Address' as const
export const UI_LICENSE_ACTIVATIONS_COLUMN_REGION = 'Region' as const
export const UI_LICENSE_ACTIVATIONS_COLUMN_CLIENT_VERSION = 'Client Version' as const
export const UI_COLUMN_ID_LICENSE_ACTIVATION_DOMAIN = 'license-activation-domain' as const
export const UI_COLUMN_ID_LICENSE_ACTIVATION_SITE = 'license-activation-site' as const
export const UI_COLUMN_ID_LICENSE_ACTIVATION_STATUS = 'license-activation-status' as const
export const UI_COLUMN_ID_LICENSE_ACTIVATION_ACTIVATED_AT = 'license-activation-activated-at' as const
export const UI_COLUMN_ID_LICENSE_ACTIVATION_LAST_SEEN = 'license-activation-last-seen' as const
export const UI_COLUMN_ID_LICENSE_ACTIVATION_IP = 'license-activation-ip-address' as const
export const UI_COLUMN_ID_LICENSE_ACTIVATION_REGION = 'license-activation-region' as const
export const UI_COLUMN_ID_LICENSE_ACTIVATION_CLIENT_VERSION = 'license-activation-client-version' as const
export const UI_LICENSE_FREEZE_FORM_ID = 'license-freeze' as const
export const UI_LICENSE_FREEZE_FORM_TITLE = 'Freeze License' as const
export const UI_LICENSE_FREEZE_FORM_DESCRIPTION =
  'Suspend entitlements and tier benefits while you investigate suspicious activity.' as const
export const UI_LICENSE_FREEZE_FORM_SUBMIT_LABEL = 'Freeze license' as const
export const UI_LICENSE_FREEZE_FORM_PENDING_LABEL = 'Freezing license…' as const
export const UI_LICENSE_FREEZE_SECTION_OPTIONS = 'license-freeze-options' as const
export const UI_FIELD_LICENSE_FREEZE_ENTITLEMENTS = 'freeze_entitlements' as const
export const UI_FIELD_LICENSE_FREEZE_TIER = 'freeze_tier' as const
export const UI_LICENSE_FREEZE_LABEL_ENTITLEMENTS = 'Freeze entitlements' as const
export const UI_LICENSE_FREEZE_LABEL_TIER = 'Freeze tier configuration' as const
export const UI_AUDIT_LOGS_TITLE = 'Audit Logs' as const
export const UI_AUDIT_LOGS_DESCRIPTION =
  'Inspect privileged actions, resource changes, and IP metadata for compliance investigations.' as const
export const UI_AUDIT_LOGS_DEFAULT_LIMIT = 25 as const
export const UI_AUDIT_LOGS_EMPTY_STATE = 'No audit activity recorded for the selected filters' as const
export const UI_AUDIT_LOGS_LOADING_TITLE = 'Loading audit logs' as const
export const UI_AUDIT_LOGS_LOADING_BODY = 'Gathering the latest administrative events…' as const
export const UI_AUDIT_LOGS_ERROR_TITLE = 'Unable to load audit logs' as const
export const UI_AUDIT_LOGS_ERROR_BODY = 'Review your permissions or refresh the dashboard.' as const
export const UI_AUDIT_LOGS_FILTER_ADMIN_LABEL = 'Admin ID' as const
export const UI_AUDIT_LOGS_FILTER_ACTION_LABEL = 'Action' as const
export const UI_AUDIT_LOGS_FILTER_RESOURCE_TYPE_LABEL = 'Resource Type' as const
export const UI_AUDIT_LOGS_FILTER_RESOURCE_ID_LABEL = 'Resource ID' as const
export const UI_AUDIT_LOGS_FILTER_APPLY_LABEL = 'Apply filters' as const
export const UI_AUDIT_LOGS_FILTER_RESET_LABEL = 'Reset filters' as const
export const UI_AUDIT_LOGS_TOTAL_LABEL = 'Total entries' as const
export const UI_FIELD_AUDIT_FILTER_ADMIN = 'adminId' as const
export const UI_FIELD_AUDIT_FILTER_ACTION = 'action' as const
export const UI_FIELD_AUDIT_FILTER_RESOURCE_TYPE = 'resourceType' as const
export const UI_FIELD_AUDIT_FILTER_RESOURCE_ID = 'resourceId' as const
export const UI_AUDIT_LOGS_COLUMN_TIMESTAMP = 'Timestamp' as const
export const UI_AUDIT_LOGS_COLUMN_ADMIN = 'Administrator' as const
export const UI_AUDIT_LOGS_COLUMN_ACTION = 'Action' as const
export const UI_AUDIT_LOGS_COLUMN_RESOURCE_TYPE = 'Resource Type' as const
export const UI_AUDIT_LOGS_COLUMN_RESOURCE_ID = 'Resource ID' as const
export const UI_AUDIT_LOGS_COLUMN_IP = 'IP Address' as const
export const UI_AUDIT_LOGS_COLUMN_USER_AGENT = 'User Agent' as const
export const UI_AUDIT_LOGS_COLUMN_DETAILS = 'Details' as const
export const UI_COLUMN_ID_AUDIT_LOG_TIMESTAMP = 'audit-log-timestamp' as const
export const UI_COLUMN_ID_AUDIT_LOG_ADMIN = 'audit-log-admin' as const
export const UI_COLUMN_ID_AUDIT_LOG_ACTION = 'audit-log-action' as const
export const UI_COLUMN_ID_AUDIT_LOG_RESOURCE_TYPE = 'audit-log-resource-type' as const
export const UI_COLUMN_ID_AUDIT_LOG_RESOURCE_ID = 'audit-log-resource-id' as const
export const UI_COLUMN_ID_AUDIT_LOG_IP = 'audit-log-ip-address' as const
export const UI_COLUMN_ID_AUDIT_LOG_USER_AGENT = 'audit-log-user-agent' as const
export const UI_COLUMN_ID_AUDIT_LOG_DETAILS = 'audit-log-details' as const
export const UI_SYSTEM_STATUS_TITLE = 'System Status' as const
export const UI_SYSTEM_STATUS_DESCRIPTION = 'Monitor the latest heartbeat signals for the platform services.' as const
export const UI_SYSTEM_STATUS_REFRESH_LABEL = 'Refresh status' as const
export const UI_SYSTEM_STATUS_REFRESH_PENDING = 'Refreshing status…' as const
export const UI_SYSTEM_STATUS_LOADING_TITLE = 'Loading system status' as const
export const UI_SYSTEM_STATUS_LOADING_BODY = 'Fetching heartbeat data from the monitoring service…' as const
export const UI_SYSTEM_STATUS_ERROR_TITLE = 'Unable to load system status' as const
export const UI_SYSTEM_STATUS_ERROR_BODY = 'Verify the monitoring service health and try again.' as const
export const UI_SYSTEM_STATUS_EMPTY_TITLE = 'System status unavailable' as const
export const UI_SYSTEM_STATUS_EMPTY_BODY = 'No heartbeat results were returned by the API.' as const
export const UI_SYSTEM_STATUS_LABEL_STATUS = 'Overall status' as const
export const UI_SYSTEM_STATUS_LABEL_LAST_CHECKED = 'Last checked' as const
export const UI_SYSTEM_STATUS_LABEL_DATABASE = 'Database health' as const
export const UI_SYSTEM_STATUS_VALUE_HEALTHY = 'Healthy' as const
export const UI_SYSTEM_STATUS_VALUE_UNHEALTHY = 'Unhealthy' as const
export const UI_SYSTEM_STATUS_VALUE_DATABASE_CONNECTED = 'Connected' as const
export const UI_SYSTEM_STATUS_VALUE_DATABASE_UNAVAILABLE = 'Unavailable' as const
export const UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_PREFIX = 'Connection pool' as const
export const UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_TOTAL = 'Total connections' as const
export const UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_IDLE = 'Idle connections' as const
export const UI_SYSTEM_STATUS_VALUE_DATABASE_POOL_WAITING = 'Waiting requests' as const
export const UI_LIVE_STATUS_CONNECTED = 'Live data' as const
export const UI_LIVE_STATUS_CONNECTING = 'Connecting…' as const
export const UI_LIVE_STATUS_DISCONNECTED = 'Live feed offline' as const
export const UI_LIVE_STATUS_ERROR = 'Live feed unavailable' as const
export const UI_SUMMARY_ID_SYSTEM_STATUS_STATE = 'system-status-state' as const
export const UI_SUMMARY_ID_SYSTEM_STATUS_LAST_CHECKED = 'system-status-last-checked' as const
export const UI_SUMMARY_ID_SYSTEM_STATUS_DATABASE = 'system-status-database' as const
export const UI_VALUE_SEPARATOR = ' | ' as const
export const UI_HEALTH_METRICS_TITLE = 'Health Metrics' as const
export const UI_HEALTH_METRICS_DESCRIPTION = 'Review key runtime metrics for resource usage and saturation.' as const
export const UI_HEALTH_METRICS_REFRESH_LABEL = 'Refresh metrics' as const
export const UI_HEALTH_METRICS_REFRESH_PENDING = 'Refreshing metrics…' as const
export const UI_HEALTH_METRICS_LOADING_TITLE = 'Loading health metrics' as const
export const UI_HEALTH_METRICS_LOADING_BODY = 'Collecting runtime statistics from the service…' as const
export const UI_HEALTH_METRICS_ERROR_TITLE = 'Unable to load health metrics' as const
export const UI_HEALTH_METRICS_ERROR_BODY = 'Please confirm system availability and retry.' as const
export const UI_HEALTH_METRICS_EMPTY_TITLE = 'No health metrics available' as const
export const UI_HEALTH_METRICS_EMPTY_BODY = 'The monitoring service has not reported any runtime data yet.' as const
export const UI_HEALTH_METRICS_LABEL_UPTIME = 'Uptime (seconds)' as const
export const UI_HEALTH_METRICS_LABEL_MEMORY_RSS = 'Memory RSS (bytes)' as const
export const UI_HEALTH_METRICS_LABEL_MEMORY_HEAP_TOTAL = 'Heap total (bytes)' as const
export const UI_HEALTH_METRICS_LABEL_MEMORY_HEAP_USED = 'Heap used (bytes)' as const
export const UI_HEALTH_METRICS_LABEL_MEMORY_EXTERNAL = 'External memory (bytes)' as const
export const UI_HEALTH_METRICS_LABEL_CPU_USER = 'CPU user time' as const
export const UI_HEALTH_METRICS_LABEL_CPU_SYSTEM = 'CPU system time' as const
export const UI_SUMMARY_ID_HEALTH_METRICS_UPTIME = 'health-metrics-uptime' as const
export const UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_RSS = 'health-metrics-memory-rss' as const
export const UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_HEAP_TOTAL = 'health-metrics-memory-heap-total' as const
export const UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_HEAP_USED = 'health-metrics-memory-heap-used' as const
export const UI_SUMMARY_ID_HEALTH_METRICS_MEMORY_EXTERNAL = 'health-metrics-memory-external' as const
export const UI_SUMMARY_ID_HEALTH_METRICS_CPU_USER = 'health-metrics-cpu-user' as const
export const UI_SUMMARY_ID_HEALTH_METRICS_CPU_SYSTEM = 'health-metrics-cpu-system' as const
export const UI_SYSTEM_METRICS_TITLE = 'System Metrics' as const
export const UI_SYSTEM_METRICS_DESCRIPTION =
  'Inspect application metadata, runtime signals, and downstream dependency metrics.' as const
export const UI_SYSTEM_METRICS_REFRESH_LABEL = 'Refresh data' as const
export const UI_SYSTEM_METRICS_REFRESH_PENDING = 'Refreshing data…' as const
export const UI_SYSTEM_METRICS_LOADING_TITLE = 'Loading system metrics' as const
export const UI_SYSTEM_METRICS_LOADING_BODY = 'Gathering telemetry across application services…' as const
export const UI_SYSTEM_METRICS_ERROR_TITLE = 'Unable to load system metrics' as const
export const UI_SYSTEM_METRICS_ERROR_BODY = 'Confirm monitoring availability and try again.' as const
export const UI_SYSTEM_METRICS_EMPTY_TITLE = 'No system metrics returned' as const
export const UI_SYSTEM_METRICS_EMPTY_BODY = 'The system metrics endpoint responded without any data.' as const
export const UI_SYSTEM_METRICS_SECTION_APPLICATION = 'Application' as const
export const UI_SYSTEM_METRICS_SECTION_SYSTEM = 'Runtime' as const
export const UI_SYSTEM_METRICS_SECTION_DATABASE = 'Database' as const
export const UI_SYSTEM_METRICS_SECTION_CACHE = 'Cache' as const
export const UI_SYSTEM_METRICS_SECTION_SECURITY = 'Security' as const
export const UI_SYSTEM_METRICS_SECTION_TENANTS = 'Tenants' as const
export const UI_SYSTEM_METRICS_LABEL_VERSION = 'Version' as const
export const UI_SYSTEM_METRICS_LABEL_ENVIRONMENT = 'Environment' as const
export const UI_SYSTEM_METRICS_LABEL_TIMESTAMP = 'Timestamp' as const
export const UI_SYSTEM_METRICS_LABEL_RUNTIME_UPTIME = 'Uptime (seconds)' as const
export const UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_RSS = 'Memory RSS (bytes)' as const
export const UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_HEAP_TOTAL = 'Heap total (bytes)' as const
export const UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_HEAP_USED = 'Heap used (bytes)' as const
export const UI_SYSTEM_METRICS_LABEL_RUNTIME_MEMORY_EXTERNAL = 'External memory (bytes)' as const
export const UI_SYSTEM_METRICS_LABEL_RUNTIME_CPU_USER = 'CPU user time' as const
export const UI_SYSTEM_METRICS_LABEL_RUNTIME_CPU_SYSTEM = 'CPU system time' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_VERSION = 'system-metrics-application-version' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_ENVIRONMENT = 'system-metrics-application-environment' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_APPLICATION_TIMESTAMP = 'system-metrics-application-timestamp' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_UPTIME = 'system-metrics-runtime-uptime' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_RSS = 'system-metrics-runtime-memory-rss' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_HEAP_TOTAL =
  'system-metrics-runtime-memory-heap-total' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_HEAP_USED = 'system-metrics-runtime-memory-heap-used' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_MEMORY_EXTERNAL = 'system-metrics-runtime-memory-external' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_CPU_USER = 'system-metrics-runtime-cpu-user' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_RUNTIME_CPU_SYSTEM = 'system-metrics-runtime-cpu-system' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_DATABASE_PREFIX = 'system-metrics-database-' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_CACHE_PREFIX = 'system-metrics-cache-' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_SECURITY_PREFIX = 'system-metrics-security-' as const
export const UI_SUMMARY_ID_SYSTEM_METRICS_TENANT_PREFIX = 'system-metrics-tenant-' as const
export const UI_SECTION_ID_SYSTEM_METRICS_APPLICATION = 'system-metrics-section-application' as const
export const UI_SECTION_ID_SYSTEM_METRICS_RUNTIME = 'system-metrics-section-runtime' as const
export const UI_SECTION_ID_SYSTEM_METRICS_DATABASE = 'system-metrics-section-database' as const
export const UI_SECTION_ID_SYSTEM_METRICS_CACHE = 'system-metrics-section-cache' as const
export const UI_SECTION_ID_SYSTEM_METRICS_SECURITY = 'system-metrics-section-security' as const
export const UI_SECTION_ID_SYSTEM_METRICS_TENANTS = 'system-metrics-section-tenants' as const
export const UI_TENANT_BACKUP_TITLE = 'Tenant Backups' as const
export const UI_TENANT_BACKUP_DESCRIPTION =
  'Create point-in-time backups to safeguard tenant configuration before making sweeping changes.' as const
export const UI_TENANT_BACKUP_BUTTON_LABEL = 'Create backup' as const
export const UI_TENANT_BACKUP_PENDING_LABEL = 'Creating backup…' as const
export const UI_TENANT_BACKUP_SUCCESS = 'Backup completed successfully.' as const
export const UI_TENANT_BACKUP_ERROR = 'Unable to create backup. Please verify your permissions and try again.' as const
export const UI_TENANT_BACKUP_LAST_RUN_LABEL = 'Last backup run' as const
export const UI_TENANT_BACKUP_NAME_LABEL = 'Backup name' as const
export const UI_TENANT_BACKUP_TYPE_LABEL = 'Backup type' as const
export const UI_SUMMARY_ID_TENANT_BACKUP_LAST_RUN = 'tenant-backup-last-run' as const
export const UI_SUMMARY_ID_TENANT_BACKUP_NAME = 'tenant-backup-name' as const
export const UI_SUMMARY_ID_TENANT_BACKUP_TYPE = 'tenant-backup-type' as const
export const UI_ANALYTICS_ALERT_THRESHOLDS_TITLE = 'Alert Thresholds' as const
export const UI_ANALYTICS_ALERT_THRESHOLDS_DESCRIPTION =
  'Define when the system should flag elevated activation or concurrency activity.' as const
export const UI_ANALYTICS_ALERT_THRESHOLDS_EMPTY_STATE = 'Alert thresholds are not configured yet' as const
export const UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_TITLE = 'Loading alert thresholds' as const
export const UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_BODY = 'Fetching the current alert configuration…' as const
export const UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_TITLE = 'Unable to load alert thresholds' as const
export const UI_ANALYTICS_ALERT_THRESHOLDS_ERROR_BODY = 'Please verify your permissions and refresh the page.' as const
export const UI_BUTTON_LABEL_EDIT_ALERT_THRESHOLDS = 'Edit Alert Thresholds' as const
export const UI_ALERT_THRESHOLD_FORM_TITLE = 'Update Alert Thresholds' as const
export const UI_ALERT_THRESHOLD_FORM_ID = 'update-alert-thresholds' as const
export const UI_ALERT_THRESHOLD_FORM_SUBMIT_LABEL = 'Save Alert Thresholds' as const
export const UI_ALERT_THRESHOLD_SECTION_HIGH = 'alert-thresholds-high' as const
export const UI_ALERT_THRESHOLD_SECTION_MEDIUM = 'alert-thresholds-medium' as const
export const UI_ALERT_THRESHOLD_SECTION_TITLE_HIGH = 'High Thresholds' as const
export const UI_ALERT_THRESHOLD_SECTION_TITLE_MEDIUM = 'Medium Thresholds' as const
export const UI_FIELD_ALERT_HIGH_ACTIVATIONS = 'high_activations' as const
export const UI_FIELD_ALERT_HIGH_VALIDATIONS = 'high_validations' as const
export const UI_FIELD_ALERT_HIGH_CONCURRENCY = 'high_concurrency' as const
export const UI_FIELD_ALERT_MEDIUM_ACTIVATIONS = 'medium_activations' as const
export const UI_FIELD_ALERT_MEDIUM_VALIDATIONS = 'medium_validations' as const
export const UI_FIELD_ALERT_MEDIUM_CONCURRENCY = 'medium_concurrency' as const
export const UI_ALERT_THRESHOLD_LABEL_HIGH_ACTIVATIONS = 'High activations' as const
export const UI_ALERT_THRESHOLD_LABEL_HIGH_VALIDATIONS = 'High validations' as const
export const UI_ALERT_THRESHOLD_LABEL_HIGH_CONCURRENCY = 'High concurrency' as const
export const UI_ALERT_THRESHOLD_LABEL_MEDIUM_ACTIVATIONS = 'Medium activations' as const
export const UI_ALERT_THRESHOLD_LABEL_MEDIUM_VALIDATIONS = 'Medium validations' as const
export const UI_ALERT_THRESHOLD_LABEL_MEDIUM_CONCURRENCY = 'Medium concurrency' as const
export const UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_ACTIVATIONS = 'alert-high-activations' as const
export const UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_VALIDATIONS = 'alert-high-validations' as const
export const UI_ALERT_THRESHOLD_SUMMARY_ID_HIGH_CONCURRENCY = 'alert-high-concurrency' as const
export const UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_ACTIVATIONS = 'alert-medium-activations' as const
export const UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_VALIDATIONS = 'alert-medium-validations' as const
export const UI_ALERT_THRESHOLD_SUMMARY_ID_MEDIUM_CONCURRENCY = 'alert-medium-concurrency' as const
export const UI_COLUMN_ID_ANALYTICS_PERIOD = 'analytics-period' as const
export const UI_COLUMN_ID_ANALYTICS_TENANT = 'analytics-tenant-id' as const
export const UI_COLUMN_ID_ANALYTICS_LICENSE = 'analytics-license-id' as const
export const UI_COLUMN_ID_ANALYTICS_LICENSE_KEY = 'analytics-license-key' as const
export const UI_COLUMN_ID_ANALYTICS_CUSTOMER_EMAIL = 'analytics-customer-email' as const
export const UI_COLUMN_ID_ANALYTICS_ACTIVATIONS = 'analytics-activations' as const
export const UI_COLUMN_ID_ANALYTICS_VALIDATIONS = 'analytics-validations' as const
export const UI_COLUMN_ID_ANALYTICS_USAGE_REPORTS = 'analytics-usage-reports' as const
export const UI_COLUMN_ID_ANALYTICS_UNIQUE_DOMAINS = 'analytics-unique-domains' as const
export const UI_COLUMN_ID_ANALYTICS_UNIQUE_IPS = 'analytics-unique-ips' as const
export const UI_COLUMN_ID_ANALYTICS_PEAK_CONCURRENCY = 'analytics-peak-concurrency' as const
export const UI_COLUMN_ID_ANALYTICS_LAST_ACTIVATED = 'analytics-last-activated' as const
export const UI_PAGE_PLACEHOLDER_TITLE = 'Screen assembly in progress' as const
export const UI_PAGE_PLACEHOLDER_BODY =
  'These flows are still being composed into full screens. Continue building out the primitives to unlock this view.' as const
export const UI_PAGE_TITLE_LICENSES = 'License operations' as const
export const UI_PAGE_SUBTITLE_LICENSES = 'Manage issuance, freezes, and revocations for customers.' as const
export const UI_PAGE_TITLE_PRODUCTS = 'Product catalog' as const
export const UI_PAGE_SUBTITLE_PRODUCTS = 'Define product tiers, entitlements, and packaging rules.' as const
export const UI_PAGE_TITLE_RELEASES = 'Plugin releases' as const
export const UI_PAGE_SUBTITLE_RELEASES = 'Upload and manage plugin release files for products.' as const
export const UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER = 'Select a product' as const
export const UI_RELEASE_SELECT_PRODUCT_BODY = 'Choose a product to view and manage its plugin releases.' as const
export const UI_RELEASE_BUTTON_NEW = 'New release' as const
export const UI_RELEASE_FORM_TITLE = 'Upload release' as const
export const UI_RELEASE_FORM_FIELD_VERSION = 'Version (semver)' as const
export const UI_RELEASE_FORM_FIELD_FILE = 'Plugin ZIP file' as const
export const UI_RELEASE_FORM_FIELD_CHANGELOG = 'Changelog (Markdown)' as const
export const UI_RELEASE_FORM_FIELD_PRERELEASE = 'Pre-release' as const
export const UI_RELEASE_FORM_VERSION_PLACEHOLDER = '1.0.0' as const
export const UI_RELEASE_FORM_SUBMIT = 'Upload release' as const
export const UI_RELEASE_FORM_PENDING = 'Uploading…' as const
export const UI_RELEASE_EMPTY_MESSAGE = 'No releases yet. Upload a plugin ZIP to create one.' as const
export const UI_RELEASE_STATUS_LOADING_TITLE = 'Loading releases' as const
export const UI_RELEASE_STATUS_LOADING_BODY = 'Fetching release list for this product.' as const
export const UI_RELEASE_STATUS_ERROR_TITLE = 'Unable to load releases' as const
export const UI_RELEASE_STATUS_ERROR_BODY = 'Please try again after refreshing the page.' as const
export const UI_RELEASE_STATUS_ACTION_RETRY = 'Retry' as const
export const UI_RELEASE_COLUMN_VERSION = 'Version' as const
export const UI_RELEASE_COLUMN_FILE = 'File' as const
export const UI_RELEASE_COLUMN_SIZE = 'Size' as const
export const UI_RELEASE_COLUMN_CREATED = 'Created' as const
export const UI_RELEASE_COLUMN_STATUS = 'Status' as const
export const UI_RELEASE_COLUMN_ACTIONS = 'Actions' as const
export const UI_RELEASE_LIVE_BADGE = 'Live' as const
export const UI_RELEASE_ACTION_PROMOTE = 'Set as Live' as const
export const UI_RELEASE_ACTION_PROMOTING = 'Setting…' as const
export const UI_RELEASE_SORT_VERSION = 'Version' as const
export const UI_RELEASE_SORT_DATE = 'Date' as const
export const UI_RELEASE_SORT_ASC = 'Ascending' as const
export const UI_RELEASE_SORT_DESC = 'Descending' as const
export const UI_RELEASE_FILTER_ALL = 'All releases' as const
export const UI_RELEASE_FILTER_PRERELEASE_ONLY = 'Pre-releases only' as const
export const UI_RELEASE_FILTER_STABLE_ONLY = 'Stable only' as const
export const UI_RELEASE_CONFIRM_PROMOTE_TITLE = 'Set as live release?' as const
export const UI_RELEASE_CONFIRM_PROMOTE_BODY = 'Clients will receive this release for downloads and updates.' as const
export const UI_RELEASE_VERSION_PREFIX = 'v' as const
export const UI_RELEASE_MODAL_CANCEL = 'Cancel' as const
export const UI_PAGE_TITLE_TENANTS = 'Tenants & quotas' as const
export const UI_PAGE_SUBTITLE_TENANTS = 'Inspect tenant quotas, usage, and backups.' as const
export const UI_PAGE_TITLE_USERS = 'Admin users' as const
export const UI_PAGE_SUBTITLE_USERS = 'Review who can access the admin panel and their roles.' as const
export const UI_PAGE_TITLE_ANALYTICS = 'Analytics & usage' as const
export const UI_PAGE_SUBTITLE_ANALYTICS = 'Explore high-level usage trends and activation data.' as const
export const UI_PAGE_TITLE_HEALTH = 'Platform health' as const
export const UI_PAGE_SUBTITLE_HEALTH = 'Monitor service heartbeats and reliability signals.' as const
export const UI_PAGE_TITLE_AUDIT = 'Audit trail' as const
export const UI_PAGE_SUBTITLE_AUDIT = 'Trace administrative changes and verify the audit chain.' as const

export const UI_USER_FORM_TITLE_CREATE = 'Create User' as const
export const UI_USER_FORM_TITLE_UPDATE = 'Update User' as const
export const UI_USER_FORM_ID_CREATE = 'create-user' as const
export const UI_USER_FORM_ID_UPDATE = 'update-user' as const
export const UI_USER_FORM_SECTION_DETAILS = 'details' as const
export const UI_USER_FORM_SECTION_IDENTITY = 'identity' as const
export const UI_USER_FORM_SECTION_ACCESS = 'access' as const
export const UI_USER_FORM_SECTION_TITLE_IDENTITY = 'Identity' as const
export const UI_USER_FORM_SECTION_DESCRIPTION_IDENTITY = 'Basic account information for the user.' as const
export const UI_USER_FORM_SECTION_TITLE_ACCESS = 'Access & Permissions' as const
export const UI_USER_FORM_SECTION_DESCRIPTION_ACCESS = 'Control what this user can see and do.' as const
export const UI_USER_FIELD_LABEL_STATUS = 'Status' as const
export const UI_USER_BUTTON_CREATE = 'Create User' as const
export const UI_USER_BUTTON_EDIT = 'Edit' as const
export const UI_USER_BUTTON_SAVE = 'Save user' as const
export const UI_USER_BUTTON_DELETE = 'Delete User' as const
export const UI_USER_FORM_SUBMIT_CREATE = 'Create user' as const
export const UI_USER_FORM_SUBMIT_UPDATE = 'Save user' as const
export const UI_USER_ACTION_EDIT = 'Edit User' as const
export const UI_USER_ACTION_DELETE = 'Delete User' as const
export const UI_USER_STATUS_ACTION_RETRY = 'Retry' as const
export const UI_USER_STATUS_LOADING_TITLE = 'Loading users' as const
export const UI_USER_STATUS_LOADING_BODY = 'Fetching the latest user accounts.' as const
export const UI_USER_STATUS_ERROR_TITLE = 'Unable to load users' as const
export const UI_USER_STATUS_ERROR_BODY = 'Please try again after refreshing the page.' as const
export const UI_ENTITY_USER = 'User' as const
export const UI_USER_COLUMN_ID_USERNAME = 'user-column-username' as const
export const UI_USER_COLUMN_ID_EMAIL = 'user-column-email' as const
export const UI_USER_COLUMN_ID_ROLE = 'user-column-role' as const
export const UI_USER_COLUMN_ID_VENDOR = 'user-column-vendor' as const
export const UI_USER_COLUMN_ID_ACTIONS = 'user-column-actions' as const
export const UI_USER_COLUMN_ID_STATUS = 'user-status' as const
export const UI_USER_COLUMN_HEADER_USERNAME = 'Username' as const
export const UI_USER_COLUMN_HEADER_EMAIL = 'Email' as const
export const UI_USER_COLUMN_HEADER_ROLE = 'Role' as const
export const UI_USER_COLUMN_HEADER_VENDOR = 'Vendor' as const
export const UI_USER_COLUMN_HEADER_ACTIONS = 'Actions' as const
export const UI_USER_COLUMN_HEADER_STATUS = 'Status' as const
export const UI_USER_EMPTY_STATE_MESSAGE = 'No users yet' as const
export const UI_USER_STATUS_ACTIVE = 'ACTIVE' as const
export const UI_USER_STATUS_DISABLED = 'DISABLED' as const
export const UI_USER_STATUS_DELETED = 'DELETED' as const
export const UI_USER_STATUS_LABEL_ACTIVE = 'Active' as const
export const UI_USER_STATUS_LABEL_DISABLED = 'Disabled' as const
export const UI_USER_STATUS_LABEL_DELETED = 'Deleted' as const
export const UI_USER_TOAST_CREATE_SUCCESS = 'User created successfully' as const
export const UI_USER_TOAST_UPDATE_SUCCESS = 'User updated successfully' as const
export const UI_USER_TOAST_DELETE_SUCCESS = 'User deleted successfully' as const
export const UI_USER_CONFIRM_DELETE_TITLE = 'Delete user?' as const
export const UI_USER_CONFIRM_DELETE_BODY =
  'Deleting a user will disable their access. You can restore them later by changing their status.' as const
export const UI_USER_CONFIRM_DELETE_CONFIRM = 'Delete user' as const
export const UI_USER_CONFIRM_DELETE_CANCEL = 'Cancel' as const
export const UI_USER_ROLE_SUPERUSER = 'SUPERUSER' as const
export const UI_USER_ROLE_ADMIN = 'ADMIN' as const
export const UI_USER_ROLE_VENDOR_MANAGER = 'VENDOR_MANAGER' as const
export const UI_USER_ROLE_VENDOR_ADMIN = 'VENDOR_ADMIN' as const
export const UI_USER_ROLE_VIEWER = 'VIEWER' as const
export const UI_USER_ROLE_API_READ_ONLY = 'API_READ_ONLY' as const
export const UI_USER_ROLE_API_VENDOR_WRITE = 'API_VENDOR_WRITE' as const
export const UI_USER_ROLE_API_CONSUMER_ACTIVATE = 'API_CONSUMER_ACTIVATE' as const
export const UI_USER_ROLE_LABEL_SUPERUSER = 'Superuser' as const
export const UI_USER_ROLE_LABEL_ADMIN = 'Admin' as const
export const UI_USER_ROLE_LABEL_VENDOR_MANAGER = 'Vendor manager' as const
export const UI_USER_ROLE_LABEL_VENDOR_ADMIN = 'Vendor admin' as const
export const UI_USER_ROLE_LABEL_VIEWER = 'Viewer' as const
export const UI_USER_ROLE_LABEL_API_READ_ONLY = 'API read-only' as const
export const UI_USER_ROLE_LABEL_API_VENDOR_WRITE = 'API vendor write' as const
export const UI_USER_ROLE_LABEL_API_CONSUMER_ACTIVATE = 'API consumer activate' as const
export const UI_USER_VENDOR_PLACEHOLDER = 'Select vendor' as const
export const UI_USER_FIELD_LABEL_ROLE = 'Role' as const
export const UI_USER_FIELD_LABEL_VENDOR = 'Vendor' as const

export const UI_TENANT_FORM_TITLE_CREATE = 'Create Tenant' as const
export const UI_TENANT_FORM_TITLE_UPDATE = 'Update Tenant' as const
export const UI_TENANT_FORM_ID_CREATE = 'create-tenant' as const
export const UI_TENANT_FORM_ID_UPDATE = 'update-tenant' as const
export const UI_TENANT_FORM_SECTION_DETAILS = 'tenant-details' as const
export const UI_TENANT_BUTTON_CREATE = 'Create Tenant' as const
export const UI_TENANT_BUTTON_EDIT = 'Edit' as const
export const UI_TENANT_BUTTON_SAVE = 'Save tenant' as const
export const UI_TENANT_BUTTON_SUSPEND = 'Suspend Tenant' as const
export const UI_TENANT_BUTTON_RESUME = 'Resume Tenant' as const
export const UI_TENANT_FORM_SUBMIT_CREATE = 'Create tenant' as const
export const UI_TENANT_FORM_SUBMIT_UPDATE = 'Save tenant' as const
export const UI_TENANT_ACTION_EDIT = 'Edit Tenant' as const
export const UI_TENANT_ACTION_SUSPEND = 'Suspend Tenant' as const
export const UI_TENANT_ACTION_RESUME = 'Resume Tenant' as const
export const UI_TENANT_COLUMN_ID_NAME = 'tenant-column-name' as const
export const UI_TENANT_COLUMN_ID_STATUS = 'tenant-column-status' as const
export const UI_TENANT_COLUMN_ID_CREATED = 'tenant-column-created' as const
export const UI_TENANT_COLUMN_ID_ACTIONS = 'tenant-column-actions' as const
export const UI_TENANT_COLUMN_HEADER_NAME = 'Name' as const
export const UI_TENANT_COLUMN_HEADER_STATUS = 'Status' as const
export const UI_TENANT_COLUMN_HEADER_CREATED = 'Created' as const
export const UI_TENANT_COLUMN_HEADER_ACTIONS = 'Actions' as const
export const UI_TENANT_EMPTY_STATE_MESSAGE = 'No tenants yet' as const
export const UI_TENANT_STATUS_ACTION_RETRY = 'Retry' as const
export const UI_TENANT_STATUS_LOADING_TITLE = 'Loading tenants' as const
export const UI_TENANT_STATUS_LOADING_BODY = 'Fetching the latest tenant list.' as const
export const UI_TENANT_STATUS_ERROR_TITLE = 'Unable to load tenants' as const
export const UI_TENANT_STATUS_ERROR_BODY = 'Please try again after refreshing the page.' as const
export const UI_TENANT_STATUS_ACTIVE = 'ACTIVE' as const
export const UI_TENANT_STATUS_SUSPENDED = 'SUSPENDED' as const
export const UI_TENANT_STATUS_LABEL_ACTIVE = 'Active' as const
export const UI_TENANT_STATUS_LABEL_SUSPENDED = 'Suspended' as const
export const UI_TENANT_TOAST_CREATE_SUCCESS = 'Tenant created successfully' as const
export const UI_TENANT_TOAST_UPDATE_SUCCESS = 'Tenant updated successfully' as const
export const UI_TENANT_TOAST_SUSPEND_SUCCESS = 'Tenant suspended successfully' as const
export const UI_TENANT_TOAST_RESUME_SUCCESS = 'Tenant resumed successfully' as const
export const UI_TENANT_TOAST_DELETE_SUCCESS = 'Tenant deleted successfully' as const

export const UI_TENANT_CONFIRM_SUSPEND_TITLE = 'Suspend tenant?' as const
export const UI_TENANT_CONFIRM_SUSPEND_BODY =
  'Suspending a tenant will block all API access and license validations immediately. You can resume it later.' as const
export const UI_TENANT_CONFIRM_SUSPEND_CONFIRM = 'Suspend tenant' as const
export const UI_TENANT_CONFIRM_SUSPEND_CANCEL = 'Cancel' as const
export const UI_TENANT_CONFIRM_RESUME_TITLE = 'Resume tenant?' as const
export const UI_TENANT_CONFIRM_RESUME_BODY =
  'Resuming this tenant will immediately restore API access and license validation services.' as const
export const UI_TENANT_CONFIRM_RESUME_CONFIRM = 'Resume tenant' as const
export const UI_TENANT_CONFIRM_RESUME_CANCEL = 'Cancel' as const

export const UI_TENANT_QUOTA_FORM_ID = 'tenant-quota' as const
export const UI_TENANT_QUOTA_FORM_TITLE = 'Tenant Quotas' as const
export const UI_TENANT_QUOTA_SECTION_LIMITS = 'limits' as const

export const UI_PRODUCT_FORM_TITLE_CREATE = 'Create Product' as const
export const UI_PRODUCT_FORM_DESCRIPTION_CREATE =
  'Define the product basics. You can add tiers and entitlements after creation.' as const
export const UI_PRODUCT_FORM_TITLE_UPDATE = 'Update Product' as const
export const UI_PRODUCT_FORM_ID_CREATE = 'create-product' as const
export const UI_PRODUCT_FORM_ID_UPDATE = 'update-product' as const
export const UI_PRODUCT_FORM_SECTION_DETAILS = 'product-details' as const
export const UI_PRODUCT_FORM_SECTION_DESCRIPTION = 'product-description' as const
export const UI_PRODUCT_BUTTON_CREATE = 'Create Product' as const
export const UI_PRODUCT_BUTTON_EDIT = 'Edit' as const
export const UI_PRODUCT_BUTTON_SAVE = 'Save product' as const
export const UI_PRODUCT_BUTTON_DELETE = 'Delete Product' as const
export const UI_PRODUCT_BUTTON_SUSPEND = 'Suspend Product' as const
export const UI_PRODUCT_BUTTON_RESUME = 'Resume Product' as const
export const UI_PRODUCT_FORM_SUBMIT_CREATE = 'Create product' as const
export const UI_PRODUCT_FORM_SUBMIT_UPDATE = 'Save product' as const
export const UI_PRODUCT_FORM_PENDING_CREATE = 'Creating product…' as const
export const UI_PRODUCT_FORM_PENDING_UPDATE = 'Saving product…' as const
export const UI_PRODUCT_ACTION_EDIT = 'Edit Product' as const
export const UI_PRODUCT_ACTION_DELETE = 'Delete Product' as const
export const UI_PRODUCT_ACTION_SUSPEND = 'Suspend Product' as const
export const UI_PRODUCT_ACTION_RESUME = 'Resume Product' as const
export const UI_PRODUCT_COLUMN_ID_NAME = 'product-column-name' as const
export const UI_PRODUCT_COLUMN_ID_SLUG = 'product-column-slug' as const
export const UI_PRODUCT_COLUMN_ID_STATUS = 'product-column-status' as const
export const UI_PRODUCT_COLUMN_ID_VENDOR = 'product-column-vendor' as const
export const UI_PRODUCT_COLUMN_ID_ACTIONS = 'product-column-actions' as const
export const UI_PRODUCT_COLUMN_HEADER_NAME = 'Name' as const
export const UI_PRODUCT_COLUMN_HEADER_SLUG = 'Slug' as const
export const UI_PRODUCT_COLUMN_HEADER_STATUS = 'Status' as const
export const UI_PRODUCT_COLUMN_HEADER_VENDOR = 'Vendor' as const
export const UI_PRODUCT_COLUMN_HEADER_ACTIONS = 'Actions' as const
export const UI_PRODUCT_EMPTY_STATE_MESSAGE = 'No products yet' as const
export const UI_PRODUCT_STATUS_ACTIVE = 'Active' as const
export const UI_PRODUCT_STATUS_SUSPENDED = 'Suspended' as const
export const UI_ENTITY_PRODUCT = 'Product' as const
export const UI_PRODUCT_STATUS_ACTION_RETRY = 'Retry' as const
export const UI_PRODUCT_STATUS_LOADING_TITLE = 'Loading products' as const
export const UI_PRODUCT_STATUS_LOADING_BODY = 'Fetching the latest product catalog.' as const
export const UI_PRODUCT_STATUS_ERROR_TITLE = 'Unable to load products' as const
export const UI_PRODUCT_STATUS_ERROR_BODY = 'Please try again after refreshing the page.' as const
export const UI_PRODUCT_TOAST_CREATE_SUCCESS = 'Product created successfully' as const
export const UI_PRODUCT_TOAST_UPDATE_SUCCESS = 'Product updated successfully' as const
export const UI_PRODUCT_TOAST_DELETE_SUCCESS = 'Product deleted successfully' as const
export const UI_PRODUCT_TOAST_SUSPEND_SUCCESS = 'Product suspended successfully' as const
export const UI_PRODUCT_TOAST_RESUME_SUCCESS = 'Product resumed successfully' as const

export const UI_PRODUCT_CONFIRM_DELETE_TITLE = 'Delete product?' as const
export const UI_PRODUCT_CONFIRM_DELETE_BODY =
  'Deleting a product will remove it permanently. This action cannot be undone.' as const
export const UI_PRODUCT_CONFIRM_DELETE_CONFIRM = 'Delete product' as const
export const UI_PRODUCT_CONFIRM_DELETE_CANCEL = 'Cancel' as const
export const UI_PRODUCT_CONFIRM_SUSPEND_TITLE = 'Suspend product?' as const
export const UI_PRODUCT_CONFIRM_SUSPEND_BODY =
  'Suspending a product will prevent new licenses from being created. Existing licenses will continue to work.' as const
export const UI_PRODUCT_CONFIRM_SUSPEND_CONFIRM = 'Suspend product' as const
export const UI_PRODUCT_CONFIRM_SUSPEND_CANCEL = 'Cancel' as const
export const UI_PRODUCT_CONFIRM_RESUME_TITLE = 'Resume product?' as const
export const UI_PRODUCT_CONFIRM_RESUME_BODY = 'Resuming this product will allow new licenses to be created.' as const
export const UI_PRODUCT_CONFIRM_RESUME_CONFIRM = 'Resume product' as const
export const UI_PRODUCT_CONFIRM_RESUME_CANCEL = 'Cancel' as const

export const UI_PRODUCT_TIER_FORM_TITLE_CREATE = 'Create Product Tier' as const
export const UI_PRODUCT_TIER_FORM_TITLE_UPDATE = 'Update Product Tier' as const
export const UI_PRODUCT_TIER_FORM_ID_CREATE = 'create-product-tier' as const
export const UI_PRODUCT_TIER_FORM_ID_UPDATE = 'update-product-tier' as const
export const UI_PRODUCT_TIER_FORM_SECTION_DETAILS = 'product-tier-details' as const
export const UI_PRODUCT_TIER_BUTTON_CREATE = 'Create Tier' as const
export const UI_PRODUCT_TIER_BUTTON_EDIT = 'Edit' as const
export const UI_PRODUCT_TIER_BUTTON_SAVE = 'Save tier' as const
export const UI_PRODUCT_TIER_BUTTON_DELETE = 'Delete Tier' as const
export const UI_PRODUCT_TIER_FORM_SUBMIT_CREATE = 'Create tier' as const
export const UI_PRODUCT_TIER_FORM_SUBMIT_UPDATE = 'Save tier' as const
export const UI_PRODUCT_TIER_FORM_PENDING_CREATE = 'Creating tier…' as const
export const UI_PRODUCT_TIER_FORM_PENDING_UPDATE = 'Saving tier…' as const
export const UI_PRODUCT_TIER_ACTION_EDIT = 'Edit Tier' as const
export const UI_PRODUCT_TIER_ACTION_DELETE = 'Delete Tier' as const
export const UI_PRODUCT_TIER_COLUMN_ID_NAME = 'product-tier-name' as const
export const UI_PRODUCT_TIER_COLUMN_ID_CODE = 'product-tier-code' as const
export const UI_PRODUCT_TIER_COLUMN_ID_ACTIONS = 'product-tier-actions' as const
export const UI_PRODUCT_TIER_COLUMN_HEADER_NAME = 'Name' as const
export const UI_PRODUCT_TIER_COLUMN_HEADER_CODE = 'Code' as const
export const UI_PRODUCT_TIER_COLUMN_HEADER_ACTIONS = 'Actions' as const
export const UI_PRODUCT_TIER_EMPTY_STATE_MESSAGE = 'No tiers defined' as const
export const UI_ENTITY_PRODUCT_TIER = 'Tier' as const
export const UI_PRODUCT_TIER_STATUS_ACTION_RETRY = 'Retry' as const
export const UI_PRODUCT_TIER_STATUS_LOADING_TITLE = 'Loading tiers' as const
export const UI_PRODUCT_TIER_STATUS_LOADING_BODY = 'Fetching the tiers for this product.' as const
export const UI_PRODUCT_TIER_STATUS_ERROR_TITLE = 'Unable to load tiers' as const
export const UI_PRODUCT_TIER_STATUS_ERROR_BODY = 'Please try again after refreshing the page.' as const
export const UI_PRODUCT_TIER_TOAST_CREATE_SUCCESS = 'Tier created successfully' as const
export const UI_PRODUCT_TIER_TOAST_UPDATE_SUCCESS = 'Tier updated successfully' as const
export const UI_PRODUCT_TIER_TOAST_DELETE_SUCCESS = 'Tier deleted successfully' as const

export const UI_PRODUCT_TIER_CONFIRM_DELETE_TITLE = 'Delete tier?' as const
export const UI_PRODUCT_TIER_CONFIRM_DELETE_BODY =
  'Deleting a tier will remove it permanently. This action cannot be undone.' as const
export const UI_PRODUCT_TIER_CONFIRM_DELETE_CONFIRM = 'Delete tier' as const
export const UI_PRODUCT_TIER_CONFIRM_DELETE_CANCEL = 'Cancel' as const

export const UI_ENTITLEMENT_FORM_TITLE_CREATE = 'Create Entitlement' as const
export const UI_ENTITLEMENT_FORM_TITLE_UPDATE = 'Update Entitlement' as const
export const UI_ENTITLEMENT_FORM_ID_CREATE = 'create-entitlement' as const
export const UI_ENTITLEMENT_FORM_ID_UPDATE = 'update-entitlement' as const
export const UI_ENTITLEMENT_FORM_SECTION_DETAILS = 'entitlement-details' as const
export const UI_ENTITLEMENT_BUTTON_CREATE = 'Create Entitlement' as const
export const UI_ENTITLEMENT_BUTTON_EDIT = 'Edit' as const
export const UI_ENTITLEMENT_BUTTON_SAVE = 'Save entitlement' as const
export const UI_ENTITLEMENT_BUTTON_DELETE = 'Delete Entitlement' as const
export const UI_ENTITLEMENT_FORM_SUBMIT_CREATE = 'Create entitlement' as const
export const UI_ENTITLEMENT_FORM_SUBMIT_UPDATE = 'Save entitlement' as const
export const UI_ENTITLEMENT_FORM_PENDING_CREATE = 'Creating entitlement…' as const
export const UI_ENTITLEMENT_FORM_PENDING_UPDATE = 'Saving entitlement…' as const
export const UI_ENTITLEMENT_ACTION_EDIT = 'Edit Entitlement' as const
export const UI_ENTITLEMENT_ACTION_DELETE = 'Delete Entitlement' as const
export const UI_ENTITLEMENT_COLUMN_ID_KEY = 'entitlement-key' as const
export const UI_ENTITLEMENT_COLUMN_ID_VALUE_TYPE = 'entitlement-value-type' as const
export const UI_ENTITLEMENT_COLUMN_ID_DEFAULT_VALUE = 'entitlement-default-value' as const
export const UI_ENTITLEMENT_COLUMN_ID_USAGE_LIMIT = 'entitlement-usage-limit' as const
export const UI_ENTITLEMENT_COLUMN_ID_ACTIONS = 'entitlement-actions' as const
export const UI_ENTITLEMENT_COLUMN_HEADER_KEY = 'Key' as const
export const UI_ENTITLEMENT_COLUMN_HEADER_VALUE_TYPE = 'Value Type' as const
export const UI_ENTITLEMENT_COLUMN_HEADER_DEFAULT_VALUE = 'Default Value' as const
export const UI_ENTITLEMENT_COLUMN_HEADER_USAGE_LIMIT = 'Usage Limit' as const
export const UI_ENTITLEMENT_COLUMN_HEADER_ACTIONS = 'Actions' as const
export const UI_ENTITLEMENT_EMPTY_STATE_MESSAGE = 'No entitlements defined' as const
export const UI_ENTITY_ENTITLEMENT = 'Entitlement' as const
export const UI_ENTITLEMENT_STATUS_ACTION_RETRY = 'Retry' as const
export const UI_ENTITLEMENT_STATUS_LOADING_TITLE = 'Loading entitlements' as const
export const UI_ENTITLEMENT_STATUS_LOADING_BODY = 'Fetching entitlements for this product.' as const
export const UI_ENTITLEMENT_STATUS_ERROR_TITLE = 'Unable to load entitlements' as const
export const UI_ENTITLEMENT_STATUS_ERROR_BODY = 'Please try again after refreshing the page.' as const
export const UI_PRODUCT_ENTITLEMENT_TOAST_CREATE_SUCCESS = 'Entitlement created successfully' as const
export const UI_PRODUCT_ENTITLEMENT_TOAST_UPDATE_SUCCESS = 'Entitlement updated successfully' as const
export const UI_PRODUCT_ENTITLEMENT_TOAST_DELETE_SUCCESS = 'Entitlement deleted successfully' as const

export const UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_TITLE = 'Delete entitlement?' as const
export const UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_BODY =
  'Deleting an entitlement will remove it permanently. This action cannot be undone.' as const
export const UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_CONFIRM = 'Delete entitlement' as const
export const UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_CANCEL = 'Cancel' as const

export const UI_LICENSE_FORM_TITLE_CREATE = 'Create License' as const
export const UI_LICENSE_FORM_DESCRIPTION_CREATE =
  'Issue a new license to a customer. You can manage activations and limits after creation.' as const
export const UI_LICENSE_FORM_TITLE_UPDATE = 'Update License' as const
export const UI_LICENSE_FORM_ID_CREATE = 'create-license' as const
export const UI_LICENSE_FORM_ID_UPDATE = 'update-license' as const
export const UI_LICENSE_FORM_SECTION_DETAILS = 'license-details' as const
export const UI_LICENSE_FORM_SECTION_LIMITS = 'license-limits' as const
export const UI_LICENSE_FORM_SECTION_METADATA = 'license-metadata' as const
export const UI_LICENSE_FORM_PLACEHOLDER_DOMAIN = 'example.com, *.example.com, a.com,b.com (blank=any)' as const
export const UI_LICENSE_BUTTON_CREATE = 'Create License' as const
export const UI_LICENSE_BUTTON_EDIT = 'Edit license' as const
export const UI_LICENSE_BUTTON_SAVE = 'Save license' as const
export const UI_LICENSE_BUTTON_DELETE = 'Revoke License' as const
export const UI_LICENSE_BUTTON_SUSPEND = 'Suspend License' as const
export const UI_LICENSE_BUTTON_RESUME = 'Resume License' as const
export const UI_LICENSE_FORM_SUBMIT_CREATE = 'Create license' as const
export const UI_LICENSE_FORM_SUBMIT_UPDATE = 'Save license' as const
export const UI_LICENSE_FORM_PENDING_CREATE = 'Creating license…' as const
export const UI_LICENSE_FORM_PENDING_UPDATE = 'Saving license…' as const
export const UI_LICENSE_ACTION_EDIT = 'Edit License' as const
export const UI_LICENSE_ACTION_DELETE = 'Revoke License' as const
export const UI_LICENSE_ACTION_SUSPEND = 'Suspend License' as const
export const UI_LICENSE_ACTION_RESUME = 'Resume License' as const
export const UI_LICENSE_COLUMN_ID_CUSTOMER = 'license-customer-email' as const
export const UI_LICENSE_COLUMN_ID_PRODUCT = 'license-product-slug' as const
export const UI_LICENSE_COLUMN_ID_DOMAIN = 'license-domain' as const
export const UI_LICENSE_COLUMN_ID_TIER = 'license-tier-code' as const
export const UI_LICENSE_COLUMN_ID_STATUS = 'license-status' as const
export const UI_LICENSE_COLUMN_ID_ACTIONS = 'license-actions' as const
export const UI_LICENSE_COLUMN_HEADER_CUSTOMER = 'Customer' as const
export const UI_LICENSE_COLUMN_HEADER_PRODUCT = 'Product' as const
export const UI_LICENSE_COLUMN_HEADER_DOMAIN = 'Domain' as const
export const UI_LICENSE_COLUMN_HEADER_TIER = 'Tier' as const
export const UI_LICENSE_COLUMN_HEADER_STATUS = 'Status' as const
export const UI_LICENSE_COLUMN_HEADER_ACTIONS = 'Actions' as const
export const UI_LICENSE_EMPTY_STATE_MESSAGE = 'No licenses yet' as const
export const UI_LICENSE_STATUS_ACTIVE = 'ACTIVE' as const
export const UI_LICENSE_STATUS_INACTIVE = 'INACTIVE' as const
export const UI_LICENSE_STATUS_SUSPENDED = 'SUSPENDED' as const
export const UI_LICENSE_STATUS_REVOKED = 'REVOKED' as const
export const UI_ENTITY_LICENSE = 'License' as const
export const UI_LICENSE_STATUS_ACTION_RETRY = 'Retry' as const
export const UI_LICENSE_STATUS_LOADING_TITLE = 'Loading licenses' as const
export const UI_LICENSE_STATUS_LOADING_BODY = 'Fetching the latest licenses.' as const
export const UI_LICENSE_STATUS_ERROR_TITLE = 'Unable to load licenses' as const
export const UI_LICENSE_STATUS_ERROR_BODY = 'Please try again after refreshing the page.' as const
export const UI_LICENSE_TOAST_CREATE_SUCCESS = 'License created successfully' as const
export const UI_LICENSE_TOAST_UPDATE_SUCCESS = 'License updated successfully' as const
export const UI_LICENSE_TOAST_DELETE_SUCCESS = 'License revoked successfully' as const
export const UI_LICENSE_TOAST_SUSPEND_SUCCESS = 'License suspended successfully' as const
export const UI_LICENSE_TOAST_RESUME_SUCCESS = 'License resumed successfully' as const

export const UI_LICENSE_CONFIRM_DELETE_TITLE = 'Revoke license?' as const
export const UI_LICENSE_CONFIRM_DELETE_BODY =
  'Revoking a license will permanently disable it. This action cannot be undone.' as const
export const UI_LICENSE_CONFIRM_DELETE_CONFIRM = 'Revoke license' as const
export const UI_LICENSE_CONFIRM_DELETE_CANCEL = 'Cancel' as const
export const UI_LICENSE_CONFIRM_SUSPEND_TITLE = 'Suspend license?' as const
export const UI_LICENSE_CONFIRM_SUSPEND_BODY =
  'Suspending a license will temporarily block validations. You can resume it later.' as const
export const UI_LICENSE_CONFIRM_SUSPEND_CONFIRM = 'Suspend license' as const
export const UI_LICENSE_CONFIRM_SUSPEND_CANCEL = 'Cancel' as const
export const UI_LICENSE_CONFIRM_RESUME_TITLE = 'Resume license?' as const
export const UI_LICENSE_CONFIRM_RESUME_BODY =
  'Resuming this license will immediately restore validation services.' as const
export const UI_LICENSE_CONFIRM_RESUME_CONFIRM = 'Resume license' as const
export const UI_LICENSE_CONFIRM_RESUME_CANCEL = 'Cancel' as const

export const UI_LICENSE_FREEZE_BUTTON_OPEN = 'Freeze license' as const
export const UI_LICENSE_FREEZE_BUTTON_SUBMIT = 'Freeze license' as const
export const UI_LICENSE_FREEZE_BUTTON_PENDING = 'Freezing…' as const

export const UI_ACTIVATION_COLUMN_ID_DOMAIN = 'activation-domain' as const
export const UI_ACTIVATION_COLUMN_ID_SITE = 'activation-site' as const
export const UI_ACTIVATION_COLUMN_ID_STATUS = 'activation-status' as const
export const UI_ACTIVATION_COLUMN_ID_ACTIVATED_AT = 'activation-activated-at' as const
export const UI_ACTIVATION_COLUMN_ID_LAST_SEEN = 'activation-last-seen' as const
export const UI_ACTIVATION_COLUMN_ID_IP = 'activation-ip' as const
export const UI_ACTIVATION_COLUMN_ID_REGION = 'activation-region' as const
export const UI_ACTIVATION_COLUMN_ID_CLIENT_VERSION = 'activation-client-version' as const
export const UI_ACTIVATION_COLUMN_HEADER_DOMAIN = 'Domain' as const
export const UI_ACTIVATION_COLUMN_HEADER_SITE = 'Site' as const
export const UI_ACTIVATION_COLUMN_HEADER_STATUS = 'Status' as const
export const UI_ACTIVATION_COLUMN_HEADER_ACTIVATED_AT = 'Activated' as const
export const UI_ACTIVATION_COLUMN_HEADER_LAST_SEEN = 'Last seen' as const
export const UI_ACTIVATION_COLUMN_HEADER_IP = 'IP Address' as const
export const UI_ACTIVATION_COLUMN_HEADER_REGION = 'Region' as const
export const UI_ACTIVATION_COLUMN_HEADER_CLIENT_VERSION = 'Client version' as const
export const UI_ACTIVATION_EMPTY_STATE_MESSAGE = 'No activations yet' as const
export const UI_ACTIVATION_STATUS_ACTIVE = 'ACTIVE' as const
export const UI_ACTIVATION_STATUS_SUSPENDED = 'SUSPENDED' as const
export const UI_ACTIVATION_STATUS_REVOKED = 'REVOKED' as const
export const UI_ENTITY_ACTIVATION = 'Activation' as const

export const UI_CLASS_CARD_LIST_GRID = 'row g-4'
export const UI_CLASS_CARD_LIST_CARD = 'h-100 shadow-sm'
export const UI_CLASS_CARD_COLUMN_MAP: Record<number, string> = {
  [UI_FORM_ROW_COLUMNS_TWO]: 'col-md-6',
  [UI_FORM_ROW_COLUMNS_THREE]: 'col-md-4',
}
export const UI_ARIA_LABEL_CARD_LIST = 'Card list'

export const UI_CLASS_TAG_LIST = 'list-unstyled d-flex flex-wrap gap-2'
export const UI_CLASS_CHIP = 'badge rounded-pill d-inline-flex align-items-center gap-2'
export const UI_CLASS_CHIP_REMOVE_BUTTON = 'btn-close btn-close-white btn-sm'
export const UI_ARIA_LABEL_TAG_LIST = 'Tag list'
export const UI_ARIA_LABEL_REMOVE_CHIP = 'Remove item'

export const UI_CLASS_HEADER_NAV_LIST = 'nav nav-pills flex-wrap align-items-center gap-2 mb-0'
export const UI_CLASS_HEADER_NAV_LINK = 'nav-link px-3 py-1 fw-semibold text-nowrap'
export const UI_CLASS_HEADER_ACTIONS = 'd-flex flex-wrap align-items-center gap-2'
export const UI_ARIA_LABEL_PRIMARY_NAV = 'Primary navigation'
export const UI_ARIA_LABEL_USER_ACTIONS = 'User actions'
export const UI_TEST_ID_HEADER = `${UI_TEST_ID_PREFIX}header`
export const UI_TEST_ID_HEADER_NAV = `${UI_TEST_ID_PREFIX}header-nav`
export const UI_TEST_ID_HEADER_ACTIONS = `${UI_TEST_ID_PREFIX}header-actions`
export const UI_HEADER_ACTION_CHANGE_PASSWORD = 'Account'
export const UI_HEADER_ACTION_SIGN_OUT = 'Sign out'
export const UI_HEADER_MODAL_TITLE_CHANGE_PASSWORD = 'Secure your account'
export const UI_HEADER_SIGN_OUT_LABEL = 'Sign out'
export const UI_HEADER_SIGN_OUT_PENDING = 'Signing out…'
export const UI_HEADER_SIGN_OUT_TOAST_SUCCESS = 'Signed out successfully'
export const UI_HEADER_SIGN_OUT_TOAST_ERROR = 'Unable to sign out'
export const UI_CHANGE_PASSWORD_HEADING = 'Update your credentials' as const
export const UI_CHANGE_PASSWORD_DESCRIPTION = 'Update your password or email to keep your account secure.' as const
export const UI_CHANGE_PASSWORD_SECTION_TITLE = 'Security update' as const
export const UI_CHANGE_PASSWORD_SECTION_DESCRIPTION =
  'Provide the fields you want to update. You can change your password, email, or both.' as const
export const UI_CHANGE_PASSWORD_LABEL_CURRENT_PASSWORD = 'Current password' as const
export const UI_CHANGE_PASSWORD_LABEL_NEW_PASSWORD = 'New password' as const
export const UI_CHANGE_PASSWORD_LABEL_CONFIRM_PASSWORD = 'Confirm new password' as const
export const UI_CHANGE_PASSWORD_LABEL_EMAIL = 'Email address' as const
export const UI_CHANGE_PASSWORD_BUTTON_UPDATE = 'Save changes' as const
export const UI_CHANGE_PASSWORD_BUTTON_UPDATING = 'Saving…' as const
export const UI_CHANGE_PASSWORD_TOAST_SUCCESS = 'Account settings updated successfully' as const
export const UI_CHANGE_PASSWORD_TOAST_ERROR = 'Unable to update account settings' as const
export const UI_CHANGE_PASSWORD_ERROR_TITLE = 'Update failed' as const
export const UI_CHANGE_PASSWORD_ERROR_GENERIC = 'Unable to update credentials. Please try again.' as const
export const UI_CHANGE_PASSWORD_ERROR_PASSWORDS_MATCH = 'Passwords must match' as const
export const UI_CHANGE_PASSWORD_ERROR_CONFIRM_REQUIRED = 'Please confirm your password' as const
export const UI_CHANGE_PASSWORD_ERROR_REQUIRED = 'Provide a new password, an email, or both to continue.' as const
export const UI_CHANGE_PASSWORD_ERROR_EMAIL_INVALID = 'Enter a valid email address.' as const
export const UI_CHANGE_PASSWORD_VALIDATION_CURRENT_PASSWORD = 'Current password' as const
export const UI_CHANGE_PASSWORD_VALIDATION_NEW_PASSWORD = 'New password' as const

export const UI_CLASS_SIDEBAR_NAV = 'nav flex-column gap-1'
export const UI_CLASS_SIDEBAR_NAV_LINK = 'nav-link d-flex align-items-center gap-2'
export const UI_CLASS_SIDEBAR_NAV_ACTIVE = 'active fw-semibold'
export const UI_ARIA_LABEL_SIDEBAR_NAV = 'Sidebar navigation'

export const UI_CLASS_TOP_NAV = 'navbar bg-body border-bottom shadow-sm'
export const UI_CLASS_TOP_NAV_CONTENT = 'container-fluid d-flex align-items-center gap-3'

export const UI_CLASS_BREADCRUMBS = 'breadcrumb mb-0'
export const UI_ARIA_LABEL_BREADCRUMBS = 'Breadcrumbs'

export const UI_CLASS_INLINE_ALERT = 'mb-3'

export const UI_CLASS_SECTION_STATUS =
  'd-flex flex-wrap align-items-center justify-content-between gap-3 p-3 border rounded'
export const UI_CLASS_SECTION_STATUS_CONTENT = 'd-flex flex-column gap-2'
export const UI_ARIA_LABEL_SECTION_STATUS = 'Section status'
export const UI_ARIA_CURRENT_PAGE = 'page'
export const UI_ARIA_MODAL_DIALOG = true
export const UI_ARIA_HIDDEN = true
export const UI_ARIA_LIVE_POLITE = 'polite'
export const UI_ARIA_SORT_NONE = 'none'
export const UI_ARIA_SORT_ASCENDING = 'ascending'
export const UI_ARIA_SORT_DESCENDING = 'descending'

export const UI_CLASS_MODAL_BODY = 'd-flex flex-column gap-3'
export const UI_CLASS_MODAL_ACTIONS = 'd-flex flex-wrap gap-2 justify-content-end'

export const UI_CLASS_SIDE_PANEL_BODY = 'd-flex flex-column gap-3'
export const UI_CLASS_SIDE_PANEL_ACTIONS = 'd-flex justify-content-end gap-2 mt-4'
export const UI_CLASS_SIDE_PANEL = 'bg-body border-start shadow-lg p-4 position-fixed top-0 h-100'
export const UI_ARIA_LABEL_CLOSE_SIDE_PANEL = 'Close side panel'

export const UI_CLASS_ACTION_MENU = 'd-inline-flex'
export const UI_TEST_ID_ACTION_MENU = `${UI_TEST_ID_PREFIX}action-menu`
export const UI_ACTION_MENU_TOGGLE_LABEL = 'Toggle actions' as const
export const UI_ACTION_MENU_TOGGLE_ICON = '⋮' as const
export const UI_ACTION_VERB_CREATE = 'Create' as const
export const UI_ACTION_VERB_UPDATE = 'Update' as const
export const UI_ACTION_VERB_DELETE = 'Delete' as const
export const UI_ACTION_VERB_SUSPEND = 'Suspend' as const
export const UI_ACTION_VERB_RESUME = 'Resume' as const
