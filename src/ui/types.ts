import type { JSX, MouseEvent, PropsWithChildren, ReactNode } from 'react'
import type { FieldValues, Path } from 'react-hook-form'

import type { AbilityAction, AbilitySubject } from '../app/abilities/abilityMap'
import type { PermissionKey } from '../app/auth/permissions'
import type {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_INFO,
  UI_ALERT_VARIANT_SUCCESS,
  UI_ALERT_VARIANT_WARNING,
  UI_BADGE_VARIANT_DANGER,
  UI_BADGE_VARIANT_INFO,
  UI_BADGE_VARIANT_LIGHT,
  UI_BADGE_VARIANT_PRIMARY,
  UI_BADGE_VARIANT_SECONDARY,
  UI_BADGE_VARIANT_SUCCESS,
  UI_BADGE_VARIANT_WARNING,
  UI_BUTTON_VARIANT_GHOST,
  UI_BUTTON_VARIANT_OUTLINE,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_FORM_CHECK_TYPE_BOX,
  UI_FORM_CHECK_TYPE_SWITCH,
  UI_FORM_CONTROL_TYPE_DATE,
  UI_FORM_CONTROL_TYPE_EMAIL,
  UI_FORM_CONTROL_TYPE_NUMBER,
  UI_FORM_CONTROL_TYPE_PASSWORD,
  UI_FORM_CONTROL_TYPE_SEARCH,
  UI_FORM_CONTROL_TYPE_TEXT,
  UI_FORM_LAYOUT_HORIZONTAL,
  UI_FORM_LAYOUT_VERTICAL,
  UI_FORM_ROW_COLUMNS_THREE,
  UI_FORM_ROW_COLUMNS_TWO,
  UI_MODAL_BACKDROP_DISABLED,
  UI_MODAL_BACKDROP_ENABLED,
  UI_MODAL_BACKDROP_STATIC,
  UI_MODAL_SIZE_LG,
  UI_MODAL_SIZE_SM,
  UI_MODAL_SIZE_XL,
  UI_PAGE_VARIANT_CONSTRAINED,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_INFO,
  UI_SECTION_STATUS_LOADING,
  UI_SECTION_STATUS_SUCCESS,
  UI_SECTION_STATUS_WARNING,
  UI_SIDE_PANEL_PLACEMENT_END,
  UI_SIDE_PANEL_PLACEMENT_START,
  UI_SORT_ASC,
  UI_SORT_DESC,
  UI_STACK_ALIGN_CENTER,
  UI_STACK_ALIGN_END,
  UI_STACK_ALIGN_START,
  UI_STACK_ALIGN_STRETCH,
  UI_STACK_DIRECTION_COLUMN,
  UI_STACK_DIRECTION_ROW,
  UI_STACK_GAP_LARGE,
  UI_STACK_GAP_MEDIUM,
  UI_STACK_GAP_NONE,
  UI_STACK_GAP_SMALL,
  UI_STACK_JUSTIFY_BETWEEN,
  UI_STACK_JUSTIFY_CENTER,
  UI_STACK_JUSTIFY_END,
  UI_STACK_JUSTIFY_START,
  UI_TABLE_DENSITY_COMFORTABLE,
  UI_TABLE_DENSITY_COMPACT,
  UI_TABLE_DENSITY_SPACIOUS,
  UI_TAG_VARIANT_INFO,
  UI_TAG_VARIANT_NEUTRAL,
  UI_TAG_VARIANT_SUCCESS,
  UI_TAG_VARIANT_WARNING,
  UI_TEXT_ALIGN_CENTER,
  UI_TEXT_ALIGN_END,
  UI_TEXT_ALIGN_START,
  UI_VISIBILITY_MODE_DISABLE,
  UI_VISIBILITY_MODE_HIDE,
} from './constants'

export type UiTextAlign = typeof UI_TEXT_ALIGN_START | typeof UI_TEXT_ALIGN_CENTER | typeof UI_TEXT_ALIGN_END

export type UiStackDirection = typeof UI_STACK_DIRECTION_COLUMN | typeof UI_STACK_DIRECTION_ROW
export type UiStackGap =
  | typeof UI_STACK_GAP_NONE
  | typeof UI_STACK_GAP_SMALL
  | typeof UI_STACK_GAP_MEDIUM
  | typeof UI_STACK_GAP_LARGE
export type UiStackAlign =
  | typeof UI_STACK_ALIGN_START
  | typeof UI_STACK_ALIGN_CENTER
  | typeof UI_STACK_ALIGN_END
  | typeof UI_STACK_ALIGN_STRETCH
