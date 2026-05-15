import { type ChangeEvent, useId } from 'react'

import Form from 'react-bootstrap/Form'

import {
  UI_CLASS_TABLE_CONTROL_LABEL,
  UI_CLASS_TABLE_CONTROL_WRAPPER,
  UI_FORM_CONTROL_TYPE_SEARCH,
  UI_STYLE_TABLE_CONTROL_SEARCH,
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
    <div className={UI_CLASS_TABLE_CONTROL_WRAPPER}>
      {label ? (
        <label htmlFor={inputId} className={UI_CLASS_TABLE_CONTROL_LABEL}>
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
        style={UI_STYLE_TABLE_CONTROL_SEARCH}
      />
    </div>
  )
}
