import type { ChangeEvent } from 'react'
import { useId } from 'react'
import Form from 'react-bootstrap/Form'

import { UI_CLASS_MARGIN_RESET } from '../constants'
import type { UiSelectOption } from '../types'

export type TableFilterProps = {
  label?: string
  value: string
  options: readonly UiSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TableFilter({ label, value, options, onChange, placeholder, className, disabled }: TableFilterProps) {
  const selectId = useId()
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className={`d-flex align-items-center gap-2 ${className ?? ''}`}>
      {label ? (
        <label
          htmlFor={selectId}
          className={`form-label small text-muted text-uppercase fw-semibold ${UI_CLASS_MARGIN_RESET}`}
        >
          {label}
        </label>
      ) : null}
      <Form.Select
        id={selectId}
        size="sm"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{ minWidth: '140px', maxWidth: '200px' }}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={String(option.value)} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </div>
  )
}
