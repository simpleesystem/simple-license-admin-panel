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
    label: resolveFieldLabel(config),
  }
}

export function createTableFilterField(
  config: Omit<TableFilterProps, 'label'> & TableFieldFactoryInput
): TableFilterProps {
  return {
    ...config,
    label: resolveFieldLabel(config),
  }
}