export type UiStackJustify =
  | typeof UI_STACK_JUSTIFY_START
  | typeof UI_STACK_JUSTIFY_CENTER
  | typeof UI_STACK_JUSTIFY_END
  | typeof UI_STACK_JUSTIFY_BETWEEN

export type UiPageVariant = typeof UI_PAGE_VARIANT_CONSTRAINED | typeof UI_PAGE_VARIANT_FULL_WIDTH

export type UiFormLayout = typeof UI_FORM_LAYOUT_VERTICAL | typeof UI_FORM_LAYOUT_HORIZONTAL
export type UiFormRowColumns = typeof UI_FORM_ROW_COLUMNS_TWO | typeof UI_FORM_ROW_COLUMNS_THREE
export type UiFormCheckType = typeof UI_FORM_CHECK_TYPE_BOX | typeof UI_FORM_CHECK_TYPE_SWITCH
export type UiFormControlTypeDate = typeof UI_FORM_CONTROL_TYPE_DATE
export type UiFormControlTextType =
  | typeof UI_FORM_CONTROL_TYPE_TEXT
  | typeof UI_FORM_CONTROL_TYPE_EMAIL
  | typeof UI_FORM_CONTROL_TYPE_PASSWORD
  | typeof UI_FORM_CONTROL_TYPE_NUMBER
  | typeof UI_FORM_CONTROL_TYPE_SEARCH

export type UiTableDensity =
  | typeof UI_TABLE_DENSITY_COMPACT
  | typeof UI_TABLE_DENSITY_COMFORTABLE
  | typeof UI_TABLE_DENSITY_SPACIOUS

export type UiSortDirection = typeof UI_SORT_ASC | typeof UI_SORT_DESC

export type UiBadgeVariant =
  | typeof UI_BADGE_VARIANT_PRIMARY
  | typeof UI_BADGE_VARIANT_SECONDARY
  | typeof UI_BADGE_VARIANT_SUCCESS
  | typeof UI_BADGE_VARIANT_INFO
  | typeof UI_BADGE_VARIANT_WARNING
  | typeof UI_BADGE_VARIANT_DANGER
  | typeof UI_BADGE_VARIANT_LIGHT

export type UiAlertVariant =
  | typeof UI_ALERT_VARIANT_INFO
  | typeof UI_ALERT_VARIANT_SUCCESS
  | typeof UI_ALERT_VARIANT_WARNING
  | typeof UI_ALERT_VARIANT_DANGER

export type UiSectionStatusVariant =
  | typeof UI_SECTION_STATUS_SUCCESS
  | typeof UI_SECTION_STATUS_INFO
  | typeof UI_SECTION_STATUS_WARNING
  | typeof UI_SECTION_STATUS_ERROR
  | typeof UI_SECTION_STATUS_LOADING

export type UiModalSize = typeof UI_MODAL_SIZE_SM | typeof UI_MODAL_SIZE_LG | typeof UI_MODAL_SIZE_XL

export type UiModalBackdrop =
  | typeof UI_MODAL_BACKDROP_STATIC
  | typeof UI_MODAL_BACKDROP_ENABLED
  | typeof UI_MODAL_BACKDROP_DISABLED

export type UiSidePanelPlacement = typeof UI_SIDE_PANEL_PLACEMENT_START | typeof UI_SIDE_PANEL_PLACEMENT_END

export type UiButtonVariant =
  | typeof UI_BUTTON_VARIANT_PRIMARY
  | typeof UI_BUTTON_VARIANT_SECONDARY
  | typeof UI_BUTTON_VARIANT_OUTLINE
  | typeof UI_BUTTON_VARIANT_GHOST

export type UiTagVariant =
  | typeof UI_TAG_VARIANT_NEUTRAL
  | typeof UI_TAG_VARIANT_SUCCESS
  | typeof UI_TAG_VARIANT_INFO
  | typeof UI_TAG_VARIANT_WARNING

export type UiHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type UiAbilityConfig = {
  action: AbilityAction
  subject: AbilitySubject
  mode?: typeof UI_VISIBILITY_MODE_HIDE | typeof UI_VISIBILITY_MODE_DISABLE
  fallback?: ReactNode | ((allowed: boolean) => ReactNode)
}

export type UiVisibilityProps = {
  ability?: UiAbilityConfig
  permissionKey?: PermissionKey
  permissionFallback?: ReactNode | (() => ReactNode)
}

