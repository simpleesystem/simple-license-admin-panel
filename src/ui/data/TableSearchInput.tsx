import type { ChangeEvent } from 'react'

import Form from 'react-bootstrap/Form'

import { UI_FORM_CONTROL_TYPE_SEARCH, UI_TABLE_SEARCH_MAX_WIDTH, UI_TABLE_SEARCH_PLACEHOLDER } from '../constants'

export type TableSearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TableSearchInput({
  value,
  onChange,
  placeholder = UI_TABLE_SEARCH_PLACEHOLDER,
  disabled,
}: TableSearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <Form.Control
      type={UI_FORM_CONTROL_TYPE_SEARCH}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      style={{ maxWidth: UI_TABLE_SEARCH_MAX_WIDTH }}
    />
  )
}
