import type { ChangeEvent } from 'react'
import { useId } from 'react'
import Form from 'react-bootstrap/Form'

import {
  UI_CLASS_TABLE_CONTROL_LABEL,
  UI_CLASS_TABLE_CONTROL_SELECT,
  UI_CLASS_TABLE_CONTROL_WRAPPER,
  UI_SIZE_SMALL,
  UI_STYLE_TABLE_CONTROL_FILTER,
} from '../constants'
import type { UiSelectOption } from '../types'
import { composeClassNames } from '../utils/classNames'

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
    <div className={composeClassNames(UI_CLASS_TABLE_CONTROL_WRAPPER, className)}>
      {label ? (
        <label htmlFor={selectId} className={UI_CLASS_TABLE_CONTROL_LABEL}>
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
        className={UI_CLASS_TABLE_CONTROL_SELECT}
        style={UI_STYLE_TABLE_CONTROL_FILTER}
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
