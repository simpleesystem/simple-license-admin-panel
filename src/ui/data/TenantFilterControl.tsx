import { UI_TENANT_FILTER_LABEL } from '../constants'
import type { UiSelectOption } from '../types'
import { TableFilter } from './TableFilter'

type TenantFilterControlProps = {
  show: boolean
  value: string
  options: readonly UiSelectOption[]
  onChange?: (tenantId: string) => void
  label?: string
}

export function TenantFilterControl({ show, value, options, onChange, label }: TenantFilterControlProps) {
  if (!show || !onChange) {
    return null
  }

  return <TableFilter label={label ?? UI_TENANT_FILTER_LABEL} value={value} options={options} onChange={onChange} />
}
