import { type ChangeEvent, useId } from 'react'

import Form from 'react-bootstrap/Form'

import {
  UI_CLASS_MARGIN_RESET,
  UI_FORM_CONTROL_TYPE_SEARCH,
  UI_TABLE_SEARCH_MAX_WIDTH,
  UI_TABLE_SEARCH_PLACEHOLDER,
} from '../constants'

export type TableSearchInputProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TableSearchInput({
  label,
  value,
  onChange,
  placeholder = UI_TABLE_SEARCH_PLACEHOLDER,
  disabled,
}: TableSearchInputProps) {
  const inputId = useId()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className="d-flex flex-column align-items-start gap-1">
      {label ? (
        <label htmlFor={inputId} className={`form-label small text-muted fw-semibold ${UI_CLASS_MARGIN_RESET}`}>
          {label}
        </label>
      ) : null}
      <Form.Control
        id={inputId}
        type={UI_FORM_CONTROL_TYPE_SEARCH}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{ minWidth: '220px', maxWidth: UI_TABLE_SEARCH_MAX_WIDTH }}
      />
    </div>
  )
}
