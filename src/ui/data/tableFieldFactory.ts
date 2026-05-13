import {
  UI_TABLE_FILTER_LABEL_STATUS,
  UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES,
  UI_TABLE_SEARCH_LABEL,
  UI_TABLE_SEARCH_PLACEHOLDER,
} from '../constants'
import type { FieldLabelingPolicy } from './fieldLabeling'
import { resolveFieldLabel } from './fieldLabeling'
import type { TableControlsSearch } from './TableControls'
import type { TableFilterProps } from './TableFilter'

type TableFieldFactoryInput = {
  label?: string
  placeholder?: string
  labelPolicy?: FieldLabelingPolicy
}

export function createTableSearchField(
  config: Omit<TableControlsSearch, 'label'> & TableFieldFactoryInput
): TableControlsSearch {
  return {
    ...config,
    label: resolveFieldLabel({
      label: config.label,
      placeholder: config.placeholder,
      policy: config.labelPolicy,
    }),
  }
}

export function createTableFilterField<TFilter extends TableFilterProps>(
  config: Omit<TFilter, 'label'> & TableFieldFactoryInput
): TFilter {
  return {
    ...config,
    label: resolveFieldLabel({
      label: config.label,
      placeholder: config.placeholder,
      policy: config.labelPolicy,
    }),
  } as TFilter
}

export function createStandardTableSearchField(
  config: Omit<TableControlsSearch, 'label' | 'placeholder'> & TableFieldFactoryInput
): TableControlsSearch {
  return createTableSearchField({
    ...config,
    label: config.label ?? UI_TABLE_SEARCH_LABEL,
    placeholder: config.placeholder ?? UI_TABLE_SEARCH_PLACEHOLDER,
  })
}

export function createStandardStatusFilterField<TFilter extends TableFilterProps>(
  config: Omit<TFilter, 'label' | 'placeholder'> & TableFieldFactoryInput
): TFilter {
  return {
    ...config,
    label: config.label ?? UI_TABLE_FILTER_LABEL_STATUS,
    placeholder: config.placeholder ?? UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES,
  } as TFilter
}
