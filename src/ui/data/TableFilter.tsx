import type { ChangeEvent } from 'react'
import { useId } from 'react'
import Form from 'react-bootstrap/Form'

import {
  UI_CLASS_MARGIN_RESET,
  UI_SIZE_SMALL,
  UI_TABLE_CONTROL_MIN_WIDTH,
  UI_TABLE_FILTER_MAX_WIDTH,
} from '../constants'
import type { UiSelectOption } from '../types'

type TableFilterSharedProps = {
  label?: string
  options: readonly UiSelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

type SingleSelectTableFilterProps = TableFilterSharedProps & {
  multiple?: false
  value: string
  onChange: (value: string) => void
}

type MultiSelectTableFilterProps = TableFilterSharedProps & {
  multiple: true
  value: readonly string[]
  onChange: (value: string[]) => void
}

export type TableFilterProps = SingleSelectTableFilterProps | MultiSelectTableFilterProps

export function TableFilter({
  label,
  value,
  options,
  onChange,
  placeholder,
  className,
  disabled,
  multiple = false,
}: TableFilterProps) {
  const selectId = useId()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.multiple) {
      const selectedValues = Array.from(event.target.selectedOptions, (option) => option.value).filter(
        (selectedValue) => selectedValue !== ''
      )
      ;(onChange as (value: string[]) => void)(selectedValues)
      return
    }
    ;(onChange as (value: string) => void)(event.target.value)
  }

  return (
    <div className={`d-flex flex-column align-items-start gap-1 ${className ?? ''}`}>
      {label ? (
        <label htmlFor={selectId} className={`form-label small text-muted fw-semibold ${UI_CLASS_MARGIN_RESET}`}>
          {label}
        </label>
      ) : null}
      <Form.Select
        id={selectId}
        size={UI_SIZE_SMALL}
        value={value as string | string[]}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        style={{ minWidth: UI_TABLE_CONTROL_MIN_WIDTH, maxWidth: UI_TABLE_FILTER_MAX_WIDTH }}
      >
        {placeholder && !multiple ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={String(option.value)} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </div>
  )
}
