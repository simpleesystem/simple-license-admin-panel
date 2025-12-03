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

export const UI_FORM_SELECT_PLACEHOLDER_VALUE = '' as const
export const UI_FORM_SELECT_PLACEHOLDER_DISABLED = true as const
export const UI_FORM_SELECT_PLACEHOLDER_HIDDEN = true as const
export const UI_FORM_TEXTAREA_MIN_ROWS = 3 as const

export const UI_TABLE_DENSITY_COMPACT = 'compact' as const
export const UI_TABLE_DENSITY_COMFORTABLE = 'comfortable' as const
export const UI_TABLE_DENSITY_SPACIOUS = 'spacious' as const

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
export const UI_CLASS_APP_SHELL_CONTENT = 'flex-grow-1'
export const UI_CLASS_APP_SHELL_HEADER = 'border-bottom bg-body'
export const UI_CLASS_APP_SHELL_FOOTER = 'border-top bg-body'

export const UI_CLASS_PAGE_BASE = 'py-4'
export const UI_CLASS_PAGE_CONSTRAINED = 'container'
export const UI_CLASS_PAGE_FULL_WIDTH = 'container-fluid'
export const UI_CLASS_PAGE_FULL_HEIGHT = 'min-vh-100'

export const UI_CLASS_PAGE_HEADER = 'd-flex flex-wrap align-items-center justify-content-between gap-3'
export const UI_CLASS_PAGE_HEADER_CONTENT = 'd-flex flex-column gap-1'
export const UI_CLASS_PAGE_HEADER_ACTIONS = 'd-flex flex-wrap gap-2'

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
export const UI_CLASS_FORM_FIELD_HINT = 'form-text text-muted'
export const UI_CLASS_FORM_FIELD_ERROR = 'text-danger mt-1'
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