export type UiCommonProps = UiVisibilityProps & {
  className?: string
  testId?: string
}

export type UiSelectOption = UiVisibilityProps & {
  value: string
  label: ReactNode
  disabled?: boolean
}

export type UiKeyValueItem = {
  id: string
  label: ReactNode
  value: ReactNode
  emphasize?: boolean
}

export type UiBreadcrumbItem = {
  id: string
  label: ReactNode
  href?: string
  onClick?: () => void
  active?: boolean
}

export type UiSummaryCardItem = {
  id: string
  label: ReactNode
  value: ReactNode
  icon?: ReactNode
  trend?: ReactNode
  testId?: string
}

export type UiCardListItem = {
  id: string
  title: ReactNode
  subtitle?: ReactNode
  body?: ReactNode
  footer?: ReactNode
  icon?: ReactNode
  onClick?: () => void
  testId?: string
}

export type UiTagItem = {
  id: string
  label: ReactNode
  variant?: UiTagVariant
}

export type UiSidebarNavItem = UiVisibilityProps & {
  id: string
  label: ReactNode
  icon?: ReactNode
  href?: string
  active?: boolean
  badge?: ReactNode
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export type UiSectionStatusMeta = {
  timestamp?: ReactNode
  helperText?: ReactNode
}

export type UiModalAction = {
  id: string
  label: ReactNode
  variant?: UiButtonVariant
  onClick: () => void
  disabled?: boolean
  testId?: string
}

export type UiDataTableSortState = {
  columnId: string
  direction: UiSortDirection
}

export type UiDataTableColumn<TData> = {
  id: string
  header: ReactNode
  cell: (row: TData) => ReactNode
  textAlign?: UiTextAlign
  widthClass?: string
  sortable?: boolean
}

export type UiDataTableSelection<TData> = {
  selectedIds: readonly string[]
  onToggleRow: (row: TData) => void
  onToggleAll?: (rows: readonly TData[]) => void
}

export type AppShellProps = PropsWithChildren<
  UiCommonProps & {
    sidebar?: ReactNode
    topBar?: ReactNode
    bottomBar?: ReactNode
    sidebarWidthClass?: string
  }
>

export type PageProps = PropsWithChildren<
  UiCommonProps & {
    variant?: UiPageVariant
    fullHeight?: boolean
  }
>

export type PageHeaderProps = UiCommonProps & {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  breadcrumbs?: ReactNode
}

export type StackProps = PropsWithChildren<
  UiCommonProps & {
    gap?: UiStackGap
    direction?: UiStackDirection
    align?: UiStackAlign
    justify?: UiStackJustify
    wrap?: boolean
    as?: keyof JSX.IntrinsicElements
  }
>

export type SidebarLayoutProps = PropsWithChildren<
  UiCommonProps & {
    sidebar: ReactNode
    stickySidebar?: boolean
    sidebarWidthClass?: string
  }
>

export type HeadingProps = PropsWithChildren<
  UiCommonProps & {
    level?: UiHeadingLevel
    align?: UiTextAlign
    eyebrow?: ReactNode
    badge?: ReactNode
  }
>

export type BodyTextProps = PropsWithChildren<
  UiCommonProps & {
    lead?: boolean
    as?: keyof JSX.IntrinsicElements
  }
>

export type BadgeTextProps = UiCommonProps & {
  text: ReactNode
  variant?: UiBadgeVariant
  pill?: boolean
  icon?: ReactNode
}

export type KeyValueListProps = UiCommonProps & {
  items: readonly UiKeyValueItem[]
}

export type EmptyStateProps = UiCommonProps & {
  icon?: ReactNode
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
}

export type UiFormFieldRenderProps = {
  controlId: string
  describedBy?: string
}

export type UiFormFieldRender = (props: UiFormFieldRenderProps) => ReactNode

export type FormFieldProps = UiCommonProps & {
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  layout?: UiFormLayout
  children: ReactNode | UiFormFieldRender
}

export type FormRowProps = PropsWithChildren<
  UiCommonProps & {
    columns?: UiFormRowColumns
  }
>

export type FormSectionProps = PropsWithChildren<
  UiCommonProps & {
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
  }
>

export type CheckboxFieldProps<TFieldValues extends FieldValues> = UiCommonProps & {
  name: Path<TFieldValues>
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  required?: boolean
  type?: UiFormCheckType
}

export type SwitchFieldProps<TFieldValues extends FieldValues> = CheckboxFieldProps<TFieldValues>

export type DateFieldProps<TFieldValues extends FieldValues> = UiCommonProps & {
  name: Path<TFieldValues>
  label: ReactNode
  description?: ReactNode
  min?: string
  max?: string
  placeholder?: ReactNode
  disabled?: boolean
}

export type TextFieldProps<TFieldValues extends FieldValues> = UiCommonProps & {
  name: Path<TFieldValues>
  label: ReactNode
  description?: ReactNode
  type?: UiFormControlTextType
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  required?: boolean
  validateNames?: readonly Path<TFieldValues>[]
}

export type SelectFieldPropsBase<TFieldValues extends FieldValues> = UiCommonProps & {
  name: Path<TFieldValues>
  label: ReactNode
  options: readonly UiSelectOption[]
  description?: ReactNode
  placeholder?: ReactNode
  disabled?: boolean
  required?: boolean
  multiple?: boolean
}

export type TextareaFieldProps<TFieldValues extends FieldValues> = UiCommonProps & {
  name: Path<TFieldValues>
  label: ReactNode
  description?: ReactNode
  rows?: number
  maxLength?: number
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export type FormActionsProps = PropsWithChildren<
  UiCommonProps & {
    align?: 'start' | 'center' | 'end' | 'between'
  }
>

export type UiActionMenuItem = UiVisibilityProps & {
  id: string
  label: ReactNode
  icon?: ReactNode
  onSelect: () => void
  disabled?: boolean
  testId?: string
}

export type ActionMenuProps = UiCommonProps & {
  items: readonly UiActionMenuItem[]
  buttonLabel?: ReactNode
  variant?: 'primary' | 'secondary' | 'outline-secondary' | 'link'
  size?: 'sm' | 'lg'
  align?: 'start' | 'end'
  ariaLabel?: string
}

export type DataTableProps<TData> = UiCommonProps & {
  data: readonly TData[]
  columns: readonly UiDataTableColumn<TData>[]
  rowKey: (row: TData) => string
  emptyState?: ReactNode
  isLoading?: boolean
  toolbar?: ReactNode
  density?: UiTableDensity
  sortState?: UiDataTableSortState
  onSort?: (columnId: string, direction: UiSortDirection) => void
  selection?: UiDataTableSelection<TData>
  stickyHeader?: boolean
  footer?: ReactNode
}

export type TableToolbarProps = PropsWithChildren<
  UiCommonProps & {
    start?: ReactNode
    end?: ReactNode
    ariaLabel?: string
  }
>

export type SummaryListProps = UiCommonProps & {
  items: readonly UiSummaryCardItem[]
}

export type CardListProps = UiCommonProps & {
  items: readonly UiCardListItem[]
  columns?: UiFormRowColumns
}

export type TagListProps = UiCommonProps & {
  tags: readonly UiTagItem[]
}

export type ChipProps = UiCommonProps & {
  label: ReactNode
  variant?: UiTagVariant
  icon?: ReactNode
  onRemove?: () => void
  removeLabel?: string
}

export type SidebarNavProps = UiCommonProps & {
  items: readonly UiSidebarNavItem[]
  onSelect?: (item: UiSidebarNavItem) => void
}

export type TopNavBarProps = UiCommonProps & {
  brand?: ReactNode
  navigation?: ReactNode
  actions?: ReactNode
  fixed?: boolean
}

export type BreadcrumbsProps = UiCommonProps & {
  items: readonly UiBreadcrumbItem[]
}

export type InlineAlertProps = UiCommonProps & {
  variant?: UiAlertVariant
  title?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  dismissible?: boolean
  onClose?: () => void
}

export type SectionStatusProps = UiCommonProps & {
  status: UiSectionStatusVariant
  title: ReactNode
  message?: ReactNode
  meta?: UiSectionStatusMeta
  actions?: ReactNode
}

export type ModalDialogProps = UiCommonProps & {
  show: boolean
  onClose: () => void
  title?: ReactNode
  body?: ReactNode
  footer?: ReactNode
  primaryAction?: UiModalAction
  secondaryAction?: UiModalAction
  size?: UiModalSize
  backdrop?: UiModalBackdrop
  centered?: boolean
  scrollable?: boolean
}

export type SidePanelProps = PropsWithChildren<
  UiCommonProps & {
    show: boolean
    onClose: () => void
    title?: ReactNode
    footer?: ReactNode
    placement?: UiSidePanelPlacement
    actions?: ReactNode
    sizeClass?: string
  }
>
